import React, { forwardRef } from 'react';

const tones = {
  default: "bg-black/30 border-[var(--color-primary)]/30",
  sunken: "bg-black/50 border-[var(--color-muted)]/50",
  raised: "bg-black/20 border-[var(--color-muted)]/40 shadow-[var(--shadow-elev-1)]",
  warning: "bg-[var(--color-danger)]/10 border-[var(--color-danger)]/40"
};

export type PanelTone = keyof typeof tones;

// FIX: Extend React.HTMLAttributes<HTMLDivElement> to allow passing standard div props like onClick.
interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    children: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
    footer?: React.ReactNode;
    tone?: PanelTone;
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(({ title, children, className = '', actions, footer, tone = 'default', ...props }, ref) => (
    <div ref={ref} className={["rounded-[var(--radius-lg)] p-[var(--space-4)] border", tones[tone], className].filter(Boolean).join(' ')} {...props}>
        {(title || actions) && (
            <div className="flex justify-between items-center mb-[var(--space-4)] text-center">
                 {title ? (
                     <h3 className="font-bold text-[var(--color-muted)] uppercase text-[var(--text-sm)] tracking-wider flex-1 text-center">
                         {title}
                     </h3>
                 ) : <div className="flex-1"></div>}
                {actions && <div className="flex-shrink-0">{actions}</div>}
                 {!actions && title && <div className="flex-1"></div>}
            </div>
        )}
        {children}
        {footer && <div className="mt-[var(--space-4)] border-t border-[var(--color-primary)]/50 pt-[var(--space-4)]">{footer}</div>}
    </div>
));