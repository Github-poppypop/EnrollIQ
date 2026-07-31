'use client';

import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChartExportButton } from './ChartExportButton';
import { CustomTooltip } from './CustomTooltip';

interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  title: string;
  subtitle?: string;
  size?: number;
  filename?: string;
}

export function DonutChart({
  data,
  title,
  subtitle,
  size = 200,
  filename = 'enrollment-donut',
}: DonutChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const radius = size * 0.4;
  const strokeWidth = size * 0.15;
  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const innerCircumference = 2 * Math.PI * innerRadius;

  let cumulativeOffset = 0;
  const segments = data.map((d, i) => {
    const fraction = d.value / total;
    const strokeDasharray = `${fraction * circumference} ${circumference - fraction * circumference}`;
    const offset = -cumulativeOffset;
    cumulativeOffset += fraction * circumference;

    return { ...d, index: i, strokeDasharray, offset };
  });

  return (
    <motion.div
      className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/50"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{title}</div>
          {subtitle && (
            <div className="text-xs text-zinc-500">{subtitle}</div>
          )}
        </div>
        {chartRef && <ChartExportButton chartRef={chartRef} filename={filename} />}
      </div>

      <div ref={chartRef} className="mt-4 flex items-center justify-center gap-6">
        {data.length === 0 ? (
          <div className="h-48" />
        ) : (
          <>
            <motion.svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="overflow-visible"
            >
              {segments.map((seg, i) => (
                <motion.circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.offset}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: seg.offset }}
                  transition={{ duration: 1.2, delay: i * 0.2, ease: 'easeOut' }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    filter: hoveredIndex === i ? `drop-shadow(0 0 6px ${seg.color}40)` : 'none',
                    transition: 'filter 0.2s',
                    cursor: 'pointer',
                    transformOrigin: 'center',
                  }}
                />
              ))}
              {/* Center text */}
              <motion.text
                x={size / 2}
                y={size / 2 - 4}
                textAnchor="middle"
                className="text-lg font-semibold"
                fill="currentColor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {total}
              </motion.text>
              <motion.text
                x={size / 2}
                y={size / 2 + 14}
                textAnchor="middle"
                className="text-xs"
                fill="#71717a"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                total
              </motion.text>
            </motion.svg>

            <div className="flex flex-col gap-2">
              {segments.map((seg, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  animate={{
                    scale: hoveredIndex === i ? 1.05 : 1,
                    backgroundColor: hoveredIndex === i ? `${seg.color}15` : 'transparent',
                  }}
                  transition={{ duration: 0.2 }}
                  style={{ borderRadius: 6, padding: '4px 8px' }}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-xs font-medium" style={{ color: seg.color }}>
                    {seg.name}
                  </span>
                  <span className="ml-auto text-xs text-zinc-600 dark:text-zinc-400">
                    {seg.value} ({((seg.value / total) * 100).toFixed(1)}%)
                  </span>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
