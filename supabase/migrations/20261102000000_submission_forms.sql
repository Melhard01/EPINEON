-- ============================================================================
-- Per-form categorisation for contact submissions.
--
-- Adds three columns to the EXISTING contact_messages table. No new table, no
-- change to any policy, no change to any existing column: the earlier
-- migrations stay untouched because they are already applied, and editing an
-- applied migration silently diverges the schema from the file.
--
-- Security
--   * RLS is untouched. New columns are covered by the existing
--     contact_messages policies, which already require is_admin().
--   * form_id is still only ever written by /api/contact under the service
--     role, which resolves it against the registry in api/_lib/forms.js. The
--     check below is shape-only defence in depth, not the authorisation.
-- ============================================================================

-- --------------------------------------------------------------- new columns
-- Defaults chosen so that applying this to a live table is safe: every existing
-- row becomes a valid 'contact' row immediately, and the backfill below then
-- sorts them into their real forms.
alter table public.contact_messages
  add column if not exists form_id   text not null default 'contact',
  add column if not exists form_name text not null default 'Contact',
  -- Until now the company lived only inside the composed message body. Stored
  -- separately so the dashboard can show it as a field. Always optional:
  -- the Partnerships form calls it "Organization" and some forms omit it.
  add column if not exists company   text;

comment on column public.contact_messages.form_id is
  'Which website form this came from. Resolved server-side against api/_lib/forms.js; never taken from the request body.';
comment on column public.contact_messages.form_name is
  'Display name for form_id, looked up on the server at insert time. A client-supplied name is ignored.';

-- A SHAPE check, deliberately not an enum of known ids: adding a form to the
-- registry should not require a database migration. Garbage still cannot land.
alter table public.contact_messages
  drop constraint if exists contact_messages_form_id_check;
alter table public.contact_messages
  add constraint contact_messages_form_id_check
  check (form_id ~ '^[a-z0-9][a-z0-9_-]{0,39}$');

-- The dashboard's hot query: one form's submissions, newest first.
create index if not exists contact_messages_form_id_idx
  on public.contact_messages (form_id, created_at desc);

-- ------------------------------------------------------------------ backfill
-- Existing rows carry the form's label in `subject`, because that is what the
-- old client sent. Map only the three labels we know; anything else stays in
-- the 'contact' bucket rather than being guessed at.
update public.contact_messages set
  form_id = case subject
    when 'Demo request'             then 'demo'
    when 'Sales & Enterprise'       then 'sales'
    when 'Partnerships & Ventures'  then 'partnerships'
  end,
  form_name = subject
where form_id = 'contact'
  and subject in ('Demo request', 'Sales & Enterprise', 'Partnerships & Ventures');

-- Lift the company out of the composed message body for historical rows. The
-- three field labels below are the ones the forms actually render; '—' is what
-- the old client wrote for a field left blank, so it becomes NULL rather than
-- a literal dash. Rows that do not match are simply left alone.
update public.contact_messages
set company = nullif(
      trim(substring(message from '(?:^|\n)(?:Company or organisation|Organization|Company): *([^\n]+)')),
      '—'
    )
where company is null
  and message ~ '(?:^|\n)(?:Company or organisation|Organization|Company): ';
