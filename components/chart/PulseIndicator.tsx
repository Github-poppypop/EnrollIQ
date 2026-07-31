'use client';

import { motion } from 'motion/react';

interface PulseIndicatorProps {
  label?: string;
  active?: boolean;
  className?: string;
}

export function PulseIndicator({
  label = 'Live',
  active = true,
  className = '',
}: PulseIndicatorProps) {
  return (
    <motion.div
      className={`inline-flex items-center gap-2 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <motion.span
        className={`relative flex h-2.5 w-2.5 ${active ? '' : 'opacity-40'}`}
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <motion.span
          className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"
          animate={active ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.span>
      <span className="text-xs font-medium text-green-600 dark:text-green-400">
        {label}
      </span>
    </motion.div>
  );
}
