import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import ImageUpload from '@/components/ImageUpload';
import FeatureSelector from '@/components/FeatureSelector';
import { useData } from '@/context/DataContext';
import { Car } from '@/types';
import { cn } from '@/utils/cn';

const CATEGORIES = ['Hatchback', 'SUV', 'Sedan', 'Luxury', 'Supercar'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Manual', 'Automatic'];

const emptyForm = {
  name: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  category: 'Sedan',
  fuelType: 'Petrol',
  transmission: 'Automatic',
  seats: 5,
  pricePerDay: 0,
  weeklyDiscount: 0,
  monthlyDiscount: 0,
  description: '',
  selectedFeatures: [] as string[],
  images: [] as string[],
  isAvailable: true,
};

const AdminCars = () => {
  const { cars, saveCar, deleteCar } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openModal = (car?: Car) => {
    if (car) {
      setEditingId(car.id);
      setForm({
        name: car.name,
        brand: car.brand,
        model: car.model,
        year: car.year,
        category: car.category,
        fuelType: car.fuelType,
        transmission: car.transmission,
        seats: car.seats,
        pricePerDay: car.pricePerDay,
        weeklyDiscount: car.weeklyDiscount || 0,
        monthlyDiscount: car.monthlyDiscount || 0,
        description: car.description,
        selectedFeatures: [...car.features],
        images: [...car.images],
        isAvailable: car.isAvailable,
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.brand.trim()) {
      toast.error('Name and brand are required');
      return;
    }
    if (form.pricePerDay <= 0) {
      toast.error('Enter a valid price per day');
      return;
    }
    if (form.images.length === 0) {
      toast.error('Upload at least one car photo');
      return;
    }

    saveCar(
      {
        name: form.name.trim(),
        brand: form.brand.trim(),
        model: form.model.trim() || form.name.trim(),
        year: Number(form.year),
        category: form.category,
        fuelType: form.fuelType,
        transmission: form.transmission,
        seats: Number(form.seats),
        pricePerDay: Number(form.pricePerDay),
        weeklyDiscount: Number(form.weeklyDiscount) || Math.round(Number(form.pricePerDay) * 0.9),
        monthlyDiscount: Number(form.monthlyDiscount) || Math.round(Number(form.pricePerDay) * 0.8),
        description: form.description.trim(),
        features: form.selectedFeatures,
        images: form.images,
        isAvailable: form.isAvailable,
      },
      editingId || undefined
    );

    toast.success(editingId ? 'Car updated' : 'Car added to fleet');
    setIsModalOpen(false);
  };

  const handleDelete = (car: Car) => {
    if (!window.confirm(`Delete ${car.name}? This cannot be undone.`)) return;
    deleteCar(car.id);
    toast.success('Car removed');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-off-white">Fleet Management</h1>
          <p className="text-off-white/60">Add cars with photos — listings update for all users instantly</p>
        </div>
        <Button variant="primary" className="gap-2" onClick={() => openModal()}>
          <Plus className="h-4 w-4" /> Add New Car
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Car</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price/Day</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.length === 0 ? (
              <TableRow>
                <TableCell className="py-12 text-center text-off-white/50">
                  No cars yet. Add your first vehicle.
                </TableCell>
              </TableRow>
            ) : (
              cars.map(car => (
                <TableRow key={car.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {car.images[0] ? (
                        <img src={car.images[0]} alt={car.name} className="h-12 w-16 rounded-lg object-cover border border-accent/10" />
                      ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-primary text-xs text-off-white/40">No img</div>
                      )}
                      <div>
                        <span className="font-bold text-off-white">{car.name}</span>
                        <p className="text-xs text-off-white/50">{car.brand}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="surface">{car.category}</Badge></TableCell>
                  <TableCell className="font-bold text-accent">₹{car.pricePerDay.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn('h-2 w-2 rounded-full', car.isAvailable ? 'bg-success' : 'bg-danger')} />
                      <span className="text-off-white/60">{car.isAvailable ? 'Available' : 'Unavailable'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-off-white/60">{car.totalBookings}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="p-2" onClick={() => openModal(car)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-2 text-danger hover:text-danger" onClick={() => handleDelete(car)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Car' : 'Add New Car'}>
        <form onSubmit={handleSave} className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
          <ImageUpload images={form.images} onChange={images => setForm(f => ({ ...f, images }))} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-off-white/60">Car Name *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Hyundai Creta" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-off-white/60">Brand *</label>
              <Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Hyundai" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-off-white/60">Model</label>
              <Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="Creta" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-off-white/60">Year</label>
              <Input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-off-white/60">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border border-accent/15 bg-primary px-4 py-2 text-off-white outline-none focus:ring-2 focus:ring-accent/40"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-off-white/60">Price/Day (₹) *</label>
              <Input type="number" value={form.pricePerDay || ''} onChange={e => setForm(f => ({ ...f, pricePerDay: Number(e.target.value) }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-off-white/60">Weekly Discount (₹/Day)</label>
              <Input type="number" value={form.weeklyDiscount || ''} onChange={e => setForm(f => ({ ...f, weeklyDiscount: Number(e.target.value) }))} placeholder="Optional (defaults to 10% off)" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-off-white/60">Monthly Discount (₹/Day)</label>
              <Input type="number" value={form.monthlyDiscount || ''} onChange={e => setForm(f => ({ ...f, monthlyDiscount: Number(e.target.value) }))} placeholder="Optional (defaults to 20% off)" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-off-white/60">Fuel</label>
              <select
                value={form.fuelType}
                onChange={e => setForm(f => ({ ...f, fuelType: e.target.value }))}
                className="w-full rounded-lg border border-accent/15 bg-primary px-4 py-2 text-off-white outline-none focus:ring-2 focus:ring-accent/40"
              >
                {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-off-white/60">Transmission</label>
              <select
                value={form.transmission}
                onChange={e => setForm(f => ({ ...f, transmission: e.target.value }))}
                className="w-full rounded-lg border border-accent/15 bg-primary px-4 py-2 text-off-white outline-none focus:ring-2 focus:ring-accent/40"
              >
                {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-off-white/60">Seats</label>
              <Input type="number" value={form.seats} onChange={e => setForm(f => ({ ...f, seats: Number(e.target.value) }))} />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="available"
                checked={form.isAvailable}
                onChange={e => setForm(f => ({ ...f, isAvailable: e.target.checked }))}
                className="h-4 w-4 rounded border-accent/30 text-accent focus:ring-accent"
              />
              <label htmlFor="available" className="text-sm text-off-white">Available for booking</label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-off-white/60">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full rounded-xl border border-accent/15 bg-primary p-4 text-off-white outline-none focus:ring-2 focus:ring-accent/40"
              placeholder="Describe the vehicle..."
            />
          </div>

          <div className="space-y-3 rounded-xl border border-accent/15 bg-primary/30 p-4">
            <label className="text-sm font-bold text-off-white">Car Features</label>
            <p className="text-xs text-off-white/50">Select all that apply — shown to customers on the car page</p>
            <FeatureSelector
              selected={form.selectedFeatures}
              onChange={selectedFeatures => setForm(f => ({ ...f, selectedFeatures }))}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-accent/10 pt-4">
            <Button type="button" variant="surface" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingId ? 'Save Changes' : 'Add Car'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCars;
