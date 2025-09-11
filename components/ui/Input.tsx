import React, { forwardRef } from 'react';

type InputProps = React.ComponentProps<'input'>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
    const baseClasses = 'w-full bg-input-bg border border-input-border py-space-2 px-space-3 text-md focus:outline-none focus-visible:shadow-ring transition-shadow,border-color duration-150 text-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-radius-md';
    return <input ref={ref} className={`${baseClasses} ${className}`} {...props} />;
});