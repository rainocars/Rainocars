import React from 'react';
import { MapPin, Building2 } from 'lucide-react';
import { PickupDropMode } from '@/types';
import { cn } from '@/utils/cn';

interface PickupDropSelectorProps {
  label: string;
  mode: PickupDropMode;
  onModeChange: (mode: PickupDropMode) => void;
  deliveryCharge: number;
  hubAddress: string;
  location: string;
  onLocationChange: (value: string) => void;
  locationLabel: string;
}

const PickupDropSelector = ({
  label,
  mode,
  onModeChange,
  deliveryCharge,
  hubAddress,
  location,
  onLocationChange,
  locationLabel,
}: PickupDropSelectorProps) => (
  <div className="space-y-4 rounded-xl border border-accent/15 bg-primary/40 p-4">
    <p className="font-bold text-off-white">{label}</p>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onModeChange('SELF')}
        className={cn(
          'rounded-xl border p-4 text-left transition-all',
          mode === 'SELF'
            ? 'border-accent bg-accent/15 shadow-red-glow'
            : 'border-accent/15 hover:border-accent/40'
        )}
      >
        <div className="flex items-center gap-2 text-accent">
          <Building2 className="h-5 w-5" />
          <span className="font-bold">Self pickup / drop</span>
        </div>
        <p className="mt-2 text-xs text-off-white/60">Collect or return at our hub — no delivery charge</p>
        <p className="mt-2 text-lg font-bold text-success">₹0</p>
      </button>
      <button
        type="button"
        onClick={() => onModeChange('DELIVERY')}
        className={cn(
          'rounded-xl border p-4 text-left transition-all',
          mode === 'DELIVERY'
            ? 'border-accent bg-accent/15 shadow-red-glow'
            : 'border-accent/15 hover:border-accent/40'
        )}
      >
        <div className="flex items-center gap-2 text-accent">
          <MapPin className="h-5 w-5" />
          <span className="font-bold">Doorstep delivery</span>
        </div>
        <p className="mt-2 text-xs text-off-white/60">We deliver / collect from your address</p>
        <p className="mt-2 text-lg font-bold text-off-white">+ ₹{deliveryCharge.toLocaleString()}</p>
      </button>
    </div>

    {mode === 'SELF' ? (
      <div className="rounded-lg border border-accent/10 bg-surface-elevated/50 p-3 text-sm text-off-white/70">
        <span className="font-medium text-off-white">Hub location: </span>
        {hubAddress}
      </div>
    ) : (
      <div className="space-y-2">
        <label className="text-sm text-off-white/60">{locationLabel}</label>
        <input
          value={location}
          onChange={e => onLocationChange(e.target.value)}
          placeholder="Enter full address"
          required
          className="w-full rounded-lg border border-accent/15 bg-primary px-4 py-2 text-off-white outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>
    )}
  </div>
);

export default PickupDropSelector;
