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
        <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">Upload data</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
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
            className="flex items-start gap-3 rounded-xl border border-success-container bg-success-container/40 p-4"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            <div className="flex-1">
              <p className="font-label-md text-label-md text-on-primary">
                {result.message}
              </p>
              <p className="mt-1 text-xs text-on-primary/80">
                {result.file.name} · {(result.file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => setResult(null)}
              className="clay-btn text-success"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
