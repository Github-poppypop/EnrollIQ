'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download } from 'lucide-react';
import {
  fetchPredictionsData,
  type PredictionsPayload,
} from '@/lib/services';
import type { Tab } from '@/components/chart/TabbedView';
import { GlassCard } from '@/components/chart/GlassCard';
import { AmbientBackground } from '@/components/chart/AmbientBackground';
import { PredictionsChart } from '@/components/chart/PredictionsChart';
import { EmptyState } from '@/components/chart/EmptyState';
import { ChartSkeleton } from '@/components/chart/ChartSkeleton';
import { CustomTooltip } from '@/components/chart/CustomTooltip';
import { PulseIndicator } from '@/components/chart/PulseIndicator';
import { TabbedView } from '@/components/chart/TabbedView';
import { CountUp } from '@/components/chart/CountUp';

export default function PredictionsPage() {
  const [payload, setPayload] = useState<PredictionsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState('SeasonalNaive');
  const [activeTab, setActiveTab] = useState<'chart' | 'summary'>('chart');

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

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const forecast = payload?.forecast ?? [];
  const models = payload?.models ?? [];

  const tabs: Tab[] = [
    { id: 'chart', label: 'Chart' },
    { id: 'summary', label: 'Summary' },
  ];

  return (
    <AmbientBackground>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Predictions</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Modeled enrollment outlook with confidence band and interactive brush.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PulseIndicator active={true} />
            <div className="flex items-center gap-2">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="clay-card px-3 py-2 font-body-sm text-body-sm text-on-surface"
              >
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <button
                onClick={load}
                disabled={loading}
                className="clay-btn inline-flex items-center gap-2 py-2 px-3 font-label-md text-label-md text-on-surface disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
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
              <button onClick={load} className="mt-3 clay-btn py-1.5 px-3 font-label-md text-label-md text-secondary">
   Retry
              </button>
            </motion.div>
          ) : !payload ? (
            <GlassCard>
              <ChartSkeleton variant="line" />
            </GlassCard>
          ) : forecast.length === 0 ? (
            <EmptyState title="No forecast data" description="Forecast data will appear once available for this model." />
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex flex-col gap-6"
            >
              <TabbedView activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs}>
                {{
                  chart: (
                    <PredictionsChart
                      data={forecast}
                      models={models}
                      selectedModel={model}
                      onModelChange={setModel}
                    />
                  ),
                  summary: (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {forecast.filter((f) => f.actual !== null).map((f) => (
                        <GlassCard key={f.term} hover glow>
                          <div className="text-xs text-zinc-500">{f.term}</div>
                          <div className="mt-2 flex items-end gap-3">
                            <CountUp end={f.actual ?? 0} className="text-2xl font-semibold" />
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs">
                            <span className="text-blue-600 dark:text-blue-400">
                              Low: {f.lower}
                            </span>
                            <span className="text-zinc-400">|</span>
                            <span className="text-blue-600 dark:text-blue-400">
                              High: {f.upper}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                            <motion.div
                              className="h-full rounded-full bg-blue-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, ((f.actual ?? 0) / (f.upper * 1.2)) * 100)}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  ),
                }}
              </TabbedView>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AmbientBackground>
  );
}
