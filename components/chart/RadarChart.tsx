'use client';

import { useRef } from 'react';
import { motion } from 'motion/react';
import { ChartContainer } from './ChartContainer';
import { ChartExportButton } from './ChartExportButton';

interface RadarDimension {
  name: string;
  value: number;
}

interface RadarChartProps {
  data: RadarDimension[][];
  institutions: string[];
  colors?: string[];
  title: string;
  subtitle?: string;
  filename?: string;
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function polygonPoints(cx: number, cy: number, radius: number, sides: number) {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (360 / sides) * i;
    const { x, y } = polarToCartesian(cx, cy, radius, angle);
    pts.push(`${x},${y}`);
  }
  return pts.join(' ');
}

export function RadarVisualization({
  data,
  institutions,
  colors = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#a855f7'],
  title,
  subtitle,
  filename = 'radar-chart',
}: RadarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const size = 400;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 140;
  const sides = data[0]?.length ?? 0;

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

      <div ref={chartRef} className="mt-4 flex justify-center">
        {data.length === 0 ? (
          <div className="h-64" />
        ) : (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Grid rings */}
            {[0.25, 0.5, 0.75, 1].map((scale, i) => (
              <polygon
                key={i}
                points={polygonPoints(cx, cy, maxRadius * scale, sides)}
                fill="none"
                stroke="#e4e4e7"
                strokeWidth={1}
                strokeOpacity={0.5}
              />
            ))}
            {/* Axes */}
            {data[0].map((_, i) => {
              const angle = (360 / sides) * i;
              const { x, y } = polarToCartesian(cx, cy, maxRadius, angle);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="#e4e4e7"
                  strokeWidth={1}
                />
              );
            })}
            {/* Data polygons */}
            {data.map((institutionData, i) => {
              const color = colors[i % colors.length];
              const points = institutionData
                .map((d, j) => {
                  const angle = (360 / sides) * j;
                  const r = (d.value / 100) * maxRadius;
                  const { x, y } = polarToCartesian(cx, cy, r, angle);
                  return `${x},${y}`;
                })
                .join(' ');
              return (
                <motion.polygon
                  key={i}
                  points={points}
                  fill={color}
                  fillOpacity={0.15}
                  stroke={color}
                  strokeWidth={2}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
              );
            })}
            {/* Dots */}
            {data.map((institutionData, i) => {
              const color = colors[i % colors.length];
              return institutionData.map((d, j) => {
                const angle = (360 / sides) * j;
                const r = (d.value / 100) * maxRadius;
                const { x, y } = polarToCartesian(cx, cy, r, angle);
                return (
                  <circle
                    key={`${i}-${j}`}
                    cx={x}
                    cy={y}
                    r={4}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={1.5}
                  />
                );
              });
            })}
            {/* Labels */}
            {data[0].map((d, i) => {
              const angle = (360 / sides) * i;
              const labelRadius = maxRadius + 22;
              const { x, y } = polarToCartesian(cx, cy, labelRadius, angle);
              return (
                <text
                  key={i}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={11}
                  fill="#71717a"
                >
                  {d.name}
                </text>
              );
            })}
          </svg>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex justify-center gap-4">
        {institutions.map((inst, i) => (
          <div key={inst} className="flex items-center gap-1.5 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-zinc-600 dark:text-zinc-400">{inst}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
