import React, { forwardRef } from 'react';

type InputProps = React.ComponentProps<'input'>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
    const baseClasses = 'w-full bg-[var(--color-input-bg)] border border-[var(--color-input-border)] py-[var(--space-2)] px-[var(--space-3)] text-[var(--text-md)] focus:outline-none focus-visible:[box-shadow:var(--ring-outline)] transition-shadow,border-color duration-150 text-[var(--color-fg)] disabled:opacity-50 disabled:cursor-not-allowed rounded-[var(--radius-md)]';
    return <input ref={ref} className={`${baseClasses} ${className}`} {...props} />;
});