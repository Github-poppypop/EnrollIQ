'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Auth from './Auth';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/data/upload', label: 'Data Pipeline', icon: 'dataset' },
  { href: '/insights/predictions', label: 'Forecasts', icon: 'analytics' },
  { href: '/insights/trends', label: 'Trends', icon: 'model_training' },
  { href: '/settings', label: 'Integrations', icon: 'api' },
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
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      <aside className="w-sidebar-width h-screen sticky top-0 left-0 border-r border-outline-variant bg-surface flex flex-col py-md px-sm z-50">
        <div className="mb-xl px-sm flex items-center gap-sm">
          <div className="w-8 h-8 rounded-full object-cover grayscale shrink-0">
            <img
              alt="EnrollIQ"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUav4nePUewVG8n9fPQj96T-yKBXbVHNVqyAzTTEwyN9DE3M9DxTNyKsWKSSO_FN6o9og2GVjk5RHqrrVPBr1OHFRAyxsQtIu0JtfF5kK4wa-UwKOQia5vXcAknmXXqMLf05C0SDG76rAkCzlzUsSVfeO41rXb3iZmv7nzPnsVdEo6tk_ydbgcQajVZytE4sdpw3frgU8Tyjl-3U0yNXkjsaNv8JsiOcrXpmxdBsgLB6UHABJpDrR_ig"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Academic Intelligence</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Enterprise Engine</p>
          </div>
        </div>

        <button className="clay-btn w-full py-sm px-md mb-lg font-label-md text-label-md text-secondary flex items-center justify-center gap-xs">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Analysis
        </button>

        <nav className="flex-1 flex flex-col gap-xs">
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  'flex items-center gap-md px-md py-sm rounded-lg transition-all duration-150',
                  active
                    ? 'text-secondary font-bold border-l-4 border-secondary bg-surface-container-low opacity-90'
                    : 'text-on-surface-variant hover:bg-surface-container'
                )}
              >
                <span
                  className={cx('material-symbols-outlined', active && 'text-secondary')}
                  style={{ fontVariationSettings: active ? "'FILL' 1" : undefined }}
                >
                  {item.icon}
                </span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-outline-variant pt-sm flex flex-col gap-xs">
          {bottomNav.map((item) => {
            const active = item.external ? false : isActive(item.href);
            const inner = (
              <>
                <span
                  className={cx('material-symbols-outlined', active && 'text-secondary')}
                  style={{ fontVariationSettings: active ? "'FILL' 1" : undefined }}
                >
                  {item.icon}
                </span>
                <span className={cx('font-label-md text-label-md', active && 'font-semibold text-secondary')}>{item.label}</span>
              </>
            );

            return item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                {inner}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  'flex items-center gap-md px-md py-sm rounded-lg transition-all duration-150',
                  active
                    ? 'text-secondary font-bold border-l-4 border-secondary bg-surface-container-low opacity-90'
                    : 'text-on-surface-variant hover:bg-surface-container'
                )}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex w-full sticky top-0 z-40 border-b border-outline-variant bg-surface px-xl py-md justify-between items-center transition-all duration-200 ease-in-out">
          <div className="flex items-center gap-lg">
            <div className="relative w-64 clay-card py-sm px-md flex items-center">
              <span className="material-symbols-outlined text-on-surface-variant mr-xs text-[20px]">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 p-0 font-body-sm text-body-sm w-full text-on-surface placeholder-on-surface-variant"
                placeholder="Search..."
                type="text"
              />
            </div>
            <nav className="flex gap-md">
              <Link href="/dashboard" className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors">Models</Link>
              <Link href="/data/upload" className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors">Pipelines</Link>
              <Link href="/insights/predictions" className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors">Logs</Link>
            </nav>
          </div>

          <div className="flex items-center gap-md">
            <div className="hidden sm:flex gap-sm">
              <button className="w-10 h-10 rounded-full flex items-center justify-center clay-btn text-on-surface-variant hover:text-secondary">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center clay-btn text-on-surface-variant hover:text-secondary">
                <span className="material-symbols-outlined">cloud_done</span>
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center clay-btn text-on-surface-variant hover:text-secondary">
                <span className="material-symbols-outlined">account_balance</span>
              </button>
            </div>
            <button className="clay-btn py-sm px-md font-label-md text-label-md text-on-surface font-bold hover:text-secondary">
              Deploy Model
            </button>
            <img
              alt="Account"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEWjbyKstgzzyEFWq86cJxuplnyt1wYiIKN6A2qxXPa4BpWXZvyO7Uyh0rOhVn8gyjnBilqHNa7zhXG9C-mlt_xEDh9ainCaSgYZ7HpjQCCNmdHsmyGwXI9gsVUqMNXkCW7bl_oAr2E_f_hVaZpAL7meMU36Hw7QGS64YIf-0HN3hN32nL8D6LuZeFAqoYJD4ngMkZbiPiomDSHUVtMvVFQ6wB9boTgMgySl2cfc5uKbvYC52cb5dfFQ"
              className="w-10 h-10 rounded-full object-cover border border-outline-variant grayscale"
            />
            <Auth />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-xl">
          <div className="max-w-7xl mx-auto space-y-lg">{children}</div>
        </main>
      </div>
    </div>
  );
}
