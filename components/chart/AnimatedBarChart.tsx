'use client';

import { useRef, useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { motion } from 'motion/react';
import { ChartContainer } from './ChartContainer';
import { ChartExportButton } from './ChartExportButton';
import { CustomTooltip } from './CustomTooltip';

interface TrendPoint {
  term: string;
  freshman: number;
  transfer: number;
  grad: number;
}

interface AnimatedBarChartProps {
  data: TrendPoint[];
  title: string;
  subtitle?: string;
  filename?: string;
}

function getBarColor(value: number, index: number, prevValue?: number): string {
  if (prevValue !== undefined && value < prevValue) return '#ef4444';
  if (prevValue !== undefined && value > prevValue) return '#22c55e';
  return ['#22c55e', '#3b82f6', '#a855f7'][index % 3];
}

interface CountUpLabelProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  color?: string;
}

function CountUpLabel({ target, duration = 1, prefix = '', suffix = '', color }: CountUpLabelProps) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = null;
    setCount(0);
    const animate = (ts: number) => {
      if (startTimeRef.current === null) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * target);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return (
    <text fill={color} fontSize={10} fontWeight={600} textAnchor="middle">
      {prefix}{Math.round(count).toLocaleString()}{suffix}
    </text>
  );
}

export function AnimatedBarChart({
  data,
  title,
  subtitle,
  filename = 'trends-chart',
}: AnimatedBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [animatedData, setAnimatedData] = useState<TrendPoint[]>([]);
  const [animPhase, setAnimPhase] = useState(0);

  // Sequential bar animation: animate each term group one after another
  useEffect(() => {
    if (data.length === 0) {
      setAnimatedData([]);
      return;
    }
    setAnimPhase(0);
    const timers: number[] = [];
    const staggerMs = 200;
    data.forEach((d, i) => {
      const timer = window.setTimeout(() => {
        setAnimatedData((prev) => {
          const next = [...prev];
          next[i] = d;
          return next;
        });
        setAnimPhase(i + 1);
      }, i * staggerMs);
      timers.push(timer);
    });
    return () => timers.forEach(clearTimeout);
  }, [data]);

  // Compare each category's total to previous term for delta coloring
  const prevTotals = data.length > 1 ? data[data.length - 2] : null;

  return (
    <motion.div
      className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/50"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
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

      {/* Legend with growth explanation */}
      <div className="mt-2 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Growth
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Decline
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="h-2 w-2 rounded-full bg-zinc-400" />
          Baseline
        </div>
      </div>

      <div ref={chartRef} className="mt-4">
        {data.length === 0 ? (
          <div className="h-64" />
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="term" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {/* Freshman bars */}
              <Bar
                dataKey="freshman"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                animationDuration={600}
                animationBegin={0}
              >
                <LabelList
                  dataKey="freshman"
                  position="top"
                  fontSize={10}
                  fill="#22c55e"
                  fontWeight={600}
                />
              </Bar>
              {/* Transfer bars */}
              <Bar
                dataKey="transfer"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                animationDuration={600}
                animationBegin={150}
              >
                <LabelList
                  dataKey="transfer"
                  position="top"
                  fontSize={10}
                  fill="#3b82f6"
                  fontWeight={600}
                />
              </Bar>
              {/* Grad bars */}
              <Bar
                dataKey="grad"
                fill="#a855f7"
                radius={[4, 4, 0, 0]}
                animationDuration={600}
                animationBegin={300}
              >
                <LabelList
                  dataKey="grad"
                  position="top"
                  fontSize={10}
                  fill="#a855f7"
                  fontWeight={600}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
