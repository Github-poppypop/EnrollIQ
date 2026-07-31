'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloudUpload, FileText, X, AlertCircle } from 'lucide-react';
import type { UploadResponse } from '@/lib/services';

interface UploadDropzoneProps {
  onUpload: (file: File) => Promise<UploadResponse | null>;
}

export function UploadDropzone({ onUpload }: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        setFile(files[0]);
        setStatus('idle');
        setErrorMsg(null);
        setResult(null);
      }
    },
    []
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files?.length) {
        setFile(files[0]);
        setStatus('idle');
        setErrorMsg(null);
        setResult(null);
      }
    },
    []
  );

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setProgress(0);
    setErrorMsg(null);

    // Simulate progress for demo purposes
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const res = await onUpload(file);
      clearInterval(progressInterval);
      setProgress(100);
      setResult(res);
      setStatus('success');
      setFile(null);
    } catch (e) {
      clearInterval(progressInterval);
      setErrorMsg(e instanceof Error ? e.message : 'Upload failed');
      setStatus('error');
      setProgress(0);
    }
  };

  const reset = () => {
    setStatus('idle');
    setProgress(0);
    setErrorMsg(null);
    setResult(null);
    setFile(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30'
            : 'border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-900/30'
        }`}
        animate={{
          borderColor: isDragActive ? '#3b82f6' : undefined,
          scale: isDragActive ? 1.01 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.div
          animate={isDragActive ? { y: [-4, 4, -4] } : { y: 0 }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <CloudUpload className="mx-auto h-10 w-10 text-zinc-400" />
        </motion.div>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Drag and drop your file here, or{' '}
          <label className="cursor-pointer font-medium text-blue-600 hover:underline dark:text-blue-400">
            browse
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </p>
        <p className="mt-1 text-xs text-zinc-400">CSV, XLSX up to 50 MB</p>

        <AnimatePresence>
          {file && !result && (
            <motion.div
              key="file-preview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {file.name}
              </span>
              <span className="text-xs text-zinc-400">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload progress */}
        <AnimatePresence>
          {status === 'uploading' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex flex-col gap-2"
            >
              <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <motion.div
                  className="h-full rounded-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="text-xs text-zinc-500">
                {Math.round(progress)}% uploading...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Success toast */}
      <AnimatePresence>
        {status === 'success' && result && (
          <motion.div
            initial={{ opacity: 0, x: 100, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 100, height: 0 }}
            className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {result.message}
              </p>
              <p className="mt-1 text-xs text-green-700/80 dark:text-green-400/80">
                {result.file.name} · {(result.file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button onClick={reset} className="text-green-500 hover:text-green-700">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error toast */}
      <AnimatePresence>
        {status === 'error' && errorMsg && (
          <motion.div
            initial={{ opacity: 0, x: 100, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 100, height: 0 }}
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Upload failed
              </p>
              <p className="mt-1 text-xs text-red-700/80 dark:text-red-400/80">{errorMsg}</p>
            </div>
            <button onClick={reset} className="text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload button */}
      <AnimatePresence>
        {status !== 'uploading' && status !== 'success' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleUpload}
            disabled={!file}
            className="self-start rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black"
            whileHover={file ? { scale: 1.02 } : undefined}
            whileTap={file ? { scale: 0.98 } : undefined}
          >
            Upload
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
