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
  'Total Enrollment': [1180, 1200, 1220, 1240, 1260, 1284],
  'Avg Capacity Utilization': [65, 66, 67, 68, 69, 70],
  'Retention Rate': [89.5, 90.1, 90.8, 91.0, 91.2, 91.4],
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
            <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">Dashboard</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Enrollment health and forecast signal.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PulseIndicator active={true} />
            <button
              onClick={load}
              disabled={loading}
              className="clay-btn py-1.5 px-3 font-label-md text-label-md text-on-surface disabled:opacity-50 transition-colors"
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="relative flex gap-1 rounded-xl bg-surface-container p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 rounded-lg px-3 py-2 font-label-md text-label-md transition-colors ${
                activeTab === tab.id
                  ? 'text-on-surface'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-surface-container-lowest"
                  layoutId="tabIndicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="clay-card p-6 text-sm text-on-surface"
            >
              <p className="font-label-md text-label-md text-on-surface">Unable to load dashboard</p>
              <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">{error}</p>
              <button onClick={load} className="mt-3 clay-btn py-1.5 px-3 font-label-md text-label-md text-secondary">
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
                    <div className="h-4 w-24 rounded bg-surface-container" />
                    <div className="h-7 w-16 rounded bg-surface-container" />
                    <div className="h-10 w-full rounded bg-surface-container" />
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
              <div className="clay-card p-4">
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
                        <div className="flex flex-col gap-4">
                          <div>
                            <div className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Demand vs Capacity</div>
                            <div className="font-body-sm text-body-sm text-on-surface-variant">Term sequence snapshot with hover crosshairs</div>
                          </div>
                          <div>
                            <ResponsiveContainer width="100%" height={320}>
                              <AreaChart data={demandData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="gradDashActual" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.45} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                                  </linearGradient>
                                  <linearGradient id="gradDashForecast" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4b41e1" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#4b41e1" stopOpacity={0.02} />
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
                                  stroke="#4b41e1"
                                  strokeWidth={2}
                                  strokeDasharray="6 3"
                                  fill="url(#gradDashForecast)"
                                  dot={{ r: 3, fill: '#4b41e1', stroke: '#fff', strokeWidth: 2 }}
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
                            <div className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Enrollment by Segment</div>
                            <div className="font-body-sm text-body-sm text-on-surface-variant">Click segments to toggle visibility</div>
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
                        <div className="flex flex-col gap-4">
                          <div>
                            <div className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Demand vs Capacity Correlation</div>
                            <div className="font-body-sm text-body-sm text-on-surface-variant">Scatter with regression trend line</div>
                          </div>
                        </div>
                      ) : (
                        <EmptyState title="No correlation data" description="Scatter data will appear once available." />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AmbientBackground>
  );
}
