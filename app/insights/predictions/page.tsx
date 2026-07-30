'use client';

import { useState } from 'react';
import { Line, LineChart, CartesianGrid, Legend, XAxis, YAxis, Tooltip } from 'recharts';
import { Download } from 'lucide-react';

const forecast = [
  { term: 'SP24', lower: 1120, actual: 1176, upper: 1210 },
  { term: 'FA24', lower: 1180, actual: 1210, upper: 1280 },
  { term: 'SP25', lower: 1210, actual: null, upper: 1335 },
  { term: 'FA25', lower: 1250, actual: null, upper: 1405 },
  { term: 'SP26', lower: 1275, actual: null, upper: 1455 },
];

export default function PredictionsPage() {
  const [model, setModel] = useState('SeasonalNaive');

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
            <option>SeasonalNaive</option>
            <option>ProphetAlt</option>
            <option>LightGBM</option>
          </select>
          <button className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-2 text-sm hover:border-black dark:border-zinc-700 dark:hover:border-white">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/50">
        <LineChart width={900} height={420} data={forecast}>
          <CartesianGrid strokeDasharray="3 3" />
          <Legend />
          <XAxis dataKey="term" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="actual" stroke="#111827" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="upper" stroke="#3b82f6" strokeDasharray="5 5" />
          <Line type="monotone" dataKey="lower" stroke="#3b82f6" strokeDasharray="5 5" />
        </LineChart>
      </div>
    </div>
  );
}
