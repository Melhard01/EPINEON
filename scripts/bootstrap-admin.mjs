#!/usr/bin/env node
/**
 * Create the FIRST Epineon administrator.
 *
 * Needed once, because /admin/team can only be used by someone who is already
 * an administrator — a deliberate chicken-and-egg that stops anyone bootstrapping
 * themselves through the web app.
 *
 * Run locally (never in CI, never with the key on the command line):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/bootstrap-admin.mjs you@epineon.ai
 *
 * It sends a Supabase invitation email, then adds the address to the allowlist.
 * The invitee sets their own password through that email; this script never
 * handles or stores a password.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'

// Convenience: pick up .env.local so the secret stays out of shell history.
if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const email = (process.argv[2] || '').trim().toLowerCase()
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const siteUrl = (process.env.PUBLIC_SITE_URL || 'http://localhost:5173').replace(/\/+$/, '')

const die = (msg) => {
  console.error(`\n  ✗ ${msg}\n`)
  process.exit(1)
}

if (!email || !/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email)) {
  die('Usage: node scripts/bootstrap-admin.mjs <email@domain>')
}
if (!url || !key) die('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example).')
if (/^eyJ.*anon/i.test(key) || key.length < 40) {
  die('That looks like the anon key. Use the service_role key from Project Settings → API.')
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
  ...(typeof globalThis.WebSocket === 'undefined' ? { realtime: { transport: class { constructor() { throw new Error('unused') } } } } : {}),
})

console.log(`\n  Bootstrapping first administrator: ${email}`)

const { data: existingRow } = await supabase.from('admin_users').select('id, status').eq('email', email).maybeSingle()
if (existingRow?.status === 'active') {
  console.log('  • Already an active administrator — nothing to do.\n')
  process.exit(0)
}

let userId = null
const { data: invite, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
  redirectTo: `${siteUrl}/admin/login`,
})

if (inviteError && !/already.*registered|already been registered/i.test(inviteError.message)) {
  die(`Could not send the invitation: ${inviteError.message}`)
}

if (invite?.user) {
  userId = invite.user.id
  console.log('  • Invitation email sent.')
} else {
  // Already had an auth account — look up their id so the row is linked.
  const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
  userId = list?.users?.find((u) => (u.email || '').toLowerCase() === email)?.id ?? null
  console.log('  • That address already had a Supabase account; linking it.')
}

const payload = { email, user_id: userId, status: 'active', revoked_at: null }
const { error: writeError } = existingRow
  ? await supabase.from('admin_users').update(payload).eq('id', existingRow.id)
  : await supabase.from('admin_users').insert(payload)

if (writeError) die(`Could not write the allowlist row: ${writeError.message}`)

console.log('  • Added to the admin allowlist.')
console.log('\n  Done. Open the invitation email, set a password, then sign in at /admin/login.')
console.log('  Add everyone else from /admin/team — this script should not be needed again.\n')
