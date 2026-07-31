'use client';

import { motion } from 'motion/react';
import type React from 'react';
import { CountUp } from './CountUp';
import { Sparkline } from './Sparkline';

interface MetricCardProps {
  title: string;
  value: number;
  delta: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ElementType;
  sparklineData?: number[];
  prefix?: string;
  suffix?: string;
}

export function MetricCard({
  title,
  value,
  delta,
  deltaType = 'neutral',
  icon: Icon,
  sparklineData = [],
  prefix = '',
  suffix = '',
}: MetricCardProps) {
  const deltaColor =
    deltaType === 'positive'
      ? 'text-green-700 dark:text-green-400'
      : deltaType === 'negative'
        ? 'text-red-700 dark:text-red-400'
        : 'text-zinc-600 dark:text-zinc-400';

  return (
    <motion.div
      className="rounded-2xl border border-white/20 bg-white/60 backdrop-blur-xl p-4 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 transition-shadow duration-300 dark:border-white/5 dark:bg-white/[0.04]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2, scale: 1.01 }}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {title}
        </div>
        {Icon && <Icon className="h-4 w-4 text-zinc-400" />}
      </div>
      <div className="mt-2 flex items-end gap-3">
        <CountUp
          end={value}
          prefix={prefix}
          suffix={suffix}
          decimals={suffix === '%' ? 1 : 0}
          className="text-2xl font-semibold"
        />
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className={`text-xs font-medium ${deltaColor}`}>
          {delta}
        </span>
        {sparklineData.length > 1 && (
          <Sparkline
            data={sparklineData}
            width={64}
            height={24}
            color={
              deltaType === 'positive'
                ? '#22c55e'
                : deltaType === 'negative'
                  ? '#ef4444'
                  : '#94a3b8'
            }
          />
        )}
      </div>
    </motion.div>
  );
}
