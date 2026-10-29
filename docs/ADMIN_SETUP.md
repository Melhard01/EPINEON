# Epineon admin dashboard — setup and deployment

> **Production status: NOT VERIFIED / NOT TESTED.**
> Everything below was built and tested locally against a stand-in Supabase.
> No Supabase project was created, no environment variable was set in Vercel,
> and nothing was deployed — the Vercel project is not reachable from the
> connected account. Treat the production checklist in §9 as outstanding work.

---

## What this adds

| Route | Purpose |
|---|---|
| `/admin/login` | Sign-in. No registration exists anywhere. |
| `/admin` | Overview — message counts and the five latest submissions. |
| `/admin/messages` | Search, filter, read, change status, delete. |
| `/admin/team` | Invite and revoke administrators. |

Plus `POST /api/contact`, which is now where the public contact form submits.

### How access is actually enforced

Three independent layers; the UI is the weakest and is **not** relied upon.

1. **Database (the real boundary).** Row Level Security is on for every table.
   Reading a contact message requires `is_admin()` — an `active` row in
   `admin_users` matching your user id or email. `anon` has no privileges on
   these tables at all. Someone holding the public anon key and crafting their
   own requests still gets nothing.
2. **Server.** Every `/api/admin/*` call re-verifies the bearer token with
   Supabase and re-checks the allowlist before doing anything.
3. **UI.** The route guard redirects. Deleting that guard would change what is
   drawn on screen, not what data can be reached.

`admin_users` has **no insert or update policy** for authenticated users, so an
authenticated user cannot add themselves. Only the service role can write it,
and the server checks the caller is already an admin first.

---

## 1. Create the Supabase project

1. <https://supabase.com/dashboard> → **New project**.
2. Name it something unmistakable, e.g. `epineon-contact`. Use a **dedicated
   project** — do not reuse an existing one.
3. Pick the region closest to your team and set a strong database password.
4. Wait for provisioning, then open **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **anon / public** key → `VITE_SUPABASE_ANON_KEY` (safe in the browser)
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (**secret**)

> The service_role key bypasses every security rule in this document. Treat it
> like a root password: server-side only, never in `src/`, never in a `VITE_`
> variable, never in git. If it leaks, rotate it immediately on that same page.

---

## 2. Apply the database migration

**Option A — dashboard (simplest).** Open **SQL Editor → New query**, paste the
whole of `supabase/migrations/20261029000000_contact_dashboard.sql`, press
**Run**. It is idempotent, so running it twice is harmless.

**Option B — Supabase CLI.**

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### Verify it took

In **SQL Editor**:

```sql
-- Expect: admin_users, contact_messages, rate_limits — all rowsecurity = true
select tablename, rowsecurity from pg_tables
where schemaname = 'public'
  and tablename in ('admin_users','contact_messages','rate_limits');

-- Expect 4 policies, all for the `authenticated` role, none for `anon`
select tablename, policyname, roles, cmd from pg_policies where schemaname = 'public';
```

If `rowsecurity` is `false` anywhere, stop — the table is world-readable.

---

## 3. Create the first administrator

The dashboard's invite screen is only usable by an existing administrator, so
the first one is created from your machine:

```bash
cp .env.example .env.local        # then fill in the real values
node scripts/bootstrap-admin.mjs you@epineon.ai
```

It sends a Supabase invitation email and adds the address to the allowlist. Open
the email, set a password, then sign in at `/admin/login`. The script never sees
or stores your password.

Everyone after that is invited from **`/admin/team`** — you should not need the
script again.

---

## 4. Local environment variables

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Where it is used | Secret? |
|---|---|---|
| `VITE_SUPABASE_URL` | browser + server | No |
| `VITE_SUPABASE_ANON_KEY` | browser | No — RLS protects it |
| `SUPABASE_URL` | serverless functions | No |
| `SUPABASE_SERVICE_ROLE_KEY` | serverless functions only | **Yes** |
| `RATE_LIMIT_SALT` | hashing IPs before counting | **Yes** |
| `PUBLIC_SITE_URL` | invitation redirect links | No |

`.env*` is already in `.gitignore`. Generate the salt with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 5. Run and test locally

```bash
npm install
npm test            # 28 unit + integration tests, no credentials needed
npm run dev         # public site + admin UI
```

