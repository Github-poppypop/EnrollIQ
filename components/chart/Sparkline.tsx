'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function Sparkline({
  data,
  width = 80,
  height = 32,
  color = '#22c55e',
  className = '',
}: SparklineProps) {
  const [pathD, setPathD] = useState('');
  const [areaD, setAreaD] = useState('');

  useEffect(() => {
    if (data.length < 2) return;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);
    const padding = height * 0.1;

    const points = data.map((v, i) => ({
      x: i * step,
      y: height - padding - ((v - min) / range) * (height - padding * 2),
    }));

    const lineD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    const areaD =
      lineD +
      ` L ${points[points.length - 1].x.toFixed(1)} ${height} L 0 ${height} Z`;

    setPathD(lineD);
    setAreaD(areaD);
  }, [data, width, height]);

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d={areaD}
        fill={color}
        fillOpacity={0.15}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
      />
    </svg>
  );
}
