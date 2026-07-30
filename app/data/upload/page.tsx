'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { submitUpload, type UploadResponse } from '@/lib/services';
import { CheckCircle2, AlertTriangle, UploadCloud, Loader2 } from 'lucide-react';

type UploadStatus = 'idle' | 'loading' | 'success' | 'error';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setMessage(null);
    setResult(null);
  }, []);

  const handleUpload = async () => {
    if (!file || status === 'loading') return;

    setStatus('loading');
    setMessage(null);

    try {
      const res = await submitUpload(file);
      setResult(res);
      setStatus('success');
      setMessage(res.message);
      setFile(null);
      // Reset the native file input
      const input = document.getElementById('file-input') as HTMLInputElement | null;
      if (input) input.value = '';
    } catch (e) {
      setStatus('error');
      setMessage(e instanceof Error ? e.message : 'Upload failed');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upload data</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Import enrollment snapshots into Supabase for forecasting.
        </p>
      </div>

      {/* Drop zone / file picker */}
      <div className="rounded-2xl border border-dashed border-zinc-300 p-6 dark:border-zinc-700">
        <label className="flex cursor-pointer flex-col items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <UploadCloud className="h-8 w-8 text-zinc-400" />
          <span className="rounded-full border border-zinc-300 px-4 py-2 hover:border-black dark:border-zinc-700 dark:hover:border-white">
            Choose CSV/Excel
          </span>
          <input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              setStatus('idle');
              setMessage(null);
              setResult(null);
              setFile(e.target.files?.[0] ?? null);
            }}
          />
          <AnimatePresence mode="wait">
            {file ? (
              <motion.span
                key="selected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-zinc-900 underline dark:text-zinc-100"
              >
                {file.name}
                <span className="ml-2 text-xs text-zinc-500 no-underline">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </motion.span>
            ) : (
              <motion.span
                key="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No file selected
              </motion.span>
            )}
          </AnimatePresence>
        </label>
      </div>

      {/* Success state */}
      <AnimatePresence>
        {status === 'success' && result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {message}
              </p>
              <p className="mt-1 text-xs text-green-700/80 dark:text-green-400/80">
                {result.file.name} · {(result.file.size / 1024).toFixed(1)} KB · Uploaded{' '}
                {new Date(result.file.lastModified).toLocaleString()}
              </p>
              <button
                onClick={reset}
                className="mt-3 rounded-full border border-green-300 px-3 py-1 text-xs hover:bg-green-100 dark:border-green-700 dark:hover:bg-green-900"
              >
                Upload another file
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {status === 'error' && message && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-700 dark:text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Upload failed
              </p>
              <p className="mt-1 text-xs text-red-700/80 dark:text-red-400/80">{message}</p>
              <button
                onClick={reset}
                className="mt-3 rounded-full border border-red-300 px-3 py-1 text-xs hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900"
              >
                Try again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button – hidden while loading/success */}
      <AnimatePresence>
        {status !== 'loading' && status !== 'success' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            disabled={!file}
            onClick={handleUpload}
            className="self-start inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black"
          >
            Upload
          </motion.button>
        )}
      </AnimatePresence>

      {/* Loading state */}
      <AnimatePresence>
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading {file?.name} …
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
