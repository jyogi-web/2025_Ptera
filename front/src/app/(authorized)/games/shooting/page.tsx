"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Script from "next/script";
import * as THREE from "three";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Text } from "@arwes/react";

// --- Configuration ---
const MP_HANDS_VERSION = "0.4.1646424915";
const MAX_ENEMIES = 4;
const AI_INTERVAL_MS = 33; // ~30 FPS for AI
const AIM_ASSIST_RADIUS = 0.3; // Normalized screen space

// --- Three.js & Game State Types ---
type Enemy = {
    id: string;
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    active: boolean;
};

type GameState = {
    score: number;
    health: number;
    isPlaying: boolean;
};

type FloatingText = {
    id: number;
    x: number;
    y: number;
    text: string;
    life: number; // 0-1
    color: string;
};

export default function ShootingGame() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { user } = useAuth(); // If needed for score saving
    const router = useRouter();

    // Loading States
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("Initializing...");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Game UI State
    const [score, setScore] = useState(0);
    const [debugMsg, setDebugMsg] = useState("-");
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

    // Mutable References for Performance (Game Loop)
    const gameRef = useRef({
        scene: null as THREE.Scene | null,
        camera: null as THREE.PerspectiveCamera | null,
        renderer: null as THREE.WebGLRenderer | null,
        enemies: [] as Enemy[],
        lasers: [] as THREE.Mesh[] | THREE.Line[],
        reticle: null as THREE.Mesh | null,
        lastTime: 0,
        handLandmarker: null as any, // MediaPipe object
        lastVideoTime: -1,
        lastAITime: 0,
        gesture: {
            isPistol: false,
            isTriggerPulled: false,
            aimPosition: new THREE.Vector2(0, 0), // Screen coords (-1 to 1)
            wasTriggerPulled: false, // For edge detection
        },
        audioCtx: null as AudioContext | null,
    });

    // --- 1. Initialization ---
    useEffect(() => {
        if (!isModelLoaded || !isCameraReady) return;

        initGame();
        // Cleanup
        return () => {
            stopGame();
        };
    }, [isModelLoaded, isCameraReady]);

    // Load Camera
    useEffect(() => {
        async function setupCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment",
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                        setIsCameraReady(true);
                    }
                }
            } catch (err) {
                console.error("Camera Error:", err);
                setErrorMsg("Camera permission denied or not available.");
            }
        }
        setupCamera();
    }, []);

    // --- 2. MediaPipe Integration ---
    const handleScriptLoad = async () => {
        setLoadingStatus("Loading AI Model...");
        try {
            const { Hands } = (window as any); // Loaded from global
            if (!Hands) throw new Error("MediaPipe Hands not found in window");

            const hands = new Hands({
                locateFile: (file: string) =>
                    `https://unpkg.com/@mediapipe/hands@${MP_HANDS_VERSION}/${file}`,
            });

            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            hands.onResults(onHandsResults);

            await hands.initialize();
            gameRef.current.handLandmarker = hands;
            setIsModelLoaded(true);
            setLoadingStatus("Ready!");
        } catch (e: any) {
            console.error("MediaPipe Init Error:", e);
            setErrorMsg(`AI Model Error: ${e.message}`);
        }
    };

    // Process AI Results
    const onHandsResults = (results: any) => {
        // Crash Protection: Wrap in try-catch if logic is complex
        try {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const landmarks = results.multiHandLandmarks[0];

                // --- Gesture Recognition Logic ---
                // Simple Index Finger Tip (8) vs Thumb Tip (4) logic
                // Normalized Coords: x, y, z (0-1)

                // 1. Detect Aim Point (Index Finger Tip)
                const indexTip = landmarks[8];

                const aimX = (1 - indexTip.x) * 2 - 1; // Flip X for mirror effect
                const aimY = -(indexTip.y * 2 - 1); // Flip Y because 3D y-up vs screen y-down

                gameRef.current.gesture.aimPosition.set(aimX, aimY);

                // 2. Detect Trigger (Thumb)
                // We use relative distance to hand size to support different camera distances
                const wrist = landmarks[0];
                const indexMCP = landmarks[5]; // Knuckle

                // Calculate Hand Scale (Wrist to Index Knuckle is a stable reference)
                const handScale = Math.hypot(indexMCP.x - wrist.x, indexMCP.y - wrist.y);

                // Measure Thumb Tip (4) distance to Middle Finger Base (9) (Hammer down position)
                const thumbTip = landmarks[4];
                const middleMCP = landmarks[9];
                const triggerDist = Math.hypot(thumbTip.x - middleMCP.x, thumbTip.y - middleMCP.y);

                // Ratio: If dist is small relative to hand scale, trigger is squeezed
                // Threshold: 0.6 of hand scale seems reasonable for "tucked thumb"
                // Open hand thumb is usually > 1.0 scale away
                const ratio = triggerDist / (handScale || 1); // Avoid div 0
                const isTriggerActive = ratio < 0.65;

                gameRef.current.gesture.isPistol = true; // Assume pistol if hand found for now
                gameRef.current.gesture.isTriggerPulled = isTriggerActive;

                // Debug
                setDebugMsg(`TrigRatio: ${ratio.toFixed(2)} / 0.65 | ${isTriggerActive ? "FIRE" : "OPEN"}`);
            } else {
                gameRef.current.gesture.isPistol = false;
                setDebugMsg("No Hand Detected");
            }
        } catch (err) {
            console.warn("Hand Process Error", err);
        }
    };

    // --- 3. Three.js Game Loop ---
    const initGame = () => {
        if (!canvasRef.current || !containerRef.current) return;

        // SCENE
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.15); // Cyber fog

        // CAMERA
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        // FOV 75 is standard for gaming
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
        camera.position.z = 5;

        // RENDERER
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: false, // Opaque for black background
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // VISUALS: Cyber Grid
        const gridHelper = new THREE.GridHelper(30, 30, 0x00ffff, 0x222222);
        gridHelper.rotation.x = Math.PI / 2; // Flat grid facing camera? No, floor.
        // Let's make a "tunnel" or floor/ceiling
        gridHelper.position.y = -4;
        scene.add(gridHelper);

        const gridTop = new THREE.GridHelper(30, 30, 0xff00ff, 0x222222);
        gridTop.position.y = 4;
        scene.add(gridTop);

        // LIGHTING
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);

        // GAME OBJECTS: Reticle
        const reticleGeo = new THREE.RingGeometry(0.05, 0.07, 32);
        const reticleMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const reticle = new THREE.Mesh(reticleGeo, reticleMat);
        scene.add(reticle);
        gameRef.current.reticle = reticle;

        // INIT REF
        gameRef.current.scene = scene;
        gameRef.current.camera = camera;
        gameRef.current.renderer = renderer;

        // Laser Line (Visual)
        const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
        const laserMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });
        const laser = new THREE.Line(laserGeo, laserMat);
        laser.frustumCulled = false; // Always render
        scene.add(laser);
        gameRef.current.lasers = [laser];

        // AUDIO
        gameRef.current.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

        // CLOCK
        const clock = new THREE.Clock();

        // START LOOP
        const loop = () => {
            gameLoop(clock);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    };

    const playSound = (type: "shoot" | "hit") => {
        const ctx = gameRef.current.audioCtx;
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "shoot") {
            osc.type = "square";
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } else if (type === "hit") {
            // High pitched ping
            osc.type = "sine";
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        }
    };

    const stopGame = () => {
        // Cleanup Three.js resources if needed
        // Simple page unmount logic usually handles context loss, but explicit dispose is better
        gameRef.current.scene?.clear();
        gameRef.current.enemies = [];
        gameRef.current.renderer?.dispose();
    };

    const gameLoop = (clock: THREE.Clock) => {
        if (!gameRef.current.renderer || !gameRef.current.scene || !gameRef.current.camera) return;

        // Delta Time for smooth movement
        const delta = clock.getDelta();

        // 1. AI Throttling
        const now = performance.now();
        if (gameRef.current.handLandmarker && videoRef.current && videoRef.current.readyState >= 2) {
            if (now - gameRef.current.lastAITime >= AI_INTERVAL_MS) {
                gameRef.current.lastAITime = now;
                // AI reads from hidden video element
                gameRef.current.handLandmarker.send({ image: videoRef.current });
            }
        }

        // 2. Game Logic
        updateGameLogic(delta);

        // 3. Render
        gameRef.current.renderer.render(gameRef.current.scene, gameRef.current.camera);
    };

    const updateGameLogic = (delta: number) => {
        const { camera, scene, enemies, gesture, reticle } = gameRef.current;
        if (!camera || !scene || !reticle) return;

        // Normalize speed: delta is seconds. 
        // Targeted 60fps (16ms). If delta is 0.016, factor is 1.
        // Base speeds were tuned for ~1 frame. 
        // Let's treat existing velocity values as "per frame at 60fps" -> multiply by (delta * 60)
        const timeScale = delta * 60;

        // --- Aim Update ---
        // Project 2D normalized aim to 3D plane at a certain depth (e.g. z=0 where enemies are?)
        // Actually enemies spawn at edges and fly to center.
        // Let's keep Reticle at fixed distance (z=0) for simpler feel.
        // Camera is at z=5.

        // Unproject needs (x, y, z) where z is 0.5 for mid-frustum, but we want world intesection.
        // Simpler: Map ND coordinates to valid frustum plane at z=0.
        const vector = new THREE.Vector3(gesture.aimPosition.x, gesture.aimPosition.y, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z; // dist to z=0 plane
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));

        // Magnetic Aim Assist (snap to closest enemy)
        let finalAimPos = pos.clone();
        let closestDist = Infinity;
        let targetEnemy: Enemy | null = null;

        // Check enemies
        enemies.forEach(enemy => {
            if (!enemy.active) return;
            const dist = pos.distanceTo(enemy.mesh.position);
            if (dist < AIM_ASSIST_RADIUS * 5) { // Scale radius to world units roughly
                if (dist < closestDist) {
                    closestDist = dist;
                    targetEnemy = enemy;
                }
            }
        });

        if (targetEnemy) {
            // Linear Interpolate for smooth snap
            finalAimPos.lerp((targetEnemy as Enemy).mesh.position, 0.2 * timeScale);
            (reticle.material as THREE.MeshBasicMaterial).color.setHex(0xff0000); // Red when locked
        } else {
            (reticle.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00); // Green normally
        }

        reticle.position.copy(finalAimPos);

        // Update Laser Line
        updateLaser(pos, finalAimPos, gesture.isPistol);

        // --- Shooting ---
        if (gesture.isPistol && gesture.isTriggerPulled && !gesture.wasTriggerPulled) {
            // FIRE!
            handleShoot(finalAimPos);
        }
        gameRef.current.gesture.wasTriggerPulled = gesture.isTriggerPulled;

        // --- Enemy Spawning & Movement ---
        // Ensure enemies count
        if (gameRef.current.enemies.filter(e => e.active).length < MAX_ENEMIES) {
            spawnEnemy();
        }

        gameRef.current.enemies.forEach(enemy => {
            if (!enemy.active) return;
            // Move in X/Y plane with TimeScale
            const moveStep = enemy.velocity.clone().multiplyScalar(timeScale);
            enemy.mesh.position.add(moveStep);
            enemy.mesh.rotation.z += 0.05 * timeScale; // Spin

            // Bounce off edges (Approximate view bounds at z=0)
            // Visible width ~12, Height ~8 at z=0 with current camera setup?
            // Let's constrain to x: -5 to 5, y: -3 to 3
            if (enemy.mesh.position.x > 5 || enemy.mesh.position.x < -5) {
                enemy.velocity.x *= -1;
                // Push back to avoid stickiness
                enemy.mesh.position.x = Math.sign(enemy.mesh.position.x) * 4.9;
            }
            if (enemy.mesh.position.y > 3 || enemy.mesh.position.y < -3) {
                enemy.velocity.y *= -1;
                enemy.mesh.position.y = Math.sign(enemy.mesh.position.y) * 2.9;
            }
        });
    };

    const spawnEnemy = () => {
        // Spawn within visible area
        const x = (Math.random() - 0.5) * 8; // -4 to 4
        const y = (Math.random() - 0.5) * 5; // -2.5 to 2.5

        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
        geometry.rotateX(Math.PI / 2); // Make it a disc
        const material = new THREE.MeshPhongMaterial({ color: 0xff00ff, shininess: 100 });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(x, y, 0); // Start at z=0 fixed plane

        // Random 2D Velocity
        const speed = 0.03 + Math.random() * 0.03;
        const angle = Math.random() * Math.PI * 2;
        const velocity = new THREE.Vector3(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            0
        );

        gameRef.current.scene?.add(mesh);
        gameRef.current.enemies.push({
            id: Math.random().toString(),
            mesh,
            velocity,
            active: true
        });
    };

    const recycleEnemy = (enemy: Enemy) => {
        // Remove from scene and array (or reset). Simple remove for MVP.
        enemy.active = false;
        gameRef.current.scene?.remove(enemy.mesh);
        gameRef.current.enemies = gameRef.current.enemies.filter(e => e !== enemy);
    };

    const handleShoot = (atPosition: THREE.Vector3) => {
        playSound("shoot");
        // Check collision
        let hit = false;

        // Screen pos for text (Project atPosition back to screen for text)
        const screenPos = atPosition.clone().project(gameRef.current.camera!);
        // x,y are -1 to 1. Convert to CSS pixels.
        const x = (screenPos.x + 1) / 2 * window.innerWidth;
        const y = -(screenPos.y - 1) / 2 * window.innerHeight;

        gameRef.current.enemies.forEach(enemy => {
            if (!enemy.active) return;
            if (enemy.mesh.position.distanceTo(atPosition) < 0.8) { // Hit radius
                hit = true;
                recycleEnemy(enemy);
                setScore(s => s + 100);
                playSound("hit");
            }
        });

        addFloatingText(hit ? "HIT!" : "MISS", x, y, hit ? "#00ff00" : "#555");
    };

    const addFloatingText = (text: string, x: number, y: number, color: string) => {
        const id = Date.now() + Math.random();
        setFloatingTexts(prev => [...prev, { id, x, y, text, life: 1, color }]);
        // Simple timeout to clear (state driven animation might be better but this is MVP)
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(t => t.id !== id));
        }, 800);
    };

    const updateLaser = (start: THREE.Vector3, end: THREE.Vector3, visible: boolean) => {
        const laser = gameRef.current.lasers[0] as THREE.Line;
        if (!laser || !laser.geometry) return;

        if (visible) {
            const positions = laser.geometry.attributes.position.array as Float32Array;
            // Line from 'start' (near camera/hand) to 'end' (reticle)
            positions[0] = start.x;
            positions[1] = start.y - 0.2; // Offset slightly below camera to feel like held item
            positions[2] = start.z;
            positions[3] = end.x;
            positions[4] = end.y;
            positions[5] = end.z;
            laser.geometry.attributes.position.needsUpdate = true;
            laser.visible = true;
        } else {
            laser.visible = false;
        }
    };


    // --- Render ---
    return (
        <div className="relative w-full h-screen bg-black overflow-hidden" ref={containerRef}>

            {/* Scripts */}
            <Script
                src={`https://unpkg.com/@mediapipe/hands@${MP_HANDS_VERSION}/hands.js`}
                onLoad={handleScriptLoad}
                strategy="afterInteractive"
            />

            {/* Camera Feed (Background) - HIDDEN */}
            <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100 opacity-0 pointer-events-none"
                playsInline
                muted
            />

            {/* 3D Overlay */}
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />

            {/* Loading Overlay */}
            {(!isModelLoaded || !isCameraReady) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50 flex-col gap-4">
                    <div className="text-cyan-400 text-2xl font-bold tracking-widest animate-pulse">
                        SYSTEM_INITIALIZING
                    </div>
                    <div className="text-gray-400 font-mono">
                        {loadingStatus}
                    </div>
                    {errorMsg && (
                        <div className="text-red-500 font-mono text-sm max-w-md text-center p-4 border border-red-900 bg-red-900/20">
                            FATAL ERROR: {errorMsg}
                        </div>
                    )}
                </div>
            )}

            {/* Game HUD */}
            {isModelLoaded && (
                <div className="absolute z-10 p-4 w-full pointer-events-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <Text as="h2" className="text-cyan-400 text-xl font-bold m-0" style={{ textShadow: "0 0 10px #0ff" }}>
                                SCORE: {score.toString().padStart(6, '0')}
                            </Text>
                            <p className="text-xs text-gray-500 font-mono mt-1">
                                FPS: -- | {debugMsg}
                            </p>
                        </div>

                        <button
                            onClick={() => router.push('/games')}
                            className="pointer-events-auto bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500 px-4 py-2 text-sm font-mono transition-colors"
                        >
                            ABORT_MISSION
                        </button>
                    </div>

                    {/* Crosshair (CSS Fallback or decorative) */}
                    <div className="absolute top-1/2 left-1/2 w-8 h-8 -ml-4 -mt-4 border border-cyan-500/30 rounded-full opacity-50" />

                    {/* Floating Texts */}
                    {floatingTexts.map(ft => (
                        <div
                            key={ft.id}
                            className="absolute pointer-events-none font-black text-2xl tracking-widest"
                            style={{
                                left: ft.x,
                                top: ft.y,
                                color: ft.color,
                                transform: `translate(-50%, -50%) scale(${0.5 + ft.life})`,
                                opacity: ft.life,
                                textShadow: "0 0 5px black",
                                transition: "opacity 0.8s, transform 0.8s",
                            }}
                        >
                            {ft.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
