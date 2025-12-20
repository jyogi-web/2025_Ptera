"use client";

import { Animator } from "@arwes/react";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";

interface CameraFABProps {
  activate: boolean;
}

export const CameraFAB = ({ activate }: CameraFABProps) => {
  const router = useRouter();

  return (
    <div className="fixed bottom-24 right-5 z-50">
      <Animator active={activate}>
        <button
          type="button"
          onClick={() => router.push("/camera")}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
          aria-label="カメラ"
        >
          <Camera
            size={28}
            strokeWidth={2}
            className="group-hover:rotate-12 transition-transform duration-300"
          />
        </button>
      </Animator>
    </div>
  );
};
