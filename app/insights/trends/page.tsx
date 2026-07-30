'use client';

import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import {
  fetchTrendsData,
  type TrendsPayload,
} from '@/lib/services';

export default function TrendsPage() {
  const [payload, setPayload] = useState<TrendsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTrendsData();
      setPayload(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trends');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Enrollment Trends</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Term-over-term movement by segment.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs hover:border-black dark:border-zinc-700 dark:hover:border-white disabled:opacity-50"
        >
          Refresh
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
            <p className="font-medium">Unable to load trends</p>
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
            className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/50"
          >
            <div className="flex animate-pulse flex-col gap-3">
              <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-[420px] w-full rounded bg-zinc-100 dark:bg-zinc-900" />
            </div>
          </motion.div>
        ) : payload.trends.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-zinc-200 bg-white/70 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-black/50"
          >
            No trend data available yet.
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/50"
          >
            <BarChart width={900} height={420} data={payload.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <Legend />
              <XAxis dataKey="term" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Bar dataKey="freshman" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="transfer" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="grad" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
