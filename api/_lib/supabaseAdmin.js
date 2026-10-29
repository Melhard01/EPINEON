/**
 * Service-role Supabase client — SERVER ONLY.
 *
 * service_role bypasses Row Level Security, so this module must never be
 * imported from anything under src/ that ships to the browser. The key is read
 * from SUPABASE_SERVICE_ROLE_KEY, which is deliberately NOT prefixed `VITE_`;
 * Vite only inlines VITE_* variables, so this one cannot leak into the bundle.
 */
import { createClient } from '@supabase/supabase-js'

/**
 * supabase-js builds a Realtime client on construction, which needs a global
 * WebSocket. Node 22+ has one; Node 20 does not, and createClient() throws
 * there. We never use Realtime, so on older runtimes we hand it a stub that
 * fails loudly only if something actually tries to open a socket.
 */
class UnusedWebSocket {
  constructor() {
    throw new Error('Realtime is not used by the Epineon API')
  }
}

const clientOptions = (extra = {}) => ({
  auth: { autoRefreshToken: false, persistSession: false },
  ...(typeof globalThis.WebSocket === 'undefined'
    ? { realtime: { transport: UnusedWebSocket } }
    : {}),
  ...extra,
})

let cached = null

export function getSupabaseAdmin() {
  if (cached) return cached

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase server configuration is missing')
  }

  cached = createClient(url, serviceKey, clientOptions())
  return cached
}

/** Anon-key client used only to verify a caller's access token. */
export function getSupabaseAnon() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !anonKey) throw new Error('Supabase client configuration is missing')
  return createClient(url, anonKey, clientOptions())
}
