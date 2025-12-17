
import { Animator } from '@arwes/react';
import React from 'react';

type HeaderStatusPanelProps = {
    active: boolean;
    rank: number;
    cp: number;
};

export const HeaderStatusPanel = ({ active, rank = 0, cp = 0 }: HeaderStatusPanelProps) => {
    return (
        <Animator active={active}>
            <div
                className="relative flex-1 w-full min-w-[200px] h-16 text-white -mr-4 z-10"
                style={{ filter: 'drop-shadow(0 0 1px cyan)' }}
            >
                <div
                    className="h-full px-4 flex flex-col justify-center bg-gradient-to-r from-blue-900/90 to-cyan-900/90"
                    style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 20px) 100%, 0 100%)' }}
                >
                    <div className="relative z-10 flex flex-col space-y-0.5 pr-4">
                        {/* ランク */}
                        <div className="flex justify-between items-baseline">
                            <div className="font-bold text-cyan-100 text-xs md:text-sm whitespace-nowrap">
                                Rank: <span className="text-white text-sm md:text-base">{rank}</span>
                                <span className="text-xs text-cyan-300">（{rank >= 40 ? "部長級" : rank >= 30 ? "副部長級" : rank >= 20 ? "副部級" : rank >= 10 ? "部員級" : "新入部員"}）</span>
                            </div>
                        </div>
                        {/* プログレスバー */}
                        <div className="h-1.5 w-full bg-cyan-900/50 rounded-full overflow-hidden my-0.5">
                            <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 w-2/3 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                        </div>
                        {/* 部費 */}
                        <div className="text-xs md:text-sm text-cyan-200 font-mono whitespace-nowrap">
                            部費 : {cp} CP
                        </div>
                    </div>
                </div>
            </div>
        </Animator>
    );
};
