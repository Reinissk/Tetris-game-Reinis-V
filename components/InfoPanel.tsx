import React from 'react';

interface InfoPanelProps {
  score: number;
  level: number;
  lines: number;
  b2b: number;
  combo: number;
  coins?: number;
  isPlayer: boolean;
}

const InfoItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="bg-gray-800 p-2 rounded-md">
        <div className="text-xs text-gray-400 uppercase tracking-widest">{label}</div>
        <div className="text-xl font-bold text-right">{value}</div>
    </div>
);

const Badge: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className={`transition-opacity duration-200 ${value > 0 ? 'opacity-100' : 'opacity-20'}`}>
        <div className={`p-2 rounded-md text-center ${color}`}>
            <div className="font-bold">{label}</div>
            {value > 1 && <div className="text-sm">x{value}</div>}
        </div>
    </div>
);


const InfoPanel: React.FC<InfoPanelProps> = ({ score, level, lines, b2b, combo, coins, isPlayer }) => {
  return (
    <div className="w-40 flex flex-col gap-3">
        {isPlayer && coins !== undefined && <InfoItem label="Coins" value={coins.toLocaleString()} />}
        <InfoItem label="Score" value={score.toLocaleString()} />
        <InfoItem label="Level" value={level} />
        <InfoItem label="Lines" value={lines} />
        <div className="flex flex-col gap-2 mt-2">
            <Badge label="B2B" value={b2b} color="bg-orange-500" />
            <Badge label="Combo" value={combo} color="bg-purple-500" />
        </div>
    </div>
  );
};

export default InfoPanel;
