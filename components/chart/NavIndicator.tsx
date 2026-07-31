'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';

interface NavIndicatorProps {
  className?: string;
}

export function NavIndicator({ className = '' }: NavIndicatorProps) {
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const [activeLabel, setActiveLabel] = useState('');
  const refs = new Map<string, HTMLAnchorElement>();

  useEffect(() => {
    const label = pathname.split('/').filter(Boolean).pop() ?? 'dashboard';
    setActiveLabel(label);

    // Find the active nav link
    const navLinks = document.querySelectorAll<HTMLAnchorElement>(
      'nav a[href]'
    );
    const currentRef = Array.from(navLinks).find(
      (link) => link.getAttribute('href') === pathname || 
        (pathname === '/dashboard' && link.getAttribute('href') === '/dashboard')
    );

    if (currentRef) {
      const rect = currentRef.getBoundingClientRect();
      setIndicatorStyle({
        left: rect.left,
        width: rect.width,
      });
    }
  }, [pathname]);

  return (
    <nav className={`relative flex items-center gap-4 text-sm ${className}`}>
      {indicatorStyle && (
        <motion.div
          className="absolute bottom-0 h-[2px] rounded-full bg-blue-500 dark:bg-blue-400"
          layoutId="navIndicator"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </nav>
  );
}

export function AnimatedNavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href === '/dashboard' && pathname === '/');

  return (
    <motion.div
      className="relative"
      initial={false}
      animate={{
        color: isActive ? '#111827' : '#71717a',
      }}
      transition={{ duration: 0.3 }}
    >
      <a href={href} className="hover:text-black dark:hover:text-white transition-colors">
        {label}
        {isActive && (
          <motion.span
            layoutId="navTextIndicator"
            className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-blue-500 dark:bg-blue-400"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </a>
    </motion.div>
  );
}
