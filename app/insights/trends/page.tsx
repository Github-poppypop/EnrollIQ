'use client';

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';

const data = [
  { term: 'FA20', freshman: 520, transfer: 210, grad: 90 },
  { term: 'SP21', freshman: 540, transfer: 195, grad: 105 },
  { term: 'FA21', freshman: 610, transfer: 225, grad: 118 },
  { term: 'SP22', freshman: 590, transfer: 240, grad: 121 },
  { term: 'FA22', freshman: 680, transfer: 255, grad: 132 },
  { term: 'SP23', freshman: 640, transfer: 270, grad: 140 },
  { term: 'FA23', freshman: 730, transfer: 290, grad: 151 },
  { term: 'SP24', freshman: 715, transfer: 305, grad: 158 },
];

export default function TrendsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Enrollment Trends</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Term-over-term movement by segment.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/50">
        <BarChart width={900} height={420} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <Legend />
          <XAxis dataKey="term" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Bar dataKey="freshman" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="transfer" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="grad" fill="#a855f7" radius={[4, 4, 0, 0]} />
        </BarChart>
      </div>
    </div>
  );
}
