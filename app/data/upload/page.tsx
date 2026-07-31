'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { submitUpload, type UploadResponse } from '@/lib/services';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { UploadDropzone } from '@/components/chart/UploadDropzone';
import { PulseIndicator } from '@/components/chart/PulseIndicator';

export default function UploadPage() {
  const [result, setResult] = useState<UploadResponse | null>(null);

  const handleUpload = async (file: File): Promise<UploadResponse | null> => {
    try {
      const res = await submitUpload(file);
      setResult(res);
      return res;
    } catch (e) {
      throw e;
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

      <div className="flex items-center gap-3">
        <PulseIndicator active={false} />
      </div>

      <UploadDropzone onUpload={handleUpload} />

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700 dark:text-green-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {result.message}
              </p>
              <p className="mt-1 text-xs text-green-700/80 dark:text-green-400/80">
                {result.file.name} · {(result.file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-green-500 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
