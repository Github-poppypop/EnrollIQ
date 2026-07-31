'use client';

import { motion } from 'motion/react';

interface AmbientBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function AmbientBackground({
  children,
  className = '',
}: AmbientBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Animated gradient orbs */}
      <motion.div
        className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl"
        animate={{
          x: [0, 80, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl"
        animate={{
          x: [0, -60, 0],
          y: [0, 30, 0],
          scale: [1.1, 0.9, 1.1],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/5 blur-3xl"
        animate={{
          scale: [0.8, 1.4, 0.8],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Subtle grid pattern */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div className="relative z-10">{children}</motion.div>
    </div>
  );
}
