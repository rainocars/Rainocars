import * as React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'danger' | 'accent' | 'surface';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'surface', children, ...props }, ref) => {
    const variants = {
      success: 'bg-success/20 text-success border-success/30',
      warning: 'bg-muted/15 text-muted border-muted/30',
      danger: 'bg-danger/20 text-danger border-danger/30',
      accent: 'bg-accent/15 text-accent border-accent/40',
      surface: 'bg-surface-elevated text-off-white border-border',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
