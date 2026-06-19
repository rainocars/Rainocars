import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, Fuel, User, Settings, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useData } from '@/context/DataContext';
import { cn } from '@/utils/cn';

const CarsListing = () => {
  const { cars } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'All',
    fuelType: 'All',
    transmission: 'All',
    maxPrice: 20000,
  });

  const categories = ['All', 'Hatchback', 'SUV', 'Sedan', 'Luxury', 'Supercar'];
  const fuelTypes = ['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid'];
  const transmissions = ['All', 'Manual', 'Automatic'];

  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            car.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filters.category === 'All' || car.category === filters.category;
      const matchesFuel = filters.fuelType === 'All' || car.fuelType === filters.fuelType;
      const matchesTransmission = filters.transmission === 'All' || car.transmission === filters.transmission;
      const matchesPrice = car.pricePerDay <= filters.maxPrice;

      return matchesSearch && matchesCategory && matchesFuel && matchesTransmission && matchesPrice;
    });
  }, [searchTerm, filters, cars]);

  return (
    <div className="min-h-screen bg-primary pt-16">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-8">
            <div className="flex items-center gap-2 text-off-white mb-6">
              <Filter className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-display font-bold">Filters</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-off-white/60 mb-3 block">Category</label>
                <div className="flex flex-col gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                      className={cn(
                        'text-left px-3 py-2 rounded-lg text-sm transition-all',
                        filters.category === cat ? 'bg-accent text-primary font-bold' : 'bg-surface text-off-white hover:bg-surface/80'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-off-white/60 mb-3 block">Fuel Type</label>
                <div className="flex flex-col gap-2">
                  {fuelTypes.map(fuel => (
                    <button
                      key={fuel}
                      onClick={() => setFilters(prev => ({ ...prev, fuelType: fuel }))}
                      className={cn(
                        'text-left px-3 py-2 rounded-lg text-sm transition-all',
                        filters.fuelType === fuel ? 'bg-accent text-primary font-bold' : 'bg-surface text-off-white hover:bg-surface/80'
                      )}
                    >
                      {fuel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-off-white/60 mb-3 block">Transmission</label>
                <div className="flex flex-col gap-2">
                  {transmissions.map(trans => (
                    <button
                      key={trans}
                      onClick={() => setFilters(prev => ({ ...prev, transmission: trans }))}
                      className={cn(
                        'text-left px-3 py-2 rounded-lg text-sm transition-all',
                        filters.transmission === trans ? 'bg-accent text-primary font-bold' : 'bg-surface text-off-white hover:bg-surface/80'
                      )}
                    >
                      {trans}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-off-white/60">Max Price</label>
                  <span className="text-accent font-bold">₹{filters.maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="20000"
                  step="500"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-off-white/40" />
              <input
                type="text"
                placeholder="Search by car model or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-surface border border-off-white/10 rounded-xl text-off-white placeholder:text-off-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </div>

            {/* Grid */}
            {filteredCars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCars.map((car, idx) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="group cursor-pointer h-full flex flex-col overflow-hidden">
                      <div className="relative h-48 overflow-hidden rounded-lg mb-4">
                        <img src={car.images[0]} alt={car.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute top-3 right-3">
                          <Badge variant="accent">{car.category}</Badge>
                        </div>
                      </div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-display font-bold text-off-white">{car.name}</h3>
                        <div className="flex items-center gap-1 text-sm font-bold text-accent">
                          <Star className="h-3 w-3 fill-accent" />
                          {car.rating}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-off-white/5 text-off-white/60 text-xs">
                          <Fuel className="h-3 w-3" /> {car.fuelType}
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-off-white/5 text-off-white/60 text-xs">
                          <Settings className="h-3 w-3" /> {car.transmission}
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-off-white/5 text-off-white/60 text-xs">
                          <User className="h-3 w-3" /> {car.seats} Seats
                        </div>
                      </div>
                      <div className="mt-auto pt-6 border-t border-off-white/10 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-off-white/40 uppercase font-bold tracking-wider">Price / Day</p>
                          <p className="text-2xl font-display font-bold text-off-white">₹{car.pricePerDay}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="surface" size="sm" asChild>
                            <Link to={`/cars/${car.slug}`}>Details</Link>
                          </Button>
                          <Button variant="primary" size="sm" asChild>
                            <Link to={`/cars/${car.slug}`}>Book</Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-20 w-20 rounded-full bg-surface flex items-center justify-center mb-4">
                  <Search className="h-10 w-10 text-off-white/20" />
                </div>
                <h3 className="text-xl font-bold text-off-white">No cars found</h3>
                <p className="text-off-white/60 mt-2">Try adjusting your filters to find what you're looking for.</p>
                <Button variant="primary" className="mt-6" onClick={() => setFilters({ category: 'All', fuelType: 'All', transmission: 'All', maxPrice: 20000 })}>
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CarsListing;
