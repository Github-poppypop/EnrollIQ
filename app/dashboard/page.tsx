'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  fetchDashboardData,
  type DashboardPayload,
} from '@/lib/services';
import { GlassCard } from '@/components/chart/GlassCard';
import { MetricCard } from '@/components/chart/MetricCard';
import { EmptyState } from '@/components/chart/EmptyState';
import { ChartSkeleton } from '@/components/chart/ChartSkeleton';
import { CustomTooltip } from '@/components/chart/CustomTooltip';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { Users, BookOpen, TrendingUp, BarChart3 } from 'lucide-react';

const defaultMetrics = [
  { title: 'Active Models', value: '1,248', delta: '+12.5%', deltaType: 'positive', icon: 'models' },
  { title: 'Compute Load', value: '42.8%', delta: 'Stable', deltaType: 'neutral', icon: 'compute' },
  { title: 'Inference Throughput', value: '1,204', delta: '+8.2%', deltaType: 'positive', icon: 'throughput' },
  { title: 'Error Rate', value: '0.04%', delta: '-0.01%', deltaType: 'negative', icon: 'error' },
];

export default function DashboardPage() {
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');

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

  const metrics = payload?.metrics?.length ? payload.metrics : defaultMetrics;
  const demandData = payload?.demandCapacity ?? [];
  const scatterData = payload?.scatter ?? [];

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-display text-display text-on-surface">Overview</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">System performance and model metrics.</p>
        </div>
        <div className="font-mono-md text-mono-md text-on-surface-variant clay-card px-md py-sm inline-flex items-center gap-sm">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          System Online
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
        {/* Metric Card 1 */}
        <div className="clay-card p-lg flex flex-col justify-between">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">Active Models</p>
            <h3 className="font-headline-lg text-headline-lg text-on-surface">1,248</h3>
          </div>
          <div className="mt-md flex items-center gap-xs text-secondary font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+12.5%</span>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="clay-card p-lg flex flex-col justify-between">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">Compute Load</p>
            <h3 className="font-headline-lg text-headline-lg text-on-surface">42.8%</h3>
          </div>
          <div className="mt-md flex items-center gap-xs text-on-surface-variant font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">horizontal_rule</span>
            <span>Stable</span>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="clay-card p-lg md:col-span-2 lg:col-span-2 row-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">Inference Throughput</h3>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-secondary">more_horiz</button>
          </div>
          <div className="flex-1 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden relative shadow-inner min-h-[240px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary-fixed/50 to-surface-variant/50" />
            <div className="w-full h-full p-md flex items-end gap-sm opacity-80">
              <div className="flex-1 bg-outline-variant rounded-t-sm h-[30%]" />
              <div className="flex-1 bg-secondary rounded-t-sm h-[50%]" />
              <div className="flex-1 bg-outline-variant rounded-t-sm h-[40%]" />
              <div className="flex-1 bg-secondary rounded-t-sm h-[70%]" />
              <div className="flex-1 bg-outline-variant rounded-t-sm h-[60%]" />
              <div className="flex-1 bg-secondary rounded-t-sm h-[90%]" />
              <div className="flex-1 bg-outline-variant rounded-t-sm h-[80%]" />
            </div>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="clay-card p-lg flex flex-col justify-between">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">Error Rate</p>
            <h3 className="font-headline-lg text-headline-lg text-on-surface">0.04%</h3>
          </div>
          <div className="mt-md flex items-center gap-xs text-error font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">trending_down</span>
            <span>-0.01%</span>
          </div>
        </div>

        {/* Visual Card */}
        <div className="clay-card p-lg flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20 grayscale">
            <img
              alt=""
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdou6z9bFdFXHCpnlQJf8j6dsRKO-hFm6UlyoxwFyt82ybsr7h_FXj-LdbbPibTlgeqD_E57QrpTFY9Y9UEZVUgi-cHK0BOVSYjZuj-iXhIDTcivXR9eDDe55w7vR3HuOoUxyYuD5lmZeaytzFKkoCpvyDEp76u6kynsqOjpvSLin8H9nA_pmcf5hYN8uMBB03DK5TjKUVwvnqtNi4Zr2PbbmxLlz21zlk_1Ok9WDQjwmO0TfMqlYBqA"
              className="w-full h-full object-cover mix-blend-overlay"
            />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h3 className="font-headline-md text-headline-md text-on-surface">Pipeline Status</h3>
            <button className="clay-btn self-start py-xs px-sm font-label-md text-label-md mt-sm text-secondary">View Details</button>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="clay-card">
        <div className="flex gap-1 border-b border-outline-variant px-md pt-md">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-label-md text-label-md ${activeTab === 'overview' ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`px-4 py-2 font-label-md text-label-md ${activeTab === 'detailed' ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Detailed
          </button>
        </div>
        <div className="p-lg">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
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
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="gradDashForecast" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4b41e1" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#4b41e1" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
                          <XAxis dataKey="term" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} />
                          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="actual"
                            stroke="#22c55e"
                            strokeWidth={2.5}
                            fill="url(#gradDashActual)"
                            dot={{ r: 4, fill: '#22c55e', stroke: '#e2e8f0', strokeWidth: 2 }}
                            activeDot={{ r: 7, stroke: '#22c55e', strokeWidth: 2, fill: '#e2e8f0' }}
                            animationDuration={1400}
                            animationEasing="ease-out"
                          />
                          <Area
                            type="monotone"
                            dataKey="forecast"
                            stroke="#4b41e1"
                            strokeWidth={2}
                            strokeDasharray="6 3"
                            fill="url(#gradDashForecast)"
                            dot={{ r: 3, fill: '#4b41e1', stroke: '#e2e8f0', strokeWidth: 2 }}
                            animationDuration={1600}
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
            ) : (
              <motion.div
                key="detailed"
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
      </div>

      {/* Data Table */}
      <div className="clay-card overflow-hidden">
        <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest/30">
          <h3 className="font-headline-md text-headline-md text-on-surface">Recent Model Deployments</h3>
          <button className="font-label-md text-label-md text-secondary hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest/30 border-b border-outline-variant">
                <th className="py-sm px-lg font-label-md text-label-md text-on-surface-variant">Model Name</th>
                <th className="py-sm px-lg font-label-md text-label-md text-on-surface-variant">Version</th>
                <th className="py-sm px-lg font-label-md text-label-md text-on-surface-variant">Status</th>
                <th className="py-sm px-lg font-label-md text-label-md text-on-surface-variant text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface">
              <tr className="border-b border-outline-variant hover:bg-surface-container-lowest/50 transition-colors">
                <td className="py-md px-lg font-mono-md">gpt-academic-v4</td>
                <td className="py-md px-lg">v4.1.2</td>
                <td className="py-md px-lg">
                  <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-surface-container-high text-on-surface border border-outline-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Active
                  </span>
                </td>
                <td className="py-md px-lg text-right">120ms</td>
              </tr>
              <tr className="bg-surface/50 border-b border-outline-variant hover:bg-surface-container-lowest/50 transition-colors">
                <td className="py-md px-lg font-mono-md">data-parser-x</td>
                <td className="py-md px-lg">v1.0.5</td>
                <td className="py-md px-lg">
                  <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-surface-container-high text-on-surface border border-outline-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Active
                  </span>
                </td>
                <td className="py-md px-lg text-right">45ms</td>
              </tr>
              <tr className="border-b border-outline-variant hover:bg-surface-container-lowest/50 transition-colors">
                <td className="py-md px-lg font-mono-md">sentiment-analysis</td>
                <td className="py-md px-lg">v2.3.0</td>
                <td className="py-md px-lg">
                  <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-error-container text-on-error-container border border-error/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-error" />
                    Degraded
                  </span>
                </td>
                <td className="py-md px-lg text-right">850ms</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
