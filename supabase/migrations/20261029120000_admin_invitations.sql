-- ============================================================================
-- Invitation-backed sign-up for the Epineon admin dashboard.
--
-- Adds ONE table. 20261029000000_contact_dashboard.sql is left untouched: it
-- may already be applied, and editing an applied migration silently diverges
-- the schema from the file.
--
-- Why a table at all, when Supabase Auth already has inviteUserByEmail()?
-- That path needs working SMTP, which we cannot assume. An invitation row lets
-- an administrator hand over a one-time link through any channel they trust,
-- and lets the server verify it without trusting anything the browser says.
--
-- What an invitation can and cannot do
--   * It authorises creating an auth account for ONE named address, once,
--     before an expiry.
--   * It does NOT grant administrator rights. Those come only from an active
--     row in admin_users, which this table cannot write. Sign-up checks both,
--     so a leaked token is worth no more than the allowlist already allows.
-- ============================================================================

-- --------------------------------------------------------- admin_invitations
create table if not exists public.admin_invitations (
  id               uuid primary key default gen_random_uuid(),
  email            text        not null,
  -- SHA-256 of the token, never the token itself: a database leak must not
  -- yield usable invitation links. The raw value is shown to the inviting
  -- administrator once and is not recoverable afterwards.
  token_hash       text        not null unique,
  expires_at       timestamptz not null,
  created_by       uuid        references auth.users (id) on delete set null,
  created_at       timestamptz not null default now(),
  -- Set the moment the invitation is claimed. The claim is an UPDATE guarded by
  -- `accepted_at is null`, so two concurrent redemptions cannot both succeed.
  accepted_at      timestamptz,
  accepted_user_id uuid        references auth.users (id) on delete set null,
  revoked_at       timestamptz
);

comment on table public.admin_invitations is
  'One-time, expiring tokens that permit account creation for an already-allowlisted address. Never a source of authorisation.';

create index if not exists admin_invitations_email_idx
  on public.admin_invitations (lower(email));

-- Narrow index for the only hot query: "is this pending invitation still live?"
create index if not exists admin_invitations_pending_idx
  on public.admin_invitations (expires_at)
  where accepted_at is null and revoked_at is null;

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.admin_invitations enable row level security;

-- Administrators may READ invitations so the Team page can show what is
-- outstanding. token_hash is included in no API response.
drop policy if exists admin_invitations_select on public.admin_invitations;
create policy admin_invitations_select on public.admin_invitations
  for select to authenticated
  using (public.is_admin());

-- Deliberately no insert/update/delete policy for `authenticated`. Minting,
-- claiming and revoking happen only in /api/admin/* under the service role,
-- which checks requireAdmin() first (or, for sign-up, a valid token). Without
-- this gap an authenticated user could mint themselves an invitation.

-- Belt and braces alongside RLS.
revoke all    on public.admin_invitations from anon;
grant  select on public.admin_invitations to   authenticated;
