import * as React from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
}

const Skeleton = ({ className, width, height, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-surface border border-off-white/5',
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
};

export { Skeleton };
