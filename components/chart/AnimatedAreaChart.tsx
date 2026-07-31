'use client';

import { useRef, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
  ReferenceLine,
  Label,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { ChartContainer } from './ChartContainer';
import { ChartExportButton } from './ChartExportButton';
import { CustomTooltip } from './CustomTooltip';

interface DataPoint {
  term: string;
  actual: number;
  forecast: number;
}

interface AnimatedAreaChartProps {
  data: DataPoint[];
  title: string;
  subtitle?: string;
  filename?: string;
}

export function AnimatedAreaChart({
  data,
  title,
  subtitle,
  filename = 'demand-chart',
}: AnimatedAreaChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleMouseMove = useCallback(
    (e: any) => {
      if (e?.activeTooltipIndex != null) {
        setActiveIndex(e.activeTooltipIndex);
      }
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

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

      <div ref={chartRef} className="mt-4">
        {data.length === 0 ? (
          <div className="h-64" />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="term" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {/* Crosshair cursor */}
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#22c55e"
                strokeWidth={2.5}
                fill="url(#gradActual)"
                dot={(props: any) => {
                  const { cx, cy, payload, index } = props;
                  if (activeIndex !== null && index === activeIndex) {
                    return (
                      <g>
                        <line
                          x1={cx}
                          y1={0}
                          x2={cx}
                          y2={cy}
                          stroke="#94a3b8"
                          strokeWidth={1}
                          strokeDasharray="4 3"
                          opacity={0.6}
                        />
                        <circle cx={cx} cy={cy} r={5} fill="#22c55e" stroke="#fff" strokeWidth={2} />
                        <circle cx={cx} cy={cy} r={2} fill="#fff" />
                      </g>
                    );
                  }
                  return <Dot r={4} fill="#22c55e" stroke="#fff" strokeWidth={2} />;
                }}
                activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2, fill: '#fff' }}
                animationDuration={1200}
                animationEasing="ease-out"
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="6 3"
                fill="url(#gradForecast)"
                dot={{ r: 3, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1400}
                animationEasing="ease-out"
              />
              {/* Crosshair vertical line */}
              <ReferenceLine
                x={activeIndex != null && data[activeIndex] ? data[activeIndex].term : ''}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="4 3"
                opacity={0.5}
                ifOverflow="hidden"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
