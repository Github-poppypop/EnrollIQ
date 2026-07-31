'use client';

import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import {
  fetchTrendsData,
  type TrendsPayload,
  type TrendPoint,
} from '@/lib/services';
import type { Tab } from '@/components/chart/TabbedView';
import { GlassCard } from '@/components/chart/GlassCard';
import { AmbientBackground } from '@/components/chart/AmbientBackground';
import { AnimatedBarChart } from '@/components/chart/AnimatedBarChart';
import { HeatmapChart } from '@/components/chart/HeatmapChart';
import { DonutChart } from '@/components/chart/DonutChart';
import { EmptyState } from '@/components/chart/EmptyState';
import { ChartSkeleton } from '@/components/chart/ChartSkeleton';
import { CustomTooltip } from '@/components/chart/CustomTooltip';
import { TabbedView } from '@/components/chart/TabbedView';
import { PulseIndicator } from '@/components/chart/PulseIndicator';

export default function TrendsPage() {
  const [payload, setPayload] = useState<TrendsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bars' | 'heatmap' | 'donut'>('bars');

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

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trends = payload?.trends ?? [];
  const donutData = [
    { name: 'Freshman', value: trends.length > 0 ? trends[trends.length - 1].freshman : 0, color: '#22c55e' },
    { name: 'Transfer', value: trends.length > 0 ? trends[trends.length - 1].transfer : 0, color: '#3b82f6' },
    { name: 'Grad', value: trends.length > 0 ? trends[trends.length - 1].grad : 0, color: '#a855f7' },
  ];

  const heatmapData = trends.flatMap((t) => [
    { term: t.term, segment: 'freshman', value: t.freshman },
    { term: t.term, segment: 'transfer', value: t.transfer },
    { term: t.term, segment: 'grad', value: t.grad },
  ]);

  const tabs: Tab[] = [
    { id: 'bars', label: 'Bar Chart' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'donut', label: 'Donut' },
  ];

  return (
    <AmbientBackground>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Enrollment Trends</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Term-over-term movement by segment — animated, interactive, rich.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PulseIndicator active={true} />
            <button
              onClick={load}
              disabled={loading}
              className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs hover:border-black dark:border-zinc-700 dark:hover:border-white disabled:opacity-50"
            >
              {loading ? 'Refreshing…' : 'Refresh'}
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
              <p className="font-medium">Unable to load trends</p>
              <p className="mt-1">{error}</p>
              <button onClick={load} className="mt-3 rounded-full border border-red-300 px-3 py-1 text-xs hover:bg-red-100">
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
              <ChartSkeleton variant="bar" />
            </motion.div>
          ) : trends.length === 0 ? (
            <EmptyState title="No trend data" description="Trend data will appear once available." />
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex flex-col gap-6"
            >
              {/* Tabbed view with smooth transitions */}
              <TabbedView activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs}>
                {{
                  bars: (
                    <AnimatedBarChart
                      data={trends}
                      title="Term-by-Term Breakdown"
                      subtitle="Color-coded by segment — bars animate in sequence"
                    />
                  ),
                  heatmap: (
                    <HeatmapChart
                      data={heatmapData}
                      title="Enrollment Intensity Matrix"
                      subtitle="Term × Segment — hover for exact values"
                    />
                  ),
                  donut: (
                    <div className="flex flex-col gap-4">
                      <DonutChart
                        data={donutData}
                        title="Latest Enrollment by Segment"
                        subtitle={`${trends[trends.length - 1]?.term ?? 'N/A'} snapshot`}
                      />
                      {trends.length >= 2 && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          {donutData.map((d) => (
                            <GlassCard key={d.name} hover>
                              <div className="text-center">
                                <div className="text-xs text-zinc-500">{d.name}</div>
                                <div className="mt-1 text-xl font-semibold" style={{ color: d.color }}>
                                  {d.value}
                                </div>
                                <div className="text-xs text-zinc-400 mt-1">
                                  {d.value} / {donutData.reduce((s, x) => s + x.value, 0)} total
                                </div>
                              </div>
                            </GlassCard>
                          ))}
                        </div>
                      )}
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
