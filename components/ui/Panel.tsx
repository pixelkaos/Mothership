import React from 'react';

interface PanelProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
    footer?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ title, children, className = '', actions, footer }) => (
    <div className={`border border-primary/30 p-4 bg-black/30 ${className}`}>
        {(title || actions) && (
            <div className="flex justify-between items-center mb-4 text-center">
                 {title ? (
                     <h3 className="font-bold text-muted uppercase text-sm tracking-wider flex-1 text-center">
                         {title}
                     </h3>
                 ) : <div className="flex-1"></div>}
                {actions && <div className="flex-shrink-0">{actions}</div>}
                 {!actions && title && <div className="flex-1"></div>}
            </div>
        )}
        <div>{children}</div>
        {footer && <div className="mt-4 border-t border-primary/50 pt-4">{footer}</div>}
    </div>
);