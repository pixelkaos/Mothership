import React from 'react';

interface PanelProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    titleAddon?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ title, children, className = '', titleAddon }) => (
    <div className={`border border-primary/30 p-4 bg-black/30 ${className}`}>
        <div className="flex justify-center items-center gap-2 mb-4">
            <h3 className="text-center font-bold text-muted uppercase text-sm tracking-wider">{title}</h3>
            {titleAddon}
        </div>
        {children}
    </div>
);
