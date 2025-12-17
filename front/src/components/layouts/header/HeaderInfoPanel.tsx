
import { Animator } from '@arwes/react';
import React from 'react';
import { Menu } from 'lucide-react';

type HeaderInfoPanelProps = {
    active: boolean;
    today: string;
    grade: string;
};

export const HeaderInfoPanel = ({ active, today, grade }: HeaderInfoPanelProps) => {
    return (
        <Animator active={active}>
            {/* 右パネル: 日付・学年・メニュー */}
            <div
                className="relative flex-1 w-full min-w-[200px] h-16 text-white z-0"
                style={{ filter: 'drop-shadow(0 0 1px #34d399)' }}
            >
                <div
                    className="h-full pl-8 pr-3 flex items-center justify-between bg-gradient-to-r from-emerald-900/90 to-teal-900/90"
                    style={{ clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0 100%)' }}
                >
                    <div className="relative z-10 flex flex-col items-center mr-4 flex-grow">
                        <div className="text-xs md:text-sm text-emerald-100 font-mono tracking-wider whitespace-nowrap">
                            {today}
                        </div>
                        <div className="text-sm md:text-base font-bold text-white tracking-widest whitespace-nowrap">
                            {grade}
                        </div>
                    </div>

                    {/* メニューボタン */}
                    <div className="relative z-10 border-l border-emerald-500/50 pl-3">
                        <button className="p-1.5 hover:bg-emerald-500/20 rounded-md transition-colors text-emerald-300 hover:text-emerald-100">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </Animator>
    );
};
