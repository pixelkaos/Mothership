import React, { forwardRef } from 'react';

type InputProps = React.ComponentProps<'input'>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
    const baseClasses = 'w-full bg-black/50 border border-muted p-2 focus:ring-0 focus:outline-none focus:border-primary transition-colors text-foreground disabled:bg-black/20 disabled:text-muted disabled:cursor-not-allowed';
    return <input ref={ref} className={`${baseClasses} ${className}`} {...props} />;
});
