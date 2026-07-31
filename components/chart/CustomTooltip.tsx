'use client';

import { ReactNode } from 'react';

interface TooltipData {
  name?: string;
  value?: number;
  color?: string;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
    payload?: TooltipData;
  }>;
  label?: string;
}

export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-black/90">
      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
        {label}
      </p>
      {payload.map((entry, i) => {
        const data = entry.payload as TooltipData;
        return (
          <div key={i} className="mt-1 flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-zinc-600 dark:text-zinc-400">
              {entry.name ?? entry.dataKey}
            </span>
            <span className="ml-auto font-semibold text-zinc-900 dark:text-zinc-100">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        );
      })}
      {payload[0]?.payload?.delta && (
        <div className="mt-1.5 flex items-center gap-1 text-xs">
          <span
            className={`font-medium ${
              (payload[0].payload as TooltipData).deltaType === 'negative'
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >
            {(payload[0].payload as TooltipData).delta}
          </span>
          <span className="text-zinc-500">vs prior</span>
        </div>
      )}
    </div>
  );
}
