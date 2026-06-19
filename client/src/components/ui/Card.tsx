import * as React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn(
      'rounded-lg border border-border bg-surface-elevated/90 p-6 text-off-white shadow-premium backdrop-blur-sm transition-all duration-500 hover:border-accent/50 hover:shadow-red-glow',
      className
    )}
    {...props}
  />
);

const CardHeader = ({ className, ...props }: CardProps) => (
  <div className={cn('mb-4', className)} {...props} />
);

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('text-xl font-display font-bold tracking-tight', className)} {...props} />
);

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('text-sm text-off-white/60', className)} {...props} />
);

const CardContent = ({ className, ...props }: CardProps) => (
  <div className={cn('space-y-2', className)} {...props} />
);

const CardFooter = ({ className, ...props }: CardProps) => (
  <div className={cn('flex items-center justify-between mt-6 pt-6 border-t border-off-white/10', className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
