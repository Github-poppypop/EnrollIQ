'use client';

import { motion } from 'motion/react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  title = 'No data yet',
  description = 'There is nothing to display at this time.',
  className = '',
}: EmptyStateProps) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center gap-4 py-12 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.svg
        width={80}
        height={80}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-zinc-300 dark:text-zinc-700"
        initial={{ rotate: -10 }}
        animate={{ rotate: 10 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: 'center' }}
      >
        <circle cx={40} cy={40} r={32} stroke="currentColor" strokeWidth={1.5} strokeDasharray="6 4" />
        <circle cx={40} cy={40} r={20} stroke="currentColor" strokeWidth={1.5} strokeDasharray="4 3" />
        <circle cx={40} cy={40} r={8} stroke="currentColor" strokeWidth={1.5} />
        <line x1={40} y1={4} x2={40} y2={16} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={40} y1={64} x2={40} y2={76} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={4} y1={40} x2={16} y2={40} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={64} y1={40} x2={76} y2={40} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      </motion.svg>
      <motion.p
        className="text-sm text-zinc-500 dark:text-zinc-400"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <span className="font-medium">{title}</span>
        {description && <span className="block mt-1">{description}</span>}
      </motion.p>
    </motion.div>
  );
}
