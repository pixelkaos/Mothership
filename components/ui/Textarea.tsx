import React, { forwardRef } from 'react';

type TextareaProps = React.ComponentProps<'textarea'>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
    const baseClasses = 'w-full bg-black/50 border border-muted p-2 focus:ring-0 focus:outline-none focus:border-primary transition-colors text-foreground disabled:bg-black/20 disabled:text-muted disabled:cursor-not-allowed rounded-md';
    return <textarea ref={ref} className={`${baseClasses} ${className}`} {...props} />;
});