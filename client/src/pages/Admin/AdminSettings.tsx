import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useData } from '@/context/DataContext';
import { AppSettings } from '@/types';

const AdminSettings = () => {
  const { settings, updateSettings } = useData();
  const [form, setForm] = useState<AppSettings>(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSaveDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      hubAddress: form.hubAddress.trim(),
      pickupDeliveryCharge: Number(form.pickupDeliveryCharge) || 0,
      dropDeliveryCharge: Number(form.dropDeliveryCharge) || 0,
    });
    toast.success('Delivery charges saved');
  };

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold text-off-white">System Settings</h1>
        <p className="text-off-white/60">Configure pickup/drop fees and hub location</p>
      </div>

      <Card className="space-y-6">
        <h3 className="flex items-center gap-2 text-xl font-bold text-off-white">
          <Truck className="h-5 w-5 text-accent" /> Pickup & Drop Charges
        </h3>
        <p className="text-sm text-off-white/50">
          When customers choose <strong className="text-off-white">self pickup/drop</strong> at your hub, charge is always{' '}
          <strong className="text-success">₹0</strong>. Delivery to their address uses the fees below.
        </p>

        <form onSubmit={handleSaveDelivery} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-off-white/60">
              <MapPin className="h-4 w-4 text-accent" /> Hub address (self pickup/drop)
            </label>
            <Input
              value={form.hubAddress}
              onChange={e => setForm(f => ({ ...f, hubAddress: e.target.value }))}
              placeholder="Raino Cars Hub, Bengaluru"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-off-white/60">Pickup delivery charge (₹)</label>
              <Input
                type="number"
                min={0}
                value={form.pickupDeliveryCharge}
                onChange={e => setForm(f => ({ ...f, pickupDeliveryCharge: Number(e.target.value) }))}
              />
              <p className="text-xs text-off-white/40">Applied when car is delivered to customer</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-off-white/60">Drop-off collection charge (₹)</label>
              <Input
                type="number"
                min={0}
                value={form.dropDeliveryCharge}
                onChange={e => setForm(f => ({ ...f, dropDeliveryCharge: Number(e.target.value) }))}
              />
              <p className="text-xs text-off-white/40">Applied when we collect car from customer</p>
            </div>
          </div>

          <div className="rounded-xl border border-success/20 bg-success/10 p-4 text-sm text-off-white/70">
            <p className="font-bold text-success">Self service = ₹0</p>
            <p className="mt-1">Customer picks up and returns the car at the hub — no delivery line items.</p>
          </div>

          <Button variant="primary" type="submit" className="gap-2">
            <Save className="h-4 w-4" /> Save delivery settings
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminSettings;
