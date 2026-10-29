-- ============================================================================
-- Epineon contact dashboard — schema, authorization and Row Level Security.
--
-- Security model
--   * No table grants INSERT/UPDATE/DELETE to `anon`. Public contact submissions
--     arrive only through the server-side /api/contact function, which uses the
--     service-role key (service_role bypasses RLS).
--   * Reading or changing a contact message requires an ACTIVE row in
--     admin_users for the caller. Being authenticated is never sufficient.
--   * admin_users has no write policy for `authenticated`, so an authenticated
--     user cannot grant themselves access; only the service role can write it,
--     and the server checks the caller is already an admin before doing so.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- admin_users
create table if not exists public.admin_users (
  id          uuid primary key default gen_random_uuid(),
  email       text        not null,
  user_id     uuid        unique references auth.users (id) on delete set null,
  status      text        not null default 'active' check (status in ('active', 'revoked')),
  invited_by  uuid        references auth.users (id) on delete set null,
  invited_at  timestamptz not null default now(),
  -- null until the invitee first loads the dashboard; the UI shows these as "Pending".
  last_seen_at timestamptz,
  revoked_at  timestamptz
);

-- Emails are stored lowercase; the index enforces that no address is invited twice.
create unique index if not exists admin_users_email_key on public.admin_users (lower(email));

-- ------------------------------------------------------------ contact_messages
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  email       text        not null,
  subject     text        not null default '',
  message     text        not null,
  status      text        not null default 'unread'
                check (status in ('unread', 'read', 'replied', 'archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- Abuse forensics. ip_hash is a salted digest, never a raw address.
  ip_hash     text,
  user_agent  text,
  source_path text
);

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_status_idx     on public.contact_messages (status);

-- ---------------------------------------------------------------- rate_limits
create table if not exists public.rate_limits (
  bucket       text        not null,
  identifier   text        not null,
  window_start timestamptz not null,
  count        integer     not null default 0,
  primary key (bucket, identifier, window_start)
);

-- ------------------------------------------------------------------ is_admin()
-- SECURITY DEFINER so the check can read admin_users regardless of the caller's
-- own policies; search_path is pinned so the body cannot be hijacked by a
-- caller-controlled schema.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_users a
    where a.status = 'active'
      and (
        a.user_id = auth.uid()
        or lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- --------------------------------------------------------------- updated_at
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists contact_messages_touch_updated_at on public.contact_messages;
create trigger contact_messages_touch_updated_at
  before update on public.contact_messages
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------- atomic rate limiting
-- Returns true when the call is within budget. One row per (bucket, id, window);
-- the insert..on conflict makes the increment atomic under concurrency.
create or replace function public.bump_rate_limit(
  p_bucket         text,
  p_identifier     text,
  p_window_seconds integer,
  p_limit          integer
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_window timestamptz;
  v_count  integer;
begin
  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into public.rate_limits (bucket, identifier, window_start, count)
  values (p_bucket, p_identifier, v_window, 1)
  on conflict (bucket, identifier, window_start)
    do update set count = public.rate_limits.count + 1
  returning count into v_count;

  delete from public.rate_limits where window_start < now() - interval '1 day';

  return v_count <= p_limit;
end;
$$;

revoke all on function public.bump_rate_limit(text, text, integer, integer) from public, anon, authenticated;

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.admin_users      enable row level security;
alter table public.contact_messages enable row level security;
alter table public.rate_limits      enable row level security;

-- Deny-by-default: every table above has RLS on, so any request without a
-- matching policy is refused. Only the policies below open anything up.

drop policy if exists admin_users_select on public.admin_users;
create policy admin_users_select on public.admin_users
  for select to authenticated
  using (public.is_admin());
-- Deliberately no insert/update/delete policy: writes go through the server.

drop policy if exists contact_messages_select on public.contact_messages;
create policy contact_messages_select on public.contact_messages
  for select to authenticated
  using (public.is_admin());

drop policy if exists contact_messages_update on public.contact_messages;
create policy contact_messages_update on public.contact_messages
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists contact_messages_delete on public.contact_messages;
create policy contact_messages_delete on public.contact_messages
  for delete to authenticated
  using (public.is_admin());
-- Deliberately no insert policy: submissions go through /api/contact.

-- Belt and braces alongside RLS — anon holds no privileges on these tables at all.
revoke all on public.admin_users      from anon;
revoke all on public.contact_messages from anon;
revoke all on public.rate_limits      from anon, authenticated;

grant select                 on public.admin_users      to authenticated;
grant select, update, delete on public.contact_messages to authenticated;
