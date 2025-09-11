import React, { forwardRef } from 'react';

const tones = {
  default: "bg-backgroundElev border-primary/30",
  sunken: "bg-black/50 border-muted/50",
  raised: "bg-black/20 border-muted/40 shadow-elev1",
  warning: "bg-danger/10 border-danger/40"
};

export type PanelTone = keyof typeof tones;

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    children: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
    footer?: React.ReactNode;
    tone?: PanelTone;
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(({ title, children, className = '', actions, footer, tone = 'default', ...props }, ref) => (
    <div ref={ref} className={["rounded-radius-lg p-space-4 border", tones[tone], className].filter(Boolean).join(' ')} {...props}>
        {(title || actions) && (
            <div className="flex justify-between items-center mb-space-4 text-center">
                 {title ? (
                     <h3 className="font-bold text-muted uppercase text-sm tracking-wider flex-1 text-center">
                         {title}
                     </h3>
                 ) : <div className="flex-1"></div>}
                {actions && <div className="flex-shrink-0">{actions}</div>}
                 {!actions && title && <div className="flex-1"></div>}
            </div>
        )}
        {children}
        {footer && <div className="mt-space-4 border-t border-primary/50 pt-space-4">{footer}</div>}
    </div>
));