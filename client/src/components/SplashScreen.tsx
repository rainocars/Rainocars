import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const HOLD_MS = 2800;
const EXIT_MS = 900;

/** Opening intro — logo at `/raino-logo.jpeg` in `client/public/` */
const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setIsExiting(true), HOLD_MS);
    const doneTimer = window.setTimeout(onComplete, HOLD_MS + EXIT_MS);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={isExiting ? { opacity: 0, scale: 1.03 } : { opacity: 1, scale: 1 }}
      transition={{ duration: EXIT_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-premium-gradient"
    >
      {/* Ambient light orbs */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 h-[70vh] w-[70vh] rounded-full bg-accent/15 blur-[120px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 h-[60vh] w-[60vh] rounded-full bg-accent/10 blur-[100px]"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Shimmer sweep */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-shimmer-premium opacity-40"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 2.2, delay: 0.6, ease: 'easeInOut' }}
      />

      <div className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.12]" />

      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center px-6"
      >
        <motion.div
          className="absolute inset-0 -m-16 rounded-full bg-accent/25 blur-[90px]"
          animate={{ opacity: [0.4, 0.75, 0.4], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          initial={{ y: 24, opacity: 0, filter: 'blur(12px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <motion.img
            src="/raino-logo.jpeg"
            alt="Raino Cars"
            className="relative z-10 h-48 w-auto max-w-[min(90vw,320px)] object-contain drop-shadow-[0_20px_60px_rgba(220,38,38,0.25)] md:h-64"
            initial={{ scale: 0.92 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div
            className="relative z-10 hidden h-48 w-48 items-center justify-center rounded-full border border-accent/30 bg-surface/80 md:h-64 md:w-64"
            aria-hidden
          >
            <span className="font-display text-4xl font-bold tracking-tighter text-off-white md:text-5xl">
              RAINO
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-10 text-center"
        >
          <motion.div
            className="mx-auto mb-5 h-px origin-left bg-gradient-to-r from-transparent via-accent to-transparent"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 120, opacity: 1 }}
            transition={{ duration: 1, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.p
            initial={{ letterSpacing: '0.5em', opacity: 0 }}
            animate={{ letterSpacing: '0.35em', opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.9 }}
            className="text-[10px] font-light uppercase text-off-white/70 md:text-xs"
          >
            Drive the Moment
          </motion.p>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          className="absolute -bottom-24 left-1/2 h-px w-32 -translate-x-1/2 overflow-hidden rounded-full bg-off-white/10 md:-bottom-28 md:w-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-accent/40 via-accent to-accent/40"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
