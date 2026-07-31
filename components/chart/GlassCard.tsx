'use client';

import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
}

export function GlassCard({
  children,
  className = '',
  glow = false,
  hover = false,
}: GlassCardProps) {
  return (
    <motion.div
      className={`rounded-2xl border border-white/20 bg-white/60 backdrop-blur-xl shadow-sm dark:border-white/5 dark:bg-white/[0.04] ${
        glow ? 'shadow-lg shadow-blue-500/5 dark:shadow-blue-500/10' : ''
      } ${hover ? 'hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-shadow duration-300' : ''} ${className}`}
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
