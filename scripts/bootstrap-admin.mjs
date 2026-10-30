#!/usr/bin/env node
/**
 * Create the FIRST Epineon administrator.
 *
 * Needed once, because /admin/team can only be used by someone who is already
 * an administrator — a deliberate chicken-and-egg that stops anyone
 * bootstrapping themselves through the web app. Holding the service-role key is
 * what authorises this script, and that key never leaves your machine.
 *
 * Run locally (never in CI, never with the key on the command line):
 *   node scripts/bootstrap-admin.mjs you@epineon.ai
 *
 * By default it allowlists the address and prints a single-use sign-up link.
 * Nothing is emailed, so this works before SMTP is configured — which is the
 * point, since Supabase's built-in mail is rate-limited and often unconfigured.
 * The invitee opens the link, chooses their own password, and the script never
 * sees or stores one.
 *
 *   --email   also send Supabase's own invitation email. This creates the auth
 *             user immediately, so the sign-up link will NOT work afterwards —
 *             they must use the emailed link. Requires working SMTP.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import {
  generateInvitationToken,
  hashInvitationToken,
  invitationExpiry,
  buildSignupUrl,
  invitationTtlHours,
} from '../api/_lib/invitations.js'

// Convenience: pick up .env.local so the secret stays out of shell history.
if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const args = process.argv.slice(2)
const sendEmail = args.includes('--email')
const email = (args.find((a) => !a.startsWith('--')) || '').trim().toLowerCase()
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const siteUrl = (process.env.PUBLIC_SITE_URL || 'http://localhost:5173').replace(/\/+$/, '')

const die = (msg) => {
  console.error(`\n  ✗ ${msg}\n`)
  process.exit(1)
}

if (!email || !/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email)) {
  die('Usage: node scripts/bootstrap-admin.mjs <email@domain> [--email]')
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

// --- 1. the allowlist row: this, and only this, is what grants admin rights ---
const { data: existingRow, error: readError } = await supabase
  .from('admin_users')
  .select('id, status, user_id, last_seen_at')
  .eq('email', email)
  .maybeSingle()

if (readError) {
  die(`Could not read admin_users: ${readError.message}\n    Has the migration been applied? See docs/ADMIN_SETUP.md §2.`)
}

if (existingRow?.status === 'active' && existingRow.last_seen_at) {
  console.log('  • Already an active administrator who has signed in — nothing to do.\n')
  process.exit(0)
}

const payload = { email, status: 'active', revoked_at: null }
const { error: writeError } = existingRow
  ? await supabase.from('admin_users').update(payload).eq('id', existingRow.id)
  : await supabase.from('admin_users').insert({ ...payload, user_id: null })

if (writeError) die(`Could not write the allowlist row: ${writeError.message}`)
console.log('  • On the admin allowlist.')

// --- 2a. optional: Supabase's own invitation email -------------------------
if (sendEmail) {
  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/admin/login`,
  })
  if (error && !/already.*registered|already been registered/i.test(error.message)) {
    die(`Could not send the invitation: ${error.message}\n    SMTP may not be configured. Re-run without --email for a link instead.`)
  }
  console.log('  • Invitation email sent (if SMTP is configured).')
  console.log('\n  Open the email, set a password, then sign in at /admin/login.\n')
  process.exit(0)
}

// --- 2b. default: a single-use sign-up link, no email required -------------
// Supersede any live invitation first, so only one link for this address works.
const { error: supersedeError } = await supabase
  .from('admin_invitations')
  .update({ revoked_at: new Date().toISOString() })
  .eq('email', email)
  .is('accepted_at', null)
  .is('revoked_at', null)
if (supersedeError) {
  die(`Could not supersede old invitations: ${supersedeError.message}\n    Has 20261029120000_admin_invitations.sql been applied?`)
}

const token = generateInvitationToken()
const { error: inviteError } = await supabase.from('admin_invitations').insert({
  email,
  token_hash: hashInvitationToken(token),
  expires_at: invitationExpiry(),
  created_by: null, // nobody invited the first administrator
})
if (inviteError) {
  die(`Could not store the invitation: ${inviteError.message}\n    Has 20261029120000_admin_invitations.sql been applied?`)
}

console.log(`  • Issued a single-use sign-up link, valid for ${invitationTtlHours()} hours.`)
console.log('\n  Open this link and choose a password:\n')
console.log(`    ${buildSignupUrl(siteUrl, token)}\n`)
console.log('  It works once. Only a hash is stored, so it cannot be shown again —')
console.log('  re-run this script if you need a new one.')
console.log('  Add everyone else from /admin/team; this script should not be needed again.\n')

if (siteUrl.startsWith('http://localhost')) {
  console.log('  Note: that link points at localhost because PUBLIC_SITE_URL is unset.')
  console.log('  Set PUBLIC_SITE_URL to your real origin if you want to open it elsewhere.\n')
}
