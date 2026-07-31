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
      <div className="h-6 w-6 animate-pulse rounded-full bg-surface-container" />
    );
  }

  if (!user) {
    return (
      <a
        href="/auth/signin"
        className="clay-btn py-1.5 px-3 font-label-md text-label-md text-on-surface"
      >
        Sign in
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-body-sm text-body-sm text-on-surface-variant">{user.email}</span>
      <button
        onClick={signOut}
        className="clay-btn py-1.5 px-3 font-label-md text-label-md text-on-surface"
      >
        Sign out
      </button>
    </div>
  );
}
