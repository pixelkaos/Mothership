import React from 'react';

interface StatsPanelProps {
    thrusters: number;
    battle: number;
    systems: number;
    o2Remaining: number;
    onUpdate: (path: string, value: number) => void;
}

const StatDisplay: React.FC<{ label: string; value: number; path: string; onUpdate: (path: string, value: number) => void }> = ({ label, value, path, onUpdate }) => (
    <div className="text-center">
        <div className="w-20 h-20 rounded-full border-4 border-black flex items-center justify-center">
            <input
                type="number"
                value={value || ''}
                onChange={e => onUpdate(path, parseInt(e.target.value) || 0)}
                className="text-4xl font-bold w-16 text-center bg-transparent border-none focus:ring-0"
            />
        </div>
        <label className="mt-1 block">{label}</label>
    </div>
);

export const StatsPanel: React.FC<StatsPanelProps> = ({ thrusters, battle, systems, o2Remaining, onUpdate }) => {
    return (
        <div className="border-4 border-black p-2 flex flex-col items-center">
            <h3 className="text-center font-bold my-2">STATS & SAVES</h3>
            <div className="space-y-4 my-4">
                <StatDisplay label="THRUSTERS" value={thrusters} path="stats.thrusters" onUpdate={onUpdate} />
                <StatDisplay label="BATTLE" value={battle} path="stats.battle" onUpdate={onUpdate} />
                <StatDisplay label="SYSTEMS" value={systems} path="stats.systems" onUpdate={onUpdate} />
                <StatDisplay label="O2 REMAINING" value={o2Remaining} path="o2Remaining" onUpdate={onUpdate} />
            </div>
        </div>
    );
};