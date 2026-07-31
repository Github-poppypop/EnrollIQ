'use client';

import { useRef, useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Area,
} from 'recharts';
import { motion } from 'motion/react';
import { Download, Wand2 } from 'lucide-react';
import { ChartContainer } from './ChartContainer';
import { ChartExportButton } from './ChartExportButton';
import { CustomTooltip } from './CustomTooltip';

interface ForecastPoint {
  term: string;
  lower: number | null;
  actual: number | null;
  upper: number;
}

interface PredictionsChartProps {
  data: ForecastPoint[];
  models: string[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  filename?: string;
}

export function PredictionsChart({
  data,
  models,
  selectedModel,
  onModelChange,
  filename = 'predictions-chart',
}: PredictionsChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(data.length - 1);

  // Filtered data based on range slider
  const filteredData = useMemo(() => {
    return data.slice(rangeStart, rangeEnd + 1);
  }, [data, rangeStart, rangeEnd]);

  // Reset range when data changes
  useMemo(() => {
    setRangeEnd(Math.max(0, data.length - 1));
    setRangeStart(0);
  }, [data]);

  // Calculate brush track positions as percentages
  const totalTerms = Math.max(data.length, 1);
  const startPct = (rangeStart / totalTerms) * 100;
  const endPct = (rangeEnd / totalTerms) * 100;

  return (
    <motion.div
      className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/50"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Forecast with Confidence Band</div>
          <div className="text-xs text-zinc-500">{selectedModel} model — prediction interval</div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-black"
          >
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {chartRef && <ChartExportButton chartRef={chartRef} filename={filename} />}
        </div>
      </div>

      <div ref={chartRef} className="mt-4">
        {data.length === 0 ? (
          <div className="h-64" />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis dataKey="term" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                {/* Confidence band */}
                <ReferenceArea y1={0} y2={0} fill="transparent" />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stackId="1"
                  stroke="none"
                  fill="url(#confidenceBand)"
                  animationDuration={1000}
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stackId="1"
                  stroke="none"
                  fill="url(#confidenceBand)"
                  animationDuration={1000}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#111827"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#111827' }}
                  activeDot={{ r: 6, stroke: '#111827', strokeWidth: 2, fill: '#fff' }}
                  animationDuration={1200}
                />
                <Line
                  type="monotone"
                  dataKey="upper"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  dot={false}
                  animationDuration={1200}
                />
                <Line
                  type="monotone"
                  dataKey="lower"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  dot={false}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Custom time-range slider */}
            <div className="mt-3 px-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500">Time range</span>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {filteredData.length > 0 ? `${filteredData[0].term} — ${filteredData[filteredData.length - 1].term}` : ''}
                </span>
              </div>
              <div className="relative h-8 flex items-center">
                {/* Track background */}
                <div className="absolute left-0 right-0 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                {/* Selected range highlight */}
                <motion.div
                  className="absolute h-1 rounded-full bg-blue-500"
                  style={{
                    left: `${startPct}%`,
                    width: `${endPct - startPct}%`,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
                {/* Start handle */}
                <input
                  type="range"
                  min={0}
                  max={totalTerms - 1}
                  value={rangeStart}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setRangeStart(Math.min(v, rangeEnd - 1));
                  }}
                  className="absolute left-0 w-full h-8 appearance-none bg-transparent opacity-0 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                />
                {/* End handle */}
                <input
                  type="range"
                  min={0}
                  max={totalTerms - 1}
                  value={rangeEnd}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setRangeEnd(Math.max(v, rangeStart + 1));
                  }}
                  className="absolute left-0 w-full h-8 appearance-none bg-transparent opacity-0 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                />
                {/* Labels */}
                <div className="absolute left-0 right-0 flex justify-between text-[10px] text-zinc-400 pointer-events-none">
                  <span>{data[0]?.term ?? ''}</span>
                  <span>{data[Math.floor(totalTerms / 2)]?.term ?? ''}</span>
                  <span>{data[data.length - 1]?.term ?? ''}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
