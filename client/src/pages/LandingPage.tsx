import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Car, CheckCircle2, ShieldCheck, Clock, CreditCard, Search, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useData } from '@/context/DataContext';
import AnimatedBackground from '@/components/AnimatedBackground';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const LandingPage = () => {
  const { cars } = useData();
  const featuredCars = cars.filter(c => c.isAvailable).slice(0, 4);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 80]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.4]);

  return (
    <div className="relative overflow-hidden bg-primary">
      <Navbar />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
        <div className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.08]" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 -z-10"
        >
          <AnimatedBackground />
        </motion.div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-accent/80"
          >
            Smart Mobility
          </motion.p>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="font-display text-5xl font-black leading-[0.95] tracking-tighter text-off-white md:text-8xl lg:text-9xl"
          >
            Drive the{' '}
            <span className="text-gradient-red italic">Moment</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mx-auto mt-8 max-w-2xl text-lg font-light leading-relaxed text-off-white/60 md:text-2xl"
          >
            Fast, reliable car rentals built for modern city movement.
            <br className="hidden md:block" />
            Clean booking. Trusted cars. Instant support.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-12 flex flex-col justify-center gap-5 sm:flex-row"
          >
            <Button variant="primary" size="lg" asChild className="px-10 py-7 text-lg">
              <Link to="/cars">Browse the Fleet</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="px-10 py-7 text-lg">
              <Link to="/register">Become a Member</Link>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mx-auto mt-16 w-full max-w-3xl"
          >
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center rounded-full border border-accent/15 bg-surface-elevated/60 px-6 py-4 text-sm font-medium text-off-white/80 shadow-premium backdrop-blur-2xl md:px-8 md:py-5">
              <div className="flex min-w-0 items-center justify-center gap-2 text-center">
                <Car className="h-5 w-5 text-accent" />
                <span className="hidden sm:inline">Exclusive Fleet</span>
              </div>
              <div className="hidden h-6 w-px bg-accent/20 sm:block" />
              <div className="flex min-w-0 items-center justify-center gap-2 text-center">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <span className="hidden sm:inline">Fully Insured</span>
              </div>
              <div className="hidden h-6 w-px bg-accent/20 sm:block" />
              <div className="flex min-w-0 items-center justify-center gap-2 text-center">
                <Clock className="h-5 w-5 text-accent" />
                <span className="hidden sm:inline">24/7 Concierge</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row"
        >
          <div className="space-y-2">
            <h2 className="font-display text-4xl font-bold text-off-white md:text-5xl">
              Ready <span className="text-gradient-red">Fleet</span>
            </h2>
            <p className="text-lg text-off-white/50">Two focused choices for city drives and daily mobility.</p>
          </div>
          <Button variant="ghost" asChild className="text-accent">
            <Link to="/cars">Explore All →</Link>
          </Button>
        </motion.div>

        <div className="scrollbar-hide flex snap-x gap-8 overflow-x-auto pb-12">
          {(featuredCars.length ? featuredCars : cars.slice(0, 4)).map((car, idx) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="min-w-[300px] snap-start md:min-w-[380px]"
            >
              <Card className="group h-full overflow-hidden border-accent/10 p-0">
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={car.images[0] || '/raino-logo.jpeg'}
                    alt={car.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />
                  <div className="absolute right-4 top-4">
                    <Badge variant="accent" className="border border-accent/20 bg-primary/80 uppercase tracking-widest">
                      {car.category}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl font-bold text-off-white">{car.name}</h3>
                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-off-white/50">
                      From <span className="text-xl font-bold text-accent">₹{car.pricePerDay.toLocaleString()}</span>
                      <span className="text-sm opacity-60">/day</span>
                    </p>
                    <Button variant="surface" size="sm" asChild>
                      <Link to={`/cars/${car.slug}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-accent/10 bg-surface/40 py-32 px-6">
        <div className="mx-auto max-w-7xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 font-display text-4xl font-bold text-off-white md:text-5xl"
          >
            The <span className="text-gradient-red">Raino</span> Experience
          </motion.h2>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              { icon: Search, title: 'Select Vehicle', desc: 'Choose from a focused fleet maintained for everyday reliability.' },
              { icon: CreditCard, title: 'Seamless Booking', desc: 'Instant secure payments with a transparent pricing structure.' },
              { icon: Car, title: 'Drive Confidently', desc: 'Get a clean handover, insured trips, and 24/7 support.' },
            ].map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                whileHover={{ y: -6 }}
                className="group flex flex-col items-center rounded-3xl border border-accent/10 bg-primary/60 p-10 transition-colors duration-500 hover:border-accent/30"
              >
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 transition-transform duration-500 group-hover:scale-110">
                  <step.icon className="h-10 w-10 text-accent" />
                </div>
                <h3 className="mb-4 font-display text-2xl font-bold text-off-white">{step.title}</h3>
                <p className="text-lg leading-relaxed text-off-white/50">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-32">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="font-display text-4xl font-bold leading-tight text-off-white md:text-6xl">
              Designed for <br />
              <span className="text-gradient-red">Fast Mobility</span>
            </h2>
            <p className="text-xl font-light leading-relaxed text-off-white/60">
              Raino Cars blends simple booking, verified vehicles, and responsive support
              into a professional rental experience.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[
                { icon: Clock, text: 'Flexible Date Ranges' },
                { icon: ShieldCheck, text: 'Full Insurance' },
                { icon: CheckCircle2, text: 'Pristine Condition' },
                { icon: Star, text: '24/7 Support' },
              ].map((feat) => (
                <div key={feat.text} className="flex items-center gap-4 text-off-white/80">
                  <feat.icon className="h-6 w-6 text-accent" />
                  <span className="text-lg font-medium">{feat.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <motion.div
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -inset-8 rounded-full bg-accent/20 blur-3xl"
            />
            <img
              src="/raino-hero.jpg"
              alt="Raino Cars vehicle showroom and fleet"
              className="relative w-full h-auto max-h-[500px] object-cover rounded-3xl border border-accent/20 shadow-premium transition-all duration-700 hover:border-accent/40 hover:scale-[1.01]"
            />
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-accent/10 bg-primary px-6 py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="mb-8 flex items-center gap-3">
              <img src="/raino-logo.jpeg" alt="Raino Cars" className="h-10 w-auto object-contain" />
              <span className="font-display text-2xl font-bold tracking-tight text-off-white">
                RAINO<span className="text-accent">CARS</span>
              </span>
            </Link>
            <p className="max-w-sm text-lg leading-relaxed text-off-white/50">
              A modern mobility platform for dependable city rentals.
              <br />
              Drive the moment. Own the road.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-lg font-bold uppercase tracking-widest text-off-white">Quick Access</h4>
            <ul className="space-y-4 text-lg text-off-white/60">
              <li><Link to="/cars" className="transition-colors hover:text-accent">Our Fleet</Link></li>
              <li><Link to="/dashboard" className="transition-colors hover:text-accent">Client Portal</Link></li>
              <li><Link to="/login" className="transition-colors hover:text-accent">Sign In</Link></li>
              <li><Link to="/register" className="transition-colors hover:text-accent">Membership</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-lg font-bold uppercase tracking-widest text-off-white">Concierge</h4>
            <ul className="space-y-4 text-lg text-off-white/60">
              <li>Hyderabad, Manikonda, Telangana 500089</li>
              <li>rainocars@gmail.com</li>
              <li>+91 89711 77578</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-20 max-w-7xl border-t border-accent/10 pt-8 text-center text-sm uppercase tracking-widest text-off-white/40">
          © {new Date().getFullYear()} Raino Cars. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
