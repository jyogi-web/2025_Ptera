"use client";

import { Animator, Text } from "@arwes/react";
import type React from "react";

const activate = true;

export default function Logo(): React.JSX.Element {
  return (
    <div className="flex items-center space-x-2">
      <Animator active={activate}>
        <div className="font-orbitron text-2xl font-bold text-cyan-400 tracking-wider shadow-cyan-500 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
          <Text>Ptera</Text>
        </div>
      </Animator>
    </div>
  );
}
