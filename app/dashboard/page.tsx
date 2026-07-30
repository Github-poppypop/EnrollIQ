'use client';

import { TrendingUp, Users, BookOpen, BarChart3 } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { AreaChart as MotionAreaChart } from 'recharts';
import { useState } from 'react';
import { motion } from 'motion/react';

const metrics = [
  { title: 'Enrollment', value: '1,284', delta: '+4.2%', icon: Users },
  { title: 'Avg Credits', value: '14.7', delta: '+0.3', icon: BookOpen },
  { title: 'Retention', value: '91.4%', delta: '+1.1%', icon: TrendingUp },
  { title: 'Model MAE', value: '38', delta: '-12%', icon: BarChart3 },
];

const data = [
  { term: 'FA22', actual: 980, forecast: 970 },
  { term: 'SP23', actual: 1024, forecast: 1010 },
  { term: 'FA23', actual: 1102, forecast: 1095 },
  { term: 'SP24', actual: 1176, forecast: 1188 },
  { term: 'FA24', actual: 1210, forecast: 1240 },
];

export default function DashboardPage() {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Enrollment health and forecast signal.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <motion.div
            key={m.title}
            className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/50"
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">{m.title}</div>
              <m.icon className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="mt-2 text-2xl font-semibold">{m.value}</div>
            <div className="text-xs text-green-700">{m.delta}</div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Demand vs Capacity</div>
            <div className="text-xs text-zinc-500">Term sequence snapshot</div>
          </div>
        </div>
        <AreaChart width={800} height={320} data={data} className="mx-auto mt-4">
          <defs>
            <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#93c5fd" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="term" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#22c55e"
            fill="url(#fillActual)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="forecast"
            stroke="#3b82f6"
            fill="url(#fillForecast)"
            strokeWidth={2}
          />
        </AreaChart>
      </div>
    </div>
  );
}