`npm run dev` serves the Vite app but **not** the `api/` functions. To exercise
the real endpoints locally, use the Vercel CLI, which runs both:

```bash
npx vercel dev      # first run asks you to link the project
```

Then try the contact form at <http://localhost:3000/contact> and confirm the row
lands in **Table Editor → contact_messages**.

---

## 6. Configure Vercel

**Project → Settings → Environment Variables.** Add for *Production*,
*Preview* and *Development*:

```
VITE_SUPABASE_URL          https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY     <anon key>
SUPABASE_URL               https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY  <service_role key>      ← mark as Sensitive
RATE_LIMIT_SALT            <random 64-char hex>    ← mark as Sensitive
PUBLIC_SITE_URL            https://epineon.ai
```

Then **Project → Settings → Supabase → Authentication → URL Configuration** (in
the Supabase dashboard): set **Site URL** to your production origin and add
`https://<your-domain>/admin/login` to **Redirect URLs**, or invitation links
will bounce.

Nothing else changes: `vercel.json` already runs `npm run build`, and Vercel
picks up `api/*.js` as Node functions automatically. `engines.node` is pinned to
`>=22` because the Supabase client needs a native `WebSocket`.

---

## 7. Deploy

Same repository, same project — no new project, no separate repo:

```bash
git add -A
git commit -m "Add secure admin dashboard"
git push
```

Vercel builds from the push. If you deploy by CLI instead: `npx vercel --prod`.

---

## 8. Invite the rest of the team

`/admin/team` → enter an address → **Send invitation**. They get a Supabase
email, set a password, and can then sign in. **Revoke** removes access
immediately — the next request their browser makes fails the `is_admin()` check.

Guard rails: you cannot revoke yourself, and the last remaining administrator
cannot be revoked.

---

## 9. Verify in production — OUTSTANDING

None of this has been run against a live deployment. Work through it after the
first deploy:

1. **Signed out**, open `/admin/messages` → should land on `/admin/login`.
2. Hard-refresh `/admin/messages` → should load, not 404.
3. `curl https://<domain>/api/admin/team` with no token → expect `401`.
4. `curl -H "Authorization: Bearer <token-of-a-non-admin>" …/api/admin/team` →
   expect `403`.
5. In a browser console on the live site, with the public anon key:
   `supabase.from('contact_messages').select('*')` as a signed-out visitor →
   expect zero rows and an RLS error, never data.
6. Submit the real contact form → row appears in `contact_messages`.
7. Submit it four times quickly → the fourth should return `429`.
8. Sign in as an admin → messages load, status changes stick, delete asks first.
9. Invite a throwaway address, accept, confirm access, revoke, confirm the
   dashboard stops loading data for them.
10. Sign out → `/admin` redirects to login again.

---

## 10. Rolling back

The public site and the admin area deploy together, so a bad release affects
both. Fastest route first:

1. **Vercel → Deployments → the previous good one → ⋯ → Promote to Production.**
   Takes effect in seconds and needs no git operation.
2. Or revert the commit and push:
   ```bash
   git revert <sha> && git push
   ```
3. The database is unaffected by either. The migration only adds objects, so
   rolling back the app leaves the tables in place and no data is lost. To
   remove them deliberately:
   ```sql
   drop table if exists public.contact_messages, public.admin_users, public.rate_limits cascade;
   drop function if exists public.is_admin, public.bump_rate_limit, public.touch_updated_at;
   ```
4. If the contact form is the only problem, set `VITE_API_BASE_URL` in Vercel to
   your previous backend origin and redeploy — the form will post there instead.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| "Dashboard not configured" | `VITE_SUPABASE_*` missing at **build** time. Vite inlines them during the build, so set them in Vercel and redeploy. |
| Signed in, but "not an approved administrator" | No `active` row in `admin_users` for that address. Invite them, or run the bootstrap script. |
| Invitation links land on an error | The redirect URL is not in Supabase's allow-list (§6). |
| Contact form returns 500 | `SUPABASE_SERVICE_ROLE_KEY` missing or wrong in Vercel. |
| Build fails on `WebSocket` | Node < 22 on the builder. `engines.node` should pin it; check the project's Node version setting. |
