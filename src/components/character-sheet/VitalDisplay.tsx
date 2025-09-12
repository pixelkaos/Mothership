import React from 'react';

export const VitalDisplay: React.FC<{
    label: string;
    current: number;
    max: number;
    currentLabel: string;
    maxLabel: string;
}> = ({ label, current, max, currentLabel, maxLabel }) => (
    <div className="flex flex-col items-center text-center">
        <span className="text-primary uppercase text-sm font-bold tracking-wider mb-1">{label}</span>
        <div className="font-bold text-foreground">
            <span className="text-4xl">{current}</span>
            <span className="text-2xl text-muted"> / </span>
            <span className="text-4xl">{max}</span>
        </div>
         <div className="flex justify-between w-full mt-0.5 px-2">
            <span className="text-muted text-xs">{currentLabel}</span>
            <span className="text-muted text-xs">{maxLabel}</span>
        </div>
    </div>
);
