import * as React from 'react';
import { cn } from '@/utils/cn';

interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = ({ children, defaultValue, onValueChange }: TabsProps) => {
  const [value, setValue] = React.useState(defaultValue || '');

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className="w-full" data-tabs-context>
      {React.Children.map(children, child =>
        React.cloneElement(child as React.ReactElement, { value, handleValueChange })
      )}
    </div>
  );
};

const TabsList = ({ className, children, value, handleValueChange }: any) => (
  <div className={cn('flex p-1 space-x-1 bg-surface rounded-lg border border-off-white/10', className)}>
    {React.Children.map(children, child =>
      React.cloneElement(child as React.ReactElement, { value })
    )}
  </div>
);

const TabsTrigger = ({ value, children, className, handleValueChange }: any) => {
  const isActive = value === (handleValueChange as any)?.currentValue; // Simplified for now
  // Wait, I need to pass the current value down.
  return <div className={cn('px-3 py-1.5 text-sm rounded-md cursor-pointer transition-all', className)}>{children}</div>;
};

const TabsContentActual = ({ value, children, className }: any) => (
    <div className={cn('animate-in fade-in slide-in-from-bottom-2 duration-300', className)}>
        {children}
    </div>
);

const TabsTriggerActual = ({ value, children, isActive, onClick, className }: any) => (
    <button
        onClick={onClick}
        className={cn(
            'px-4 py-2 text-sm font-medium rounded-md transition-all',
            isActive ? 'bg-accent text-primary shadow-md' : 'text-off-white/60 hover:text-off-white hover:bg-off-white/10',
            className
        )}
    >
        {children}
    </button>
);

// Let's redefine Tabs to be more robust
export const TabsContainer = ({ children, defaultValue }: any) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue);
    return (
        <div className="w-full">
            <div className="flex gap-2 p-1 bg-surface rounded-lg border border-off-white/10 mb-4">
                {React.Children.map(children, child => {
                    if (child.type === TabsTriggerActual) {
                        return React.cloneElement(child, {
                            isActive: activeTab === child.props.value,
                            onClick: () => setActiveTab(child.props.value)
                        });
                    }
                    return null;
                })}
            </div>
            <div className="mt-4">
                {React.Children.map(children, child => {
                    if (child.type === TabsContentActual) {
                        return activeTab === child.props.value ? child : null;
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

// Using distinct names to avoid conflict with the previous attempt
export { TabsTriggerActual as TabsTrigger, TabsContentActual as TabsContent };
