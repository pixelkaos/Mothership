import React from 'react';
import type { ComponentProps } from 'react';

const baseClasses = 'inline-flex items-center justify-center transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus disabled:cursor-not-allowed rounded-md';

const variants = {
  ghost: 'bg-transparent text-muted hover:text-primary hover:bg-primary/10 active:bg-primary/20 disabled:text-muted/50',
};

const sizes = {
  sm: 'w-space-8 h-space-8',
  md: 'w-space-10 h-space-10',
  lg: 'w-space-12 h-space-12',
};

type IconButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: React.ReactNode; // SVG icon
  'aria-label': string;
};

export const IconButton: React.FC<IconButtonProps> = ({
  variant = 'ghost',
  size = 'md',
  children,
  className,
  ...rest
}) => {
  const combinedClasses = [
    baseClasses,
    variants[variant],
    sizes[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={combinedClasses} {...rest}>
      {children}
    </button>
  );
};
