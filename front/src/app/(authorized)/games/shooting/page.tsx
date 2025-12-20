"use client";

import { Text } from "@arwes/react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

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
    // biome-ignore lint/suspicious/noExplicitAny: MediaPipe HandLandmarker type is complex
    handLandmarker: null as any,
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

  // --- 2. MediaPipe Integration ---
  const handleScriptLoad = async () => {
    setLoadingStatus("Loading AI Model...");
    try {
      const { Hands } = window as any;
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
    } catch (e: unknown) {
      console.error("MediaPipe Init Error:", e);
      const msg = e instanceof Error ? e.message : String(e);
      setErrorMsg(`AI Model Error: ${msg}`);
    }
  };

  // Process AI Results
  const onHandsResults = (results: any) => {
    try {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        // 1. Detect Aim Point (Index Finger Tip)
        const indexTip = landmarks[8];

        const aimX = (1 - indexTip.x) * 2 - 1; // Flip X for mirror effect
        const aimY = -(indexTip.y * 2 - 1); // Flip Y because 3D y-up vs screen y-down

        gameRef.current.gesture.aimPosition.set(aimX, aimY);

        // 2. Detect Trigger (Thumb scale invariant)
        const wrist = landmarks[0];
        const indexMCP = landmarks[5];
        const handScale = Math.hypot(
          indexMCP.x - wrist.x,
          indexMCP.y - wrist.y,
        );

        const thumbTip = landmarks[4];
        const middleMCP = landmarks[9];
        const triggerDist = Math.hypot(
          thumbTip.x - middleMCP.x,
          thumbTip.y - middleMCP.y,
        );

        const ratio = triggerDist / (handScale || 1);
        const isTriggerActive = ratio < 0.65;

        gameRef.current.gesture.isPistol = true;
        gameRef.current.gesture.isTriggerPulled = isTriggerActive;

        setDebugMsg(
          `TrigRatio: ${ratio.toFixed(2)} / 0.65 | ${isTriggerActive ? "FIRE" : "OPEN"}`,
        );
      } else {
        gameRef.current.gesture.isPistol = false;
        setDebugMsg("No Hand Detected");
      }
    } catch (err) {
      console.warn("Hand Process Error", err);
    }
  };

  const addFloatingText = useCallback(
    (text: string, x: number, y: number, color: string) => {
      const id = Date.now() + Math.random();
      setFloatingTexts((prev) => [...prev, { id, x, y, text, life: 1, color }]);
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
      }, 800);
    },
    [],
  );

  const playSound = useCallback((type: "shoot" | "hit") => {
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
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
  }, []);

  const recycleEnemy = useCallback((enemy: Enemy) => {
    enemy.active = false;
    gameRef.current.scene?.remove(enemy.mesh);
    gameRef.current.enemies = gameRef.current.enemies.filter(
      (e) => e !== enemy,
    );
  }, []);

  const handleShoot = useCallback(
    (atPosition: THREE.Vector3) => {
      playSound("shoot");
      let hit = false;

      if (!gameRef.current.camera) return;

      const screenPos = atPosition.clone().project(gameRef.current.camera);
      const x = ((screenPos.x + 1) / 2) * window.innerWidth;
      const y = (-(screenPos.y - 1) / 2) * window.innerHeight;

      gameRef.current.enemies.forEach((enemy) => {
        if (!enemy.active) return;
        if (enemy.mesh.position.distanceTo(atPosition) < 0.8) {
          hit = true;
          recycleEnemy(enemy);
          setScore((s) => s + 100);
          playSound("hit");
        }
      });

      addFloatingText(hit ? "HIT!" : "MISS", x, y, hit ? "#00ff00" : "#555");
    },
    [playSound, recycleEnemy, addFloatingText],
  );

  const updateLaser = useCallback(
    (start: THREE.Vector3, end: THREE.Vector3, visible: boolean) => {
      const laser = gameRef.current.lasers[0] as THREE.Line;
      if (!laser || !laser.geometry) return;

      if (visible) {
        const positions = laser.geometry.attributes.position
          .array as Float32Array;
        positions[0] = start.x;
        positions[1] = start.y - 0.2;
        positions[2] = start.z;
        positions[3] = end.x;
        positions[4] = end.y;
        positions[5] = end.z;
        laser.geometry.attributes.position.needsUpdate = true;
        laser.visible = true;
      } else {
        laser.visible = false;
      }
    },
    [],
  );

  const spawnEnemy = useCallback(() => {
    const x = (Math.random() - 0.5) * 8;
    const y = (Math.random() - 0.5) * 5;

    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
    geometry.rotateX(Math.PI / 2);
    const material = new THREE.MeshPhongMaterial({
      color: 0xff00ff,
      shininess: 100,
    });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, 0);

    const speed = 0.03 + Math.random() * 0.03;
    const angle = Math.random() * Math.PI * 2;
    const velocity = new THREE.Vector3(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      0,
    );

    gameRef.current.scene?.add(mesh);
    gameRef.current.enemies.push({
      id: Math.random().toString(),
      mesh,
      velocity,
      active: true,
    });
  }, []);

  const updateGameLogic = useCallback(
    (delta: number) => {
      const { camera, scene, enemies, gesture, reticle } = gameRef.current;
      if (!camera || !scene || !reticle) return;

      const timeScale = delta * 60;

      const vector = new THREE.Vector3(
        gesture.aimPosition.x,
        gesture.aimPosition.y,
        0.5,
      );
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));

      const finalAimPos = pos.clone();
      let closestDist = Infinity;
      let targetEnemy: Enemy | null = null;

      enemies.forEach((enemy) => {
        if (!enemy.active) return;
        const dist = pos.distanceTo(enemy.mesh.position);
        if (dist < AIM_ASSIST_RADIUS * 5) {
          if (dist < closestDist) {
            closestDist = dist;
            targetEnemy = enemy;
          }
        }
      });

      if (targetEnemy) {
        finalAimPos.lerp((targetEnemy as Enemy).mesh.position, 0.2 * timeScale);
        (reticle.material as THREE.MeshBasicMaterial).color.setHex(0xff0000);
      } else {
        (reticle.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00);
      }

      reticle.position.copy(finalAimPos);

      updateLaser(pos, finalAimPos, gesture.isPistol);

      if (
        gesture.isPistol &&
        gesture.isTriggerPulled &&
        !gesture.wasTriggerPulled
      ) {
        handleShoot(finalAimPos);
      }
      gameRef.current.gesture.wasTriggerPulled = gesture.isTriggerPulled;

      if (
        gameRef.current.enemies.filter((e) => e.active).length < MAX_ENEMIES
      ) {
        spawnEnemy();
      }

      gameRef.current.enemies.forEach((enemy) => {
        if (!enemy.active) return;
        const moveStep = enemy.velocity.clone().multiplyScalar(timeScale);
        enemy.mesh.position.add(moveStep);
        enemy.mesh.rotation.z += 0.05 * timeScale;

        if (enemy.mesh.position.x > 5 || enemy.mesh.position.x < -5) {
          enemy.velocity.x *= -1;
          enemy.mesh.position.x = Math.sign(enemy.mesh.position.x) * 4.9;
        }
        if (enemy.mesh.position.y > 3 || enemy.mesh.position.y < -3) {
          enemy.velocity.y *= -1;
          enemy.mesh.position.y = Math.sign(enemy.mesh.position.y) * 2.9;
        }
      });
    },
    [spawnEnemy, handleShoot, updateLaser],
  );

  const gameLoop = useCallback(
    (clock: THREE.Clock) => {
      if (
        !gameRef.current.renderer ||
        !gameRef.current.scene ||
        !gameRef.current.camera
      )
        return;

      const delta = clock.getDelta();

      const now = performance.now();
      if (
        gameRef.current.handLandmarker &&
        videoRef.current &&
        videoRef.current.readyState >= 2
      ) {
        if (now - gameRef.current.lastAITime >= AI_INTERVAL_MS) {
          gameRef.current.lastAITime = now;
          gameRef.current.handLandmarker.send({ image: videoRef.current });
        }
      }

      updateGameLogic(delta);

      gameRef.current.renderer.render(
        gameRef.current.scene,
        gameRef.current.camera,
      );
    },
    [updateGameLogic],
  );

  const stopGame = useCallback(() => {
    gameRef.current.scene?.clear();
    gameRef.current.enemies = [];
    gameRef.current.renderer?.dispose();
  }, []);

  const initGame = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.15);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const gridHelper = new THREE.GridHelper(30, 30, 0x00ffff, 0x222222);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.y = -4;
    scene.add(gridHelper);

    const gridTop = new THREE.GridHelper(30, 30, 0xff00ff, 0x222222);
    gridTop.position.y = 4;
    scene.add(gridTop);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const reticleGeo = new THREE.RingGeometry(0.05, 0.07, 32);
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    scene.add(reticle);
    gameRef.current.reticle = reticle;

    gameRef.current.scene = scene;
    gameRef.current.camera = camera;
    gameRef.current.renderer = renderer;

    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);
    const laserMat = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5,
    });
    const laser = new THREE.Line(laserGeo, laserMat);
    laser.frustumCulled = false;
    scene.add(laser);
    gameRef.current.lasers = [laser];

    gameRef.current.audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();

    const clock = new THREE.Clock();

    let animationFrameId: number;
    const loop = () => {
      gameLoop(clock);
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameLoop]);

  // --- 1. Initialization ---
  useEffect(() => {
    if (!isModelLoaded || !isCameraReady) return;

    const cleanupGame = initGame();
    return () => {
      if (cleanupGame) cleanupGame();
      stopGame();
    };
  }, [isModelLoaded, isCameraReady, initGame, stopGame]);

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
          };
        }
      } catch (err) {
        console.error("Camera Error:", err);
        setErrorMsg("Camera permission denied or not available.");
      }
    }
    setupCamera();
  }, []);

  // --- Render ---
  return (
    <div
      className="relative w-full h-screen bg-black overflow-hidden"
      ref={containerRef}
    >
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
          <div className="text-gray-400 font-mono">{loadingStatus}</div>
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
              <Text
                as="h2"
                className="text-cyan-400 text-xl font-bold m-0"
                style={{ textShadow: "0 0 10px #0ff" }}
              >
                SCORE: {score.toString().padStart(6, "0")}
              </Text>
              <p className="text-xs text-gray-500 font-mono mt-1">
                FPS: -- | {debugMsg}
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/games")}
              className="pointer-events-auto bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500 px-4 py-2 text-sm font-mono transition-colors"
            >
              ABORT_MISSION
            </button>
          </div>

          {/* Crosshair (CSS Fallback or decorative) */}
          <div className="absolute top-1/2 left-1/2 w-8 h-8 -ml-4 -mt-4 border border-cyan-500/30 rounded-full opacity-50" />

          {/* Floating Texts */}
          {floatingTexts.map((ft) => (
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
