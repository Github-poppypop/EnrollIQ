'use client';

import { motion, AnimatePresence } from 'motion/react';

export interface Tab {
  id: string;
  label: string;
}

interface TabbedViewProps<T extends string> {
  tabs: readonly Tab[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  children: Record<T, React.ReactNode>;
  className?: string;
}

export function TabbedView<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  children,
  className = '',
}: TabbedViewProps<T>) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Tab bar */}
      <div className="relative flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id as T)}
            className="relative z-10 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              color: activeTab === tab.id ? '#111827' : '#71717a',
            }}
            whileTap={{ scale: 0.97 }}
          >
            {tab.label}
          </motion.button>
        ))}
        {/* Animated background indicator */}
        <motion.div
          className="absolute inset-y-1 rounded-lg bg-white shadow-sm dark:bg-zinc-800"
          layoutId="tabBackground"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            left: tabs.findIndex((t) => t.id === activeTab) * (100 / tabs.length) + '%',
            width: 100 / tabs.length + '%',
          }}
        />
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {children[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
