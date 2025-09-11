import React, { useState } from 'react';
import type { RollResult } from '../../types';
import { Button } from '../Button';

interface HistoryEntry extends RollResult {
    name: string;
    timestamp: number;
    success?: boolean;
    target?: number;
}

interface HistoryListProps {
    history: HistoryEntry[];
    onClear: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onClear }) => {
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    return (
        <div className="mt-space-4 border border-primary/50 bg-black/30">
            <button onClick={() => setIsHistoryVisible(!isHistoryVisible)} className="w-full flex justify-between items-center p-space-3 text-left font-bold uppercase tracking-wider hover:bg-primary/10 transition-colors" aria-expanded={isHistoryVisible}>
                <span>Roll History</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${isHistoryVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isHistoryVisible && (
                <div className="p-space-3 border-t border-primary/50">
                    {history.length === 0 ? <p className="text-sm text-muted text-center italic py-space-2">No rolls yet.</p> : (
                        <>
                            <ul className="space-y-space-2 text-sm max-h-48 overflow-y-auto pr-space-2">
                                {history.map(entry => (
                                    <li key={entry.timestamp} className="flex justify-between items-center bg-black/30 p-space-2">
                                        <div>
                                            <span className="font-bold text-foreground">{entry.name}</span>
                                            <span className="text-muted ml-space-2 font-mono">({entry.formula}) {entry.target && `vs ${entry.target}`}</span>
                                        </div>
                                        <span className={`text-lg font-bold ${entry.success === true ? 'text-positive' : entry.success === false ? 'text-danger' : 'text-foreground'}`}>{entry.total}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button variant="ghost" size="sm" onClick={onClear} className="w-full mt-space-3">Clear History</Button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};