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
      className={`clay-card ${glow ? 'shadow-lg shadow-blue-500/10' : ''} ${hover ? 'hover:shadow-lg hover:shadow-blue-500/10 transition-shadow duration-300' : ''} ${className}`}
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
