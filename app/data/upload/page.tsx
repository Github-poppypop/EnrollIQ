'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upload data</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Import enrollment snapshots into Supabase for forecasting.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-zinc-300 p-6 dark:border-zinc-700">
        <label className="flex cursor-pointer flex-col items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="rounded-full border border-zinc-300 px-3 py-1 hover:border-black dark:border-zinc-700 dark:hover:border-white">
            Choose CSV/Excel
          </span>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? <span className="text-zinc-900">{file.name}</span> : <span>No file selected</span>}
        </label>
      </div>
      <button
        type="button"
        className="self-start rounded-full bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
      >
        Upload
      </button>
    </div>
  );
}
