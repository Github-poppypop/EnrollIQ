'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Auth from './Auth';
import { PulseIndicator } from '@/components/chart/PulseIndicator';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/data/upload', label: 'Data Pipeline', icon: 'dataset' },
  { href: '/insights/predictions', label: 'Forecasts', icon: 'analytics' },
  { href: '/insights/trends', label: 'Trends', icon: 'model_training' },
];

const bottomNav = [
  { href: '/settings', label: 'Settings', icon: 'settings' },
  { href: 'https://github.com/Github-poppypop/EnrollIQ', label: 'Support', icon: 'help', external: true },
];

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex h-screen overflow-hidden aluminum-grid bg-background text-foreground antialiased">
      <aside className="w-[260px] h-screen sticky top-0 left-0 border-r border-outline-variant/60 bg-surface/90 backdrop-blur-xl flex flex-col py-5 px-3 z-50 shrink-0">
        <div className="mb-6 px-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold shrink-0">
            EI
          </div>
          <div className="min-w-0">
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface leading-tight truncate">EnrollIQ</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight truncate">Academic Intelligence</p>
          </div>
        </div>

        <button className="clay-btn-primary w-full py-2.5 px-4 mb-7 font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Analysis
        </button>

        <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors shrink-0',
                  active
                    ? 'bg-primary-container text-on-primary border-l-4 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container/80'
                )}
              >
                <span className={cx('material-symbols-outlined text-[20px] shrink-0', active && 'text-primary')}>
                  {item.icon}
                </span>
                <span className={cx('font-label-md text-label-md truncate', active && 'font-semibold')}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-outline-variant/50 pt-3 flex flex-col gap-1.5 shrink-0">
          {bottomNav.map((item) => {
            const active = item.external ? false : isActive(item.href);
            const inner = (
              <>
                <span className={cx('material-symbols-outlined text-[20px] shrink-0', active && 'text-primary')}>
                  {item.icon}
                </span>
                <span className={cx('font-label-md text-label-md truncate', active && 'font-semibold text-primary')}>
                  {item.label}
                </span>
              </>
            );

            return item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container/80 transition-colors"
              >
                {inner}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                  active
                    ? 'bg-primary-container text-on-primary border-l-4 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container/80'
                )}
              >
                {inner}
              </Link>
            );
          })}
          <div className="px-3 pt-2">
            <PulseIndicator active={true} label="Live" />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex w-full sticky top-0 z-40 border-b border-outline-variant/60 bg-surface/70 backdrop-blur-xl px-6 py-3 justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative w-64 clay-card py-2 px-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 p-0 font-body-sm text-body-sm w-full text-on-surface placeholder:text-on-surface-variant"
                placeholder="Search insights..."
                type="text"
              />
            </div>
            <nav className="hidden lg:flex gap-5">
              <Link href="/dashboard" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">Models</Link>
              <Link href="/data/upload" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">Pipelines</Link>
              <Link href="/insights/predictions" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">Logs</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-2">
              <button className="w-10 h-10 rounded-full flex items-center justify-center clay-btn text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined text-[22px]">notifications</span>
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center clay-btn text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined text-[22px]">cloud_done</span>
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center clay-btn text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined text-[22px]">account_balance</span>
              </button>
            </div>
            <button className="clay-btn-secondary py-2 px-5 font-label-md text-label-md font-semibold inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              Deploy Model
            </button>
            <Auth />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

        <footer className="border-t border-outline-variant/60 px-6 pb-6 pt-4 text-xs text-on-surface-variant">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span>© {new Date().getFullYear()} EnrollIQ</span>
            <span className="font-mono text-on-surface-variant">v0.1.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
