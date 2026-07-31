'use client';

import { useState } from 'react';
import Auth from '@/components/Auth';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="clay-card w-full max-w-md p-8">
        <div className="mb-6">
          <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">Welcome</h1>
          <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">Access your academic intelligence workspace.</p>
        </div>

        {sent ? (
          <div className="rounded-xl border border-primary-container bg-primary-container/40 p-4">
            <p className="font-label-md text-label-md text-primary">Check your inbox</p>
            <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">If an account exists, we sent a sign-in link.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="font-label-md text-label-md text-on-surface">Email</span>
              <input
                type="email"
                placeholder="name@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="clay-card px-4 py-3 font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant"
                required
              />
            </label>

            <button
              type="submit"
              className="clay-btn-primary w-full py-3 px-4 font-label-md text-label-md font-semibold"
            >
              Send magic link
            </button>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-outline-variant/60" />
              <span className="font-body-sm text-body-sm text-on-surface-variant">or</span>
              <span className="h-px flex-1 bg-outline-variant/60" />
            </div>

            <Auth />
          </form>
        )}
      </div>
    </div>
  );
}
