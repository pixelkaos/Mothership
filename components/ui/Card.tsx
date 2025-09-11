import React from 'react';
import { Panel } from './Panel';
import { Button } from '../Button';

interface CardProps {
    title: React.ReactNode;
    description: React.ReactNode;
    visualContent?: React.ReactNode;
    action?: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ title, description, visualContent, action, onClick, className }) => (
    <div
        className={`group transition-all duration-[var(--duration-2)] hover:-translate-y-[var(--space-1)] ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
    >
        <Panel 
            tone="default" 
            className="flex flex-col h-full text-left group-hover:bg-black/20 group-hover:border-[var(--color-muted)]/40 group-hover:shadow-[var(--shadow-elev-1)]"
        >
            {visualContent && (
                <div className="w-full aspect-video bg-black/50 relative border-b border-[var(--color-muted)]/50 flex items-center justify-center overflow-hidden -mt-[var(--space-4)] -mx-[var(--space-4)] mb-[var(--space-4)]">
                     {visualContent}
                </div>
            )}
            <div className="flex-grow">
                 <h3 className="text-xl font-semibold text-[var(--color-primary)] uppercase tracking-wider">{title}</h3>
                <div className="text-[var(--color-muted)] text-[var(--text-sm)] my-[var(--space-2)]">{description}</div>
            </div>
            {action && <div className="mt-[var(--space-4)]">{action}</div>}
        </Panel>
    </div>
);