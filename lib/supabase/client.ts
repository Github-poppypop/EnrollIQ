import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function createSupabaseBrowserClient(initialAccessToken?: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return {
      auth: {
        signInWithOtp: async () => ({ data: null, error: new Error('Missing Supabase envs') }),
      } as any,
    } as SupabaseClient;
  }
  return createClient(url, key, {
    global: {
      headers: initialAccessToken ? { Authorization: `Bearer ${initialAccessToken}` } : {},
    },
  });
}
