import * as React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'surface' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, asChild, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-accent text-white font-semibold shadow-red-glow hover:bg-red-700 border border-accent',
      accent: 'bg-accent text-white hover:bg-red-700 shadow-lg shadow-accent/25',
      surface: 'bg-surface-elevated text-off-white hover:border-accent hover:shadow-red-glow border border-border backdrop-blur-sm',
      danger: 'bg-danger text-off-white hover:bg-danger/90',
      ghost: 'bg-transparent text-off-white/80 hover:text-accent hover:bg-accent/10',
      outline: 'bg-transparent text-off-white border border-border hover:border-accent hover:bg-accent/10 hover:shadow-red-glow',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg font-semibold',
    };

    const classes = cn(
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
      variants[variant],
      sizes[size],
      className
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(classes, (children as React.ReactElement<{ className?: string }>).props.className),
      });
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
