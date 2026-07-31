'use client';

import { useState, useRef, useCallback } from 'react';
import { Download, FileText, Image } from 'lucide-react';
import { motion } from 'motion/react';

interface ChartExportButtonProps {
  chartRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
  className?: string;
}

export function ChartExportButton({
  chartRef,
  filename = 'chart',
  className = '',
}: ChartExportButtonProps) {
  const [exporting, setExporting] = useState<'svg' | 'png' | null>(null);

  const exportSVG = useCallback(async () => {
    if (!chartRef.current) return;
    setExporting('svg');
    try {
      const svgEl = chartRef.current.querySelector('svg');
      if (!svgEl) return;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail
    } finally {
      setExporting(null);
    }
  }, [chartRef, filename]);

  const exportPNG = useCallback(async () => {
    if (!chartRef.current) return;
    setExporting('png');
    try {
      const svgEl = chartRef.current.querySelector('svg');
      if (!svgEl) return;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = document.createElement('img') as HTMLImageElement;
      img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.png`;
          a.click();
          URL.revokeObjectURL(url);
        });
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    } catch {
      // Silently fail
    } finally {
      setExporting(null);
    }
  }, [chartRef, filename]);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={exportSVG}
        disabled={exporting !== null}
        className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        title="Export as SVG"
      >
        {exporting === 'svg' ? (
          <motion.div className="h-3 w-3 animate-spin rounded-full border border-zinc-400 border-t-transparent" />
        ) : (
          <FileText className="h-3 w-3" />
        )}
        SVG
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={exportPNG}
        disabled={exporting !== null}
        className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        title="Export as PNG"
      >
        {exporting === 'png' ? (
          <motion.div className="h-3 w-3 animate-spin rounded-full border border-zinc-400 border-t-transparent" />
        ) : (
          <Image className="h-3 w-3" />
        )}
        PNG
      </motion.button>
    </div>
  );
}
