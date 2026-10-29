import { createClient } from '@supabase/supabase-js'

/**
 * Browser Supabase client. Carries the ANON key only.
 *
 * The anon key is public by design — it is not a secret. Everything it can
 * reach is gated by Row Level Security, so a visitor holding it still cannot
 * read a contact message or the admin allowlist. The service-role key never
 * appears in this bundle; it lives only in the serverless functions.
 */
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

let client = null

/**
 * Created on first use, never at module scope: the prerender step imports this
 * file in Node, where constructing a Supabase client would spin up its Realtime
 * transport (and fail outright on Node < 22, which has no global WebSocket).
 * Returns null when the project is not configured.
 */
export function getSupabase() {
  if (!isSupabaseConfigured) return null
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'epineon-admin-auth',
      },
    })
  }
  return client
}

/** Bearer token for calls to our own /api/admin/* endpoints. */
export async function getAccessToken() {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data?.session?.access_token ?? null
}

/** fetch() wrapper that attaches the caller's Supabase session. */
export async function adminFetch(path, options = {}) {
  const token = await getAccessToken()
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  let payload = null
  try {
    payload = await res.json()
  } catch {
    payload = null
  }
  if (!res.ok || payload?.ok === false) {
    const error = new Error(payload?.error || 'Request failed.')
    error.status = res.status
    throw error
  }
  return payload
}
