import React, { useMemo } from 'react';
import { useTooltip } from '../Tooltip';

export const StatInput: React.FC<{
    label: string;
    id: string;
    value: number;
    baseValue?: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    tooltipContent: React.ReactNode;
    onRollRequest?: () => void;
}> = ({ label, id, value, baseValue, onChange, tooltipContent, onRollRequest }) => {
    const { showTooltip, hideTooltip } = useTooltip();
    
    const fullTooltipContent = useMemo(() => {
        const baseRollInfo = (baseValue !== undefined && value !== baseValue && baseValue !== 0)
            ? <p className="text-xs text-secondary mt-2 italic">The number in brackets is your base roll before class modifiers.</p>
            : null;

        const rollPrompt = onRollRequest ? <p className="text-xs text-primary mt-2 italic">Click anywhere on this component to open the dice roller.</p> : null;

        return (
            <>
                {tooltipContent}
                {baseRollInfo}
                {rollPrompt}
            </>
        );
    }, [tooltipContent, baseValue, value, onRollRequest]);

    const commonClasses = `w-12 h-8 bg-transparent border border-muted text-center text-2xl font-bold text-foreground mt-1 focus:ring-0 focus:outline-none focus:border-primary appearance-none transition-colors group-hover:border-primary`;

    return (
        <div 
            className={`flex flex-col items-center group ${onRollRequest ? 'cursor-pointer' : ''}`}
            onMouseEnter={(e) => showTooltip(fullTooltipContent, e)}
            onMouseLeave={hideTooltip}
            onClick={onRollRequest}
        >
            <span id={`${id}-label`} className="text-xs uppercase text-muted">{label}</span>
            <div className="relative">
                 <input
                    id={id}
                    aria-labelledby={`${id}-label`}
                    type="number"
                    className={commonClasses}
                    value={value || ''}
                    onChange={onChange}
                    placeholder=" "
                    onClick={(e) => { e.stopPropagation(); onRollRequest?.(); }}
                />
                 {(!value || value === 0) && onRollRequest && (
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute inset-0 m-auto h-6 w-6 text-primary/50 pointer-events-none group-hover:text-primary transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                )}
                 {baseValue !== undefined && value !== baseValue && baseValue !== 0 && (
                    <span className={`absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs mt-1 ${value > baseValue ? 'text-positive' : 'text-danger'}`}>
                        ({baseValue})
                    </span>
                )}
            </div>
        </div>
    );
};