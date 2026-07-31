'use client';

import { motion } from 'motion/react';

interface ChartSkeletonProps {
  className?: string;
  variant?: 'area' | 'bar' | 'line' | 'donut' | 'scatter' | 'heatmap';
}

export function ChartSkeleton({
  className = '',
  variant = 'area',
}: ChartSkeletonProps) {
  const getShape = () => {
    switch (variant) {
      case 'bar':
        return (
          <div className="flex items-end justify-center gap-2 h-full px-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-6 rounded-t bg-zinc-200 dark:bg-zinc-800"
                style={{ height: `${20 + Math.random() * 80}%` }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        );
      case 'donut':
        return (
          <div className="flex items-center justify-center h-full">
            <motion.div
              className="w-40 h-40 rounded-full border-[12px] border-zinc-200 dark:border-zinc-800"
              style={{ borderRightColor: '#4ade80', borderBottomColor: '#3b82f6', borderLeftColor: '#a855f7' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        );
      case 'scatter':
        return (
          <div className="relative h-full p-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        );
      case 'heatmap':
        return (
          <div className="grid grid-cols-3 gap-2 p-4 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="rounded-sm bg-zinc-200 dark:bg-zinc-800"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.08 }}
              />
            ))}
          </div>
        );
      case 'line':
        return (
          <div className="flex items-end justify-center gap-1 h-full px-4 pb-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-3 rounded-t bg-zinc-200 dark:bg-zinc-800"
                style={{ height: `${20 + Math.random() * 70}%` }}
                animate={{ height: [`${20 + Math.random() * 70}%`, `${20 + Math.random() * 70}%`] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        );
      case 'area':
      default:
        return (
          <div className="relative h-full p-4">
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-3/4 rounded-t-lg"
              style={{
                background: 'linear-gradient(to top, rgba(74,222,128,0.15) 0%, rgba(74,222,128,0.02) 100%)',
              }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1/2 rounded-t-lg"
              style={{
                background: 'linear-gradient(to top, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.01) 100%)',
              }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-800" />
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700"
                style={{
                  left: `${10 + i * 16}%`,
                  bottom: `${20 + Math.random() * 30}%`,
                }}
                animate={{ scale: [1, 1.8, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <motion.div
      className={`relative w-full h-full ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {getShape()}
    </motion.div>
  );
}
