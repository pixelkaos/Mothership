import React from 'react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/Button';

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
        className={`group transition-all duration-200 ease-standard hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
    >
        <Panel 
            tone="default" 
            className="flex flex-col h-full text-left group-hover:bg-black/20 group-hover:border-muted/40 group-hover:shadow-elev1"
        >
            {visualContent && (
                <div className="w-full aspect-video bg-black/50 relative border-b border-muted/50 flex items-center justify-center overflow-hidden -mt-space-4 -mx-space-4 mb-space-4">
                     {visualContent}
                </div>
            )}
            <div className="flex-grow">
                 <h3 className="text-xl font-semibold text-primary uppercase tracking-wider">{title}</h3>
                <div className="text-muted text-sm my-space-2">{description}</div>
            </div>
            {action && <div className="mt-space-4">{action}</div>}
        </Panel>
    </div>
);
