import React from 'react';
import type { ComponentProps } from 'react';

const baseClasses = 'inline-flex items-center justify-center transition-colors focus:outline-none focus-visible:shadow-ring disabled:cursor-not-allowed disabled:opacity-60 rounded-md duration-200 ease-standard';

const variants = {
  ghost: 'bg-transparent text-muted hover:text-primary hover:bg-primary/10 active:bg-primary/20',
};

const sizes = {
  sm: 'w-6 h-6',
  md: 'w-7 h-7',
  lg: 'w-8 h-8',
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
