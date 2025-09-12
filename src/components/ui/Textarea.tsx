import React, { forwardRef } from 'react';

type TextareaProps = React.ComponentProps<'textarea'>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
    const baseClasses = 'w-full bg-input-bg border border-input-border py-space-2 px-space-3 text-md focus:outline-none focus-visible:shadow-ring transition-[box-shadow,border-color] duration-200 ease-standard text-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-radius-md';
    return <textarea ref={ref} className={`${baseClasses} ${className}`} {...props} />;
});
