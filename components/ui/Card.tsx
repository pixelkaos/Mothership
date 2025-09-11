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
        className={`flex flex-col h-full group transition-all duration-300 hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
    >
        <Panel className="flex flex-col flex-grow text-left group-hover:bg-primary/10 group-hover:shadow-2xl group-hover:shadow-primary/20">
            {visualContent && (
                <div className="w-full aspect-video bg-black/50 relative border-b border-muted/50 flex items-center justify-center overflow-hidden -mt-4 -mx-4 mb-4">
                     {visualContent}
                </div>
            )}
            <div className="flex-grow">
                 <h3 className="text-xl font-bold text-primary uppercase tracking-wider">{title}</h3>
                <div className="text-muted text-sm my-2">{description}</div>
            </div>
            {action && <div className="mt-4">{action}</div>}
        </Panel>
    </div>
);