
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { RollResult } from '../types';
import { parseAndRoll } from '../utils/dice';

interface DiceRollerProps {
    activeField: string | null;
    suggestedRoll: string | null;
    onApplyResult: (result: number) => void;
    isVisible: boolean;
    isMinimized: boolean;
    initialPosition: { x: number; y: number };
    onStateChange: (newState: { isVisible?: boolean; isMinimized?: boolean; position?: { x: number; y: number } }) => void;
}

const formatFieldName = (field: string | null): string => {
    if (!field) return '';
    return field.split('.').pop()?.replace(/_/g, ' ') || '';
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
    activeField,
    suggestedRoll,
    onApplyResult,
    isVisible,
    isMinimized,
    initialPosition,
    onStateChange
}) => {
    const [manualFormula, setManualFormula] = useState<string>('1d100');
    const [lastRoll, setLastRoll] = useState<RollResult | null>(null);
    const [error, setError] = useState<string>('');

    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const rollerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setPosition(initialPosition);
    }, [initialPosition]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!rollerRef.current) return;
        setIsDragging(true);
        const rect = rollerRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !rollerRef.current) return;
        let newX = e.clientX - dragOffset.current.x;
        let newY = e.clientY - dragOffset.current.y;

        const rollerWidth = rollerRef.current.offsetWidth;
        const rollerHeight = rollerRef.current.offsetHeight;
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + rollerWidth > window.innerWidth) newX = window.innerWidth - rollerWidth;
        if (newY + rollerHeight > window.innerHeight) newY = window.innerHeight - rollerHeight;

        setPosition({ x: newX, y: newY });
    }, [isDragging]);
    
    const positionRef = useRef(position);
    positionRef.current = position;

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            onStateChange({ position: positionRef.current });
        }
    }, [isDragging, onStateChange]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);
    
    const handleRoll = (formula: string | null) => {
        if (!formula) return;
        try {
            const result = parseAndRoll(formula);
            setLastRoll(result);
            setError('');
        } catch (e: any) {
            setError(e.message);
            setLastRoll(null);
        }
    };

    const handleApply = () => {
        if (lastRoll) {
            onApplyResult(lastRoll.total);
        }
    };

    const handleClose = () => onStateChange({ isVisible: false });
    const handleToggleMinimize = () => onStateChange({ isMinimized: !isMinimized });

    if (!isVisible) {
        return null;
    }

    return (
        <div
            ref={rollerRef}
            className="fixed w-72 bg-background border border-primary/80 shadow-2xl shadow-primary/20 z-50 text-sm"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                userSelect: isDragging ? 'none' : 'auto',
            }}
        >
            <div
                className="flex justify-between items-center p-2 bg-black/30 cursor-move"
                onMouseDown={handleMouseDown}
            >
                <h4 className="font-bold text-primary uppercase tracking-wider">Dice Roller</h4>
                <div className="flex items-center space-x-2">
                    <button onClick={handleToggleMinimize} className="text-primary/70 hover:text-primary" aria-label={isMinimized ? "Expand" : "Minimize"}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           {isMinimized ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />}
                        </svg>
                    </button>
                    <button onClick={handleClose} className="text-primary/70 hover:text-primary" aria-label="Close">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            
            {!isMinimized && (
                 <div className="p-4 space-y-3">
                    {suggestedRoll && activeField && (
                        <div className="text-center">
                            <p className="text-xs text-muted mb-1">Suggestion for <span className="font-bold capitalize">{formatFieldName(activeField)}</span>:</p>
                            <button 
                                onClick={() => handleRoll(suggestedRoll)}
                                className="w-full px-3 py-2 border border-primary text-primary uppercase tracking-widest hover:bg-primary/20 transition-colors"
                            >
                                Roll {suggestedRoll}
                            </button>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={manualFormula}
                            onChange={(e) => setManualFormula(e.target.value)}
                            className="flex-grow bg-black/50 border border-muted p-2 focus:ring-0 focus:outline-none focus:border-primary"
                            placeholder="e.g., 2d6+3"
                        />
                        <button onClick={() => handleRoll(manualFormula)} className="px-3 py-2 border border-primary text-primary hover:bg-primary/20">Roll</button>
                    </div>

                    {error && <p className="text-primary text-xs text-center">{error}</p>}

                    {lastRoll && (
                        <div className="border-t border-primary/50 pt-3 mt-3 text-center">
                            <p className="text-3xl font-bold text-secondary">{lastRoll.total}</p>
                            <p className="text-xs text-muted">
                                ({lastRoll.rolls.join(' + ')}{lastRoll.modifier !== 0 ? `) ${lastRoll.modifier > 0 ? '+' : '-'} ${Math.abs(lastRoll.modifier)}` : ')'}
                            </p>
                            {activeField && (
                                <button
                                    onClick={handleApply}
                                    className="mt-2 w-full px-3 py-2 bg-primary text-background uppercase tracking-widest hover:bg-primary-dark"
                                >
                                    Apply to <span className="capitalize">{formatFieldName(activeField)}</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};