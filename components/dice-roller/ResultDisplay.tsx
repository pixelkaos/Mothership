

import React from 'react';
import type { RollResult } from '../../types';
import { IconButton } from '../ui/IconButton';

interface HistoryEntry extends RollResult {
    name: string;
    timestamp: number;
    success?: boolean;
    target?: number;
    isCritical?: boolean;
}

interface ResultDisplayProps {
    result: HistoryEntry | null;
    onClear: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onClear }) => (
    <div className="relative flex-1 flex flex-col items-center justify-center p-4 border border-primary/50 min-h-[240px]">
        {result && (
            <IconButton onClick={onClear} className="absolute top-space-2 right-space-2" aria-label="Clear Result">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </IconButton>
        )}
        {result ? (
            <>
                <span className="text-9xl font-bold text-foreground">{result.total}</span>
                <div className="w-1/4 h-px bg-primary/50 my-4" />
                {result.target !== undefined && (
                     <span className={`text-2xl font-bold uppercase tracking-wider ${result.success ? 'text-positive' : 'text-negative'}`}>
                        {result.isCritical && 'CRITICAL '}
                        {result.success ? 'Success' : 'Failure'}
                    </span>
                )}
                <span className="text-sm text-muted mt-2 font-mono">
                    {result.name}
                    {result.target !== undefined && ` vs ${result.target}`}
                     ({result.rolls.join(', ')})
                </span>
            </>
        ) : (
            <span className="text-9xl font-bold text-muted/30">00</span>
        )}
    </div>
);