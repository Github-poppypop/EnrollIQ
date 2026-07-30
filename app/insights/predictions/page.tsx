'use client';

import { useState, useEffect } from 'react';
import { Line, LineChart, CartesianGrid, Legend, XAxis, YAxis, Tooltip } from 'recharts';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  fetchPredictionsData,
  type PredictionsPayload,
} from '@/lib/services';

export default function PredictionsPage() {
  const [payload, setPayload] = useState<PredictionsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState('SeasonalNaive');

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPredictionsData();
      setPayload(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load predictions');
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Predictions</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Modeled enrollment outlook with prediction intervals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          >
            {payload?.models?.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            )) ?? (
              <>
                <option>SeasonalNaive</option>
                <option>ProphetAlt</option>
                <option>LightGBM</option>
              </>
            )}
          </select>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-2 text-sm hover:border-black dark:border-zinc-700 dark:hover:border-white disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
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
            <p className="font-medium">Unable to load predictions</p>
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
              <div className="h-96 w-full rounded bg-zinc-100 dark:bg-zinc-900" />
            </div>
          </motion.div>
        ) : payload.forecast.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-zinc-200 bg-white/70 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-black/50"
          >
            No forecast data available for this model.
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/50"
          >
            <LineChart width={900} height={420} data={payload.forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <Legend />
              <XAxis dataKey="term" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="actual" stroke="#111827" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="upper" stroke="#3b82f6" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="lower" stroke="#3b82f6" strokeDasharray="5 5" />
            </LineChart>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
