'use client';

import { useRef } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from 'recharts';
import { motion } from 'motion/react';
import { ChartContainer } from './ChartContainer';
import { ChartExportButton } from './ChartExportButton';
import { CustomTooltip } from './CustomTooltip';

interface ScatterPoint {
  term: string;
  demand: number;
  capacity: number;
}

interface ScatterPlotProps {
  data: ScatterPoint[];
  title: string;
  subtitle?: string;
  filename?: string;
}

export function ScatterPlot({
  data,
  title,
  subtitle,
  filename = 'correlation-chart',
}: ScatterPlotProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Simple linear regression
  const regression = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return null;
    const n = points.length;
    const sumX = points.reduce((s, p) => s + p.x, 0);
    const sumY = points.reduce((s, p) => s + p.y, 0);
    const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
    const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return null;
    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
  };

  const regressionData = (() => {
    if (data.length < 2) return [];
    const points = data.map((d) => ({ x: d.capacity, y: d.demand }));
    const reg = regression(points);
    if (!reg) return [];
    const xs = points.map((p) => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    return [
      { capacity: minX, demand: reg.slope * minX + reg.intercept },
      { capacity: maxX, demand: reg.slope * maxX + reg.intercept },
    ];
  })();

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
        {data.length === 0 ? (
          <div className="h-64" />
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis
                type="number"
                dataKey="capacity"
                name="Capacity"
                tick={{ fontSize: 12 }}
                tickLine={false}
                label={{ value: 'Capacity', position: 'bottom', fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="demand"
                name="Demand"
                tick={{ fontSize: 12 }}
                tickLine={false}
                label={{ value: 'Demand', angle: -90, position: 'left', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              {regressionData.length >= 2 && (
                <Line
                  type="linear"
                  data={regressionData}
                  dataKey="demand"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              <Scatter
                data={data}
                fill="#3b82f6"
                fillOpacity={0.7}
                stroke="#1d4ed8"
                strokeWidth={1}
                animationDuration={1000}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
