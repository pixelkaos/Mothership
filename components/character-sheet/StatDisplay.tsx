import React from 'react';

export const StatDisplay: React.FC<{
    label: string;
    value: number;
    onClick?: () => void;
}> = ({ label, value, onClick }) => (
    <div className={`flex flex-col items-center ${onClick ? 'cursor-pointer group' : ''}`} onClick={onClick}>
        <div className={`w-16 h-16 border-2 border-primary/50 rounded-full flex items-center justify-center bg-black/30 transition-colors ${onClick ? 'group-hover:bg-primary/20 group-hover:border-primary' : ''}`}>
            <span className="text-primary font-bold text-3xl">{value}</span>
        </div>
        <span className="text-muted uppercase text-xs font-bold tracking-wider mt-2">{label}</span>
    </div>
);
