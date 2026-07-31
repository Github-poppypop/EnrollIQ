import Link from 'next/link';
import Auth from './Auth';
import { motion } from 'motion/react';
import { PulseIndicator } from '@/components/chart/PulseIndicator';

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/insights/trends', label: 'Trends' },
  { href: '/insights/predictions', label: 'Predictions' },
];

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-base font-semibold tracking-tight">
            EnrollIQ
          </Link>
          <nav className="relative flex items-center gap-4 text-sm">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors">
                {item.label}
              </Link>
            ))}
            <motion.div
              className="absolute -bottom-1 h-[2px] rounded-full bg-blue-500 dark:bg-blue-400"
              layoutId="navIndicator"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{
                left: nav.findIndex((n) => n.href === '/dashboard') * 0,
              }}
            />
            <PulseIndicator active={false} label="Live" />
            <Auth />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-6 text-xs text-zinc-500">
        © {new Date().getFullYear()} EnrollIQ
      </footer>
    </div>
  );
}
