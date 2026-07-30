'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type SessionUser = {
  id: string;
  email: string | null;
  image: string | null;
};

export default function Auth() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    async function loadSession() {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!res.ok) {
          if (mounted) setUser(null);
          return;
        }
        const { user } = (await res.json()) as { user: SessionUser | null };
        if (mounted) setUser(user);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadSession();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  if (loading) {
    return (
      <div className="h-6 w-6 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
    );
  }

  if (!user) {
    return (
      <a
        href="/auth/signin"
        className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:border-black dark:border-zinc-700 dark:hover:border-white"
      >
        Sign in
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-600 dark:text-zinc-400"> {user.email}</span>
      <button
        onClick={signOut}
        className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:border-black dark:border-zinc-700 dark:hover:border-white"
      >
        Sign out
      </button>
    </div>
  );
}
