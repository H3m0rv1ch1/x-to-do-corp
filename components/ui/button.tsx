import * as React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const base = [
      'inline-flex items-center justify-center gap-2',
      'rounded-md text-sm font-medium',
      'px-3 py-2',
      'transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-rgb))] focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:pointer-events-none',
    ].join(' ');

    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      default: [
        'bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))]',
        'hover:opacity-90',
      ].join(' '),
      outline: [
        'border border-[rgba(var(--border-primary-rgb))] bg-transparent text-white',
        'hover:bg-[rgba(var(--background-secondary-rgb),0.5)]',
      ].join(' '),
    };

    return (
      <button ref={ref} className={[base, variants[variant], className].join(' ')} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export default Button;