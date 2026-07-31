'use client';

import { MotionProps, motion } from 'motion/react';

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  aspectRatio?: number;
}

export function ChartContainer({
  children,
  className = '',
  aspectRatio = 16 / 9,
}: ChartContainerProps) {
  return (
    <motion.div
      className={`relative w-full ${className}`}
      style={{ aspectRatio }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0">{children}</div>
    </motion.div>
  );
}
