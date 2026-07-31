'use client';

import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChartExportButton } from './ChartExportButton';
import { CustomTooltip } from './CustomTooltip';

interface HeatmapCell {
  term: string;
  segment: string;
  value: number;
}

interface HeatmapChartProps {
  data: HeatmapCell[];
  title: string;
  subtitle?: string;
  filename?: string;
}

export function HeatmapChart({
  data,
  title,
  subtitle,
  filename = 'enrollment-heatmap',
}: HeatmapChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  if (data.length === 0) {
    return (
      <motion.div
        className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/50"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-sm font-medium">{title}</div>
        {subtitle && <div className="text-xs text-zinc-500">{subtitle}</div>}
        <div className="mt-4" />
      </motion.div>
    );
  }

  const terms = Array.from(new Set(data.map((d) => d.term)));
  const segments = Array.from(new Set(data.map((d) => d.segment)));

  const maxVal = Math.max(...data.map((d) => d.value));
  const minVal = Math.min(...data.map((d) => d.value));

  function intensityColor(value: number): string {
    const t = maxVal === minVal ? 0.5 : (value - minVal) / (maxVal - minVal);
    // Green (low) → Amber (mid) → Red (high)
    if (t < 0.5) {
      const r = Math.round(34 + (245 - 34) * (t * 2));
      const g = Math.round(197 + (218 - 197) * (t * 2));
      const b = Math.round(94 + (59 - 94) * (t * 2));
      return `rgba(${r},${g},${b},0.3)`;
    }
    const t2 = (t - 0.5) * 2;
    const r = Math.round(245 + (239 - 245) * t2);
    const g = Math.round(218 + (68 - 218) * t2);
    const b = Math.round(59 + (68 - 59) * t2);
    return `rgba(${r},${g},${b},0.35)`;
  }

  return (
    <motion.div
      className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/50"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{title}</div>
          {subtitle && <div className="text-xs text-zinc-500">{subtitle}</div>}
        </div>
        {chartRef && <ChartExportButton chartRef={chartRef} filename={filename} />}
      </div>

      <div ref={chartRef} className="mt-4">
        <div className="overflow-x-auto">
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: `80px repeat(${terms.length}, 1fr)` }}>
            {/* Header row */}
            <div />
            {terms.map((term) => (
              <div key={term} className="text-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {term}
              </div>
            ))}

            {/* Data rows */}
            {segments.map((segment) => (
              <>
                <div key={`label-${segment}`} className="flex items-center text-xs font-medium text-zinc-700 dark:text-zinc-300 pr-2">
                  {segment}
                </div>
                {terms.map((term) => {
                  const cell = data.find((d) => d.term === term && d.segment === segment);
                  const value = cell?.value ?? 0;
                  const isHovered = hoveredCell?.term === term && hoveredCell?.segment === segment;

                  return (
                    <motion.div
                      key={`${term}-${segment}`}
                      className="flex items-center justify-center rounded-md py-3 text-xs font-semibold cursor-pointer"
                      style={{
                        backgroundColor: intensityColor(value),
                        border: isHovered ? '2px solid #3b82f6' : '2px solid transparent',
                      }}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                      onMouseEnter={() => cell && setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {value > 0 ? value : '—'}
                    </motion.div>
                  );
                })}
              </>
            ))}
          </div>
        </div>

        {/* Color legend */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-zinc-500">Low</span>
          <div className="h-3 flex-1 rounded-full" style={{ background: 'linear-gradient(to right, rgba(34,197,94,0.3), rgba(245,218,64,0.4), rgba(239,68,68,0.35))' }} />
          <span className="text-xs text-zinc-500">High</span>
          {hoveredCell && (
            <motion.span className="ml-2 text-xs text-zinc-600 dark:text-zinc-400">
              {hoveredCell.term} / {hoveredCell.segment}: {hoveredCell.value}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
