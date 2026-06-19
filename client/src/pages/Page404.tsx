import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';

const Page404 = () => {
  return (
    <div className="min-h-screen bg-primary pt-16 flex items-center justify-center px-6 text-center">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md space-y-8"
      >
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-accent/20 blur-3xl rounded-full" />
          <Car className="relative h-32 w-32 text-accent mx-auto mb-8" />
        </div>
        <h1 className="text-7xl font-display font-black text-off-white">404</h1>
        <h2 className="text-2xl font-bold text-off-white">Lost in the Journey?</h2>
        <p className="text-off-white/60 leading-relaxed">
          The page you are looking for doesn't exist or has been moved to a different garage.
        </p>
        <Button variant="primary" size="lg" asChild className="px-12">
          <Link to="/">Return Home</Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default Page404;
