import React from 'react';
import { useTooltip } from '../Tooltip';

export const SplitStatInput: React.FC<{
    label: string;
    id: string;
    currentValue: number;
    maxValue: number;
    onCurrentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onMaxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    tooltipContent: React.ReactNode;
    isMaxReadOnly?: boolean;
    onRollRequestCurrent?: () => void;
    onRollRequestMax?: () => void;
}> = ({ label, id, currentValue, maxValue, onCurrentChange, onMaxChange, tooltipContent, isMaxReadOnly = false, onRollRequestCurrent, onRollRequestMax }) => {
    const { showTooltip, hideTooltip } = useTooltip();
    
    const fullTooltipContent = (
        <>
            {tooltipContent}
            {(onRollRequestCurrent || onRollRequestMax) && (
                 <p className="text-xs text-primary mt-2 italic">Click a value to open the dice roller for it or type to edit.</p>
            )}
        </>
    );

    return (
        <div 
            className="flex flex-col items-center group"
            onMouseEnter={(e) => showTooltip(fullTooltipContent, e)}
            onMouseLeave={hideTooltip}
        >
            <span id={`${id}-label`} className="text-[var(--text-xs)] uppercase text-[var(--color-muted)] mb-[var(--space-1)]">{label}</span>
            <div className="relative flex items-center w-[var(--space-24)] h-[var(--space-8)] bg-transparent border border-[var(--color-muted)] rounded-full group-hover:border-[var(--color-primary)] transition-colors duration-normal px-[var(--space-4)] overflow-hidden">
                {/* Current Value Input */}
                <input
                    id={`${id}-current`}
                    aria-label={`${label} Current`}
                    type="number"
                    className={`w-1/2 bg-transparent text-center text-[var(--text-2xl)] font-bold text-[var(--color-fg)] focus:ring-0 focus:outline-none appearance-none z-10 ${onRollRequestCurrent ? 'cursor-pointer' : ''}`}
                    value={currentValue || ''}
                    onChange={onCurrentChange}
                    onClick={(e) => { e.stopPropagation(); onRollRequestCurrent?.(); }}
                    placeholder="0"
                />
                
                {/* Separator */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[125%] w-1 bg-[var(--color-muted)] transform rotate-[25deg] group-hover:bg-[var(--color-primary)] transition-colors duration-normal"></div>

                {/* Max Value Input */}
                <input
                    id={`${id}-max`}
                    aria-label={`${label} Maximum`}
                    type="number"
                    className={`w-1/2 bg-transparent text-center text-[var(--text-2xl)] font-bold text-[var(--color-fg)] focus:ring-0 focus:outline-none appearance-none z-10 ${onRollRequestMax ? 'cursor-pointer' : ''} ${isMaxReadOnly ? 'cursor-default' : ''}`}
                    value={maxValue || ''}
                    onChange={onMaxChange}
                    onClick={(e) => { e.stopPropagation(); onRollRequestMax?.(); }}
                    placeholder="0"
                    readOnly={isMaxReadOnly}
                />
            </div>
             <div className="flex justify-between w-[var(--space-24)] mt-[var(--space-1)] px-[var(--space-4)]">
                <span className="text-[var(--text-xs)] text-[var(--color-muted)]">Current</span>
                <span className="text-[var(--text-xs)] text-[var(--color-muted)]">Maximum</span>
            </div>
        </div>
    );
};