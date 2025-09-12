import React from 'react';

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  onLabel?: string;
  offLabel?: string;
  id?: string;
  'aria-label'?: string;
};

/**
 * A compact, accessible switch component styled with project tokens.
 * - Uses primary color when ON; muted when OFF.
 * - Shows ON/OFF text inside the track, and an animated thumb.
 */
export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  onLabel = 'ON',
  offLabel = 'OFF',
  id,
  ...rest
}) => {
  const handleToggle = () => {
    if (disabled) return;
    onCheckedChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCheckedChange(!checked);
    }
  };

  const base = [
    'relative inline-flex items-center rounded-full transition-colors duration-200 ease-standard select-none',
    'w-16 h-8 p-0.5',
    disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
    checked ? 'bg-primary text-background' : 'bg-muted/30 text-secondary',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={base}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {/* Labels inside track */}
      <span
        className={[
          'absolute left-3 text-[10px] font-semibold tracking-wider uppercase',
          checked ? 'opacity-100' : 'opacity-0',
          'transition-opacity duration-200',
        ].join(' ')}
      >
        {onLabel}
      </span>
      <span
        className={[
          'absolute right-3 text-[10px] font-semibold tracking-wider uppercase',
          checked ? 'opacity-0' : 'opacity-100',
          'transition-opacity duration-200',
        ].join(' ')}
      >
        {offLabel}
      </span>
      {/* Thumb */}
      <span
        aria-hidden
        className={[
          'h-7 w-7 rounded-full bg-background shadow-elev1 transform transition-transform duration-200 ease-standard',
          checked ? 'translate-x-8' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
};

export default Switch;

