import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  // Floating red particles
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 12 + 8,
    delay: Math.random() * 4,
  }));

  // Subtle red motion lines
  const lines = Array.from({ length: 4 }).map((_, i) => ({
    id: i,
    y: 20 + i * 20 + Math.random() * 10,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 3,
  }));

  // Low-opacity red geometric shapes
  const shapes = Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    size: Math.random() * 60 + 30,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 18 + 12,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Black and white grid pattern base */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" 
      />

      {/* Floating low-opacity red geometric shapes */}
      {shapes.map((shape) => (
        <motion.div
          key={`shape-${shape.id}`}
          className="absolute rounded-lg border border-accent/10 bg-accent/[0.01] dark:border-accent/5"
          style={{
            width: shape.size,
            height: shape.size,
            left: `${shape.x}%`,
            top: `${shape.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [shape.rotation, shape.rotation + 360],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle red motion lines */}
      {lines.map((line) => (
        <motion.div
          key={`line-${line.id}`}
          className="absolute h-[1px] w-40 bg-gradient-to-r from-transparent via-accent/20 to-transparent"
          style={{
            top: `${line.y}%`,
            left: '-20%',
          }}
          animate={{
            left: ['-20%', '120%'],
          }}
          transition={{
            duration: line.duration,
            repeat: Infinity,
            ease: "linear",
            delay: line.delay,
          }}
        />
      ))}

      {/* Subtle floating red particles */}
      {particles.map((p) => (
        <motion.div
          key={`part-${p.id}`}
          className="absolute rounded-full bg-accent/25 blur-[1px]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0.15, 0.5, 0.15],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
