import React from 'react';
import { Check } from 'lucide-react';
import { CAR_FEATURE_GROUPS } from '@/utils/carFeatures';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';

interface FeatureSelectorProps {
  selected: string[];
  onChange: (features: string[]) => void;
}

const FeatureSelector = ({ selected, onChange }: FeatureSelectorProps) => {
  const toggle = (feature: string) => {
    if (selected.includes(feature)) {
      onChange(selected.filter(f => f !== feature));
    } else {
      onChange([...selected, feature]);
    }
  };

  const selectAllInGroup = (features: string[]) => {
    const merged = new Set([...selected, ...features]);
    onChange(Array.from(merged));
  };

  const clearGroup = (features: string[]) => {
    onChange(selected.filter(f => !features.includes(f)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-off-white/60">
          Tap to select features · <span className="text-accent font-medium">{selected.length}</span> selected
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(CAR_FEATURE_GROUPS.flatMap(g => g.features))}
          >
            Select all
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>
            Clear all
          </Button>
        </div>
      </div>

      {CAR_FEATURE_GROUPS.map(group => {
        const groupSelected = group.features.filter(f => selected.includes(f)).length;
        return (
          <div key={group.label} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-accent/90">
                {group.label}
                {groupSelected > 0 && (
                  <span className="ml-2 text-off-white/50">({groupSelected}/{group.features.length})</span>
                )}
              </h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => selectAllInGroup(group.features)}
                  className="text-xs text-accent hover:underline"
                >
                  Select group
                </button>
                <span className="text-off-white/20">|</span>
                <button
                  type="button"
                  onClick={() => clearGroup(group.features)}
                  className="text-xs text-off-white/50 hover:text-off-white"
                >
                  Clear group
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.features.map(feature => {
                const isOn = selected.includes(feature);
                return (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggle(feature)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                      isOn
                        ? 'border-accent bg-accent/20 text-accent shadow-sm'
                        : 'border-accent/15 bg-primary/50 text-off-white/70 hover:border-accent/40 hover:text-off-white'
                    )}
                  >
                    {isOn && <Check className="h-3 w-3 shrink-0" />}
                    {feature}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureSelector;
