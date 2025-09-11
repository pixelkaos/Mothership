import React from 'react';
import type { ComponentProps, ElementType, ReactNode } from 'react';

const baseClasses = 'inline-flex items-center justify-center uppercase tracking-widest transition-colors focus:outline-none focus-visible:shadow-ring disabled:cursor-not-allowed disabled:opacity-60 duration-1 ease-[var(--ease-standard)] font-semibold';

const variants = {
  primary: 'bg-primary text-background hover:opacity-90 active:opacity-80 rounded-md',
  secondary: 'bg-transparent border border-secondary text-secondary hover:bg-secondary/20 active:bg-secondary/30 rounded-md',
  tertiary: 'bg-transparent border border-tertiary text-tertiary hover:bg-tertiary/10 active:bg-tertiary/20 rounded-md',
  ghost: 'bg-transparent text-muted hover:text-primary hover:bg-primary/10 active:bg-primary/20 rounded-md',
  destructive: 'bg-danger text-foreground hover:opacity-90 active:opacity-80 rounded-md',
  nav: 'rounded-none border-0 bg-transparent text-secondary hover:bg-secondary/20 active:bg-secondary/30',
  tab: 'rounded-b-none border-b-0 bg-transparent border border-secondary text-secondary hover:bg-secondary/20 active:bg-secondary/30',
};

const sizes = {
  sm: 'px-3 text-xs h-6',
  md: 'px-4 text-sm h-7',
  lg: 'px-5 text-md h-8',
};

type ButtonOwnProps<E extends ElementType = ElementType> = {
  as?: E;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: ReactNode;
  className?: string;
};

type ButtonProps<E extends ElementType> = ButtonOwnProps<E> &
  Omit<ComponentProps<E>, keyof ButtonOwnProps>;

const defaultElement = 'button';

export const Button = <E extends ElementType = typeof defaultElement>({
  as,
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...rest
}: ButtonProps<E>) => {
  const Component = as || defaultElement;

  const combinedClasses = [
    baseClasses,
    variants[variant],
    sizes[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component className={combinedClasses} {...rest}>
      {children}
    </Component>
  );
};