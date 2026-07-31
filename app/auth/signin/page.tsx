'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function SignInPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const emailStr = String(email).trim();
    if (!emailStr) {
      setError('Email is required.');
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: emailStr,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (signInError) {
      setError(signInError.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-xl font-semibold">Sign in to EnrollIQ</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Enter your institutional email. We’ll send a magic link.
      </p>
      {sent ? (
        <p className="mt-6 text-sm text-green-700">Check your email for the sign-in link.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            placeholder="name@institution.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="clay-card px-3 py-2 font-body-sm text-body-sm text-on-surface"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            className="clay-btn py-2 px-4 font-label-md text-label-md text-secondary"
          >
            Send magic link
          </button>
        </form>
      )}
    </div>
  );
}
