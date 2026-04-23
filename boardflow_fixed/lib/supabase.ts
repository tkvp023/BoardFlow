import { createClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: ReturnType<typeof createClient<any>> | null = null

export function getSupabaseClient() {
  // On the server (API routes), always create a fresh client to avoid stale state
  const isServer = typeof window === 'undefined'
  if (!isServer && cached) return cached

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
    )
  }

  const client = createClient(supabaseUrl, supabaseAnonKey)
  if (!isServer) cached = client
  return client
}

