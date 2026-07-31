'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'motion/react';

interface CountUpProps {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function CountUp({
  end,
  duration = 1.2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: CountUpProps) {
  const controls = useAnimation();
  const [display, setDisplay] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    startTime.current = null;
    setDisplay(0);

    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = easeOutExpo(progress);
      const current = eased * end;

      setDisplay(current);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        setDisplay(end);
      }
    };

    rafId.current = requestAnimationFrame(animate);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [end, duration]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </motion.span>
  );
}
