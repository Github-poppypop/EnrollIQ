'use client';

import { TrendingUp, Users, BookOpen, BarChart3 } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  fetchDashboardData,
  type DashboardPayload,
} from '@/lib/services';

const iconMap: Record<string, React.ElementType> = {
  Users,
  BookOpen,
  TrendingUp,
  BarChart3,
};

export default function DashboardPage() {
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardData();
      setPayload(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Load on mount (once)
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Enrollment health and forecast signal.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={load}
          disabled={loading}
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs hover:border-black dark:border-zinc-700 dark:hover:border-white disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            <p className="font-medium">Unable to load dashboard</p>
            <p className="mt-1">{error}</p>
            <button
              onClick={load}
              className="mt-3 rounded-full border border-red-300 px-3 py-1 text-xs hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900"
            >
              Retry
            </button>
          </motion.div>
        ) : !payload ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-black/50"
              >
                <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="mt-3 h-7 w-16 rounded bg-zinc-300 dark:bg-zinc-700" />
                <div className="mt-2 h-3 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex flex-col gap-6"
          >
            {payload.metrics.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white/70 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-black/50">
                No metrics available yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {payload.metrics.map((m) => {
                  const Icon = iconMap[m.icon] ?? BarChart3;
                  return (
                    <motion.div
                      key={m.title}
                      className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/50"
                      whileHover={{ y: -2 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">{m.title}</div>
                        <Icon className="h-4 w-4 text-zinc-500" />
                      </div>
                      <div className="mt-2 text-2xl font-semibold">{m.value}</div>
                      <div className="text-xs text-green-700 dark:text-green-400">{m.delta}</div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Demand vs Capacity</div>
                  <div className="text-xs text-zinc-500">Term sequence snapshot</div>
                </div>
              </div>
              {payload.demandCapacity.length === 0 ? (
                <div className="mt-8 text-center text-sm text-zinc-500">
                  No demand data available.
                </div>
              ) : (
                <AreaChart width={800} height={320} data={payload.demandCapacity} className="mx-auto mt-4">
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
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
