'use client';

import { Users, BookOpen, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  fetchDashboardData,
  type DashboardPayload,
} from '@/lib/services';
import { GlassCard } from '@/components/chart/GlassCard';
import { AmbientBackground } from '@/components/chart/AmbientBackground';
import { AnimatedAreaChart } from '@/components/chart/AnimatedAreaChart';
import { MetricCard } from '@/components/chart/MetricCard';
import { EmptyState } from '@/components/chart/EmptyState';
import { ChartSkeleton } from '@/components/chart/ChartSkeleton';
import { PulseIndicator } from '@/components/chart/PulseIndicator';
import { CustomTooltip } from '@/components/chart/CustomTooltip';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const sparklineTrends: Record<string, number[]> = {
  'Enrollment': [1180, 1200, 1220, 1240, 1260, 1284],
  'Avg Credits': [14.2, 14.3, 14.4, 14.5, 14.6, 14.7],
  'Retention': [89.5, 90.1, 90.8, 91.0, 91.2, 91.4],
  'Model MAE': [45, 42, 40, 39, 38, 38],
};

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
  const [activeTab, setActiveTab] = useState<'overview' | 'enrollment' | 'correlation'>('overview');

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

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = payload?.metrics ?? [];
  const demandData = payload?.demandCapacity ?? [];
  const scatterData = payload?.scatter ?? [];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'enrollment', label: 'Enrollment' },
    { id: 'correlation', label: 'Correlation' },
  ] as const;

  return (
    <AmbientBackground>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Enrollment health and forecast signal.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PulseIndicator active={true} />
            <button
              onClick={load}
              disabled={loading}
              className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs hover:border-black dark:border-zinc-700 dark:hover:border-white disabled:opacity-50 transition-colors"
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <motion.div
          className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <motion.div
            className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm dark:bg-zinc-800"
            layoutId="tabIndicator"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              left: `${tabs.findIndex((t) => t.id === activeTab) * (100 / tabs.length)}%`,
              width: `${100 / tabs.length}%`,
            }}
          />
        </motion.div>

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
              <button onClick={load} className="mt-3 rounded-full border border-red-300 px-3 py-1 text-xs hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900">
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
                <GlassCard key={i}>
                  <div className="animate-pulse flex flex-col gap-3">
                    <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-7 w-16 rounded bg-zinc-300 dark:bg-zinc-700" />
                    <div className="h-10 w-full rounded bg-zinc-100 dark:bg-zinc-900" />
                  </div>
                </GlassCard>
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
              {/* Metric cards with count-up + sparklines */}
              {metrics.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {metrics.map((m) => {
                    const Icon = iconMap[m.icon] ?? BarChart3;
                    const sparkData = sparklineTrends[m.title] ?? [];
                    const deltaType = m.delta.startsWith('+') || m.delta.startsWith('−') || m.delta.startsWith('-') ? 'positive' : m.delta.startsWith('–') ? 'negative' : 'neutral';
                    return (
                      <GlassCard key={m.title} hover glow>
                        <MetricCard
                          title={m.title}
                          value={parseFloat(m.value.replace(/[^0-9.]/g, '')) || 0}
                          delta={m.delta}
                          deltaType={deltaType}
                          icon={Icon}
                          sparklineData={sparkData}
                          suffix={m.value.includes('%') ? '%' : ''}
                        />
                      </GlassCard>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="No metrics" description="Metrics will appear once data is loaded." />
              )}

              {/* Tabbed chart views */}
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {demandData.length > 0 ? (
                      <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">Demand vs Capacity</div>
                            <div className="text-xs text-zinc-500">Term sequence snapshot with hover crosshairs</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={demandData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="gradDashActual" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.45} />
                                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                                </linearGradient>
                                <linearGradient id="gradDashForecast" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                              <XAxis dataKey="term" tick={{ fontSize: 12 }} tickLine={false} />
                              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Area
                                type="monotone"
                                dataKey="actual"
                                stroke="#22c55e"
                                strokeWidth={2.5}
                                fill="url(#gradDashActual)"
                                dot={{ r: 4, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
                                activeDot={{ r: 7, stroke: '#22c55e', strokeWidth: 2, fill: '#fff' }}
                                animationDuration={1200}
                                animationEasing="ease-out"
                              />
                              <Area
                                type="monotone"
                                dataKey="forecast"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                strokeDasharray="6 3"
                                fill="url(#gradDashForecast)"
                                dot={{ r: 3, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                                animationDuration={1400}
                                animationEasing="ease-out"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : (
                      <EmptyState title="No demand data" description="Demand data will appear once available." />
                    )}
                  </motion.div>
                )}

                {activeTab === 'enrollment' && (
                  <motion.div
                    key="enrollment"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GlassCard hover glow>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">Enrollment by Segment</div>
                          <div className="text-xs text-zinc-500">Click segments to toggle visibility</div>
                        </div>
                      </div>
                      <div className="mt-4" />
                    </GlassCard>
                  </motion.div>
                )}

                {activeTab === 'correlation' && (
                  <motion.div
                    key="correlation"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {scatterData.length > 0 ? (
                      <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">Demand vs Capacity Correlation</div>
                            <div className="text-xs text-zinc-500">Scatter with regression trend line</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <EmptyState title="No correlation data" description="Scatter data will appear once available." />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AmbientBackground>
  );
}
