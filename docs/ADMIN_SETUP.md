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
| `/admin/login` | Sign-in. |
| `/admin/signup` | Redeem an invitation link and set a password. Useless without a token. |
| `/admin` | Overview — message counts and the five latest submissions. |
| `/admin/messages` | Search, filter, read, change status, delete. |
| `/admin/team` | Invite and revoke administrators. |

Plus `POST /api/contact`, which is now where the public contact form submits,
and `GET|POST /api/admin/signup`, which verifies invitations.

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

### How sign-up stays invitation-only

There is a `/admin/signup` page, and it is still true that nobody can create an
administrator account. Creating one requires **two independent facts to agree**:

1. A live invitation — unexpired, unclaimed, unrevoked — whose `token_hash`
   matches the token in the link.
2. An `active` row in `admin_users` for that same address, which only an
   existing administrator can create.

An invitation on its own grants nothing: it authorises creating an account for
**one named address, once**. The address still has to be on the allowlist, and
being on the allowlist is what makes someone an admin. So a leaked token is
worth no more than the allowlist already permits, and a token can never be
pointed at a different address.

Other properties worth knowing:

- Only a **SHA-256 digest** of each token is stored. A database leak yields no
  usable links, and the raw token is shown to the inviting admin exactly once.
- Claiming is an `UPDATE … WHERE accepted_at IS NULL`, so two concurrent
  redemptions cannot both succeed — single use holds under a race.
- An address that **already has an auth account** is refused, so an invitation
  can never overwrite somebody's existing password.
- `admin_invitations` has a select policy for admins and **no write policy**, so
  an authenticated user cannot mint themselves an invitation either.
- Nothing in the request body affects authorisation. No role, status or
  `isAdmin` field is read anywhere in the flow.
- Inviting **sends no email**, so none of this depends on SMTP.

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

There are **three** migration files, and they must be applied in filename order:

| Order | File | Adds |
|---|---|---|
| 1 | `20261029000000_contact_dashboard.sql` | `admin_users`, `contact_messages`, `rate_limits`, `is_admin()` |
| 2 | `20261029120000_admin_invitations.sql` | `admin_invitations` (needed for sign-up) |
| 3 | `20261102000000_submission_forms.sql` | `form_id`, `form_name`, `company` on `contact_messages` — the per-form sections |

**Option A — dashboard (simplest).** Open **SQL Editor → New query**, paste the
whole of the first file, press **Run**; then repeat with the others. All three
are idempotent, so running any of them twice is harmless.

Migration 3 is safe to apply to a table that already holds submissions: the new
columns have defaults, so every existing row stays valid, and the backfill at
the end of the file sorts historical rows into their forms using the `subject`
the old client sent. It changes no policy and no existing column.

**Option B — Supabase CLI.**

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### Verify it took

In **SQL Editor**:

```sql
-- Expect 4 rows, every one with rowsecurity = true
select tablename, rowsecurity from pg_tables
where schemaname = 'public'
  and tablename in ('admin_users','contact_messages','rate_limits','admin_invitations');

-- Expect 5 policies, all for the `authenticated` role, none for `anon`
select tablename, policyname, roles, cmd from pg_policies where schemaname = 'public';
```

If `rowsecurity` is `false` anywhere, stop — the table is world-readable.

---

## 3. Create the first administrator

The dashboard's invite screen is only usable by an existing administrator, so
the first one is created from your machine. Holding the service-role key is what
authorises this, and that key never leaves your machine.

```bash
cp .env.example .env.local        # then fill in the real values
node scripts/bootstrap-admin.mjs you@epineon.ai
```

It allowlists the address and prints a **single-use sign-up link**. Open the
link, choose a password, and you are in. No email is sent, so this works before
SMTP exists. The script never sees or stores a password.

> The printed link uses `PUBLIC_SITE_URL`. If that is unset it points at
> `http://localhost:5173`, which is fine when you are running `npm run dev` and
> wrong otherwise — the script warns you when this happens.

The link works once, and only its hash is stored, so it cannot be reprinted.
Re-run the script to issue a fresh one; that supersedes the old link.

<details>
<summary>Alternative: Supabase's own invitation email (<code>--email</code>)</summary>

```bash
node scripts/bootstrap-admin.mjs you@epineon.ai --email
```

Requires working SMTP, and the redirect URL must be allow-listed (§6). This
creates the auth user immediately, which means the sign-up link path will
**not** work for that address afterwards — use the emailed link instead. The
two are alternatives, not steps.
</details>

Everyone after that is invited from **`/admin/team`** — you should not need the
script again.

### Creating an admin entirely from the dashboard

If you would rather not run anything locally, this works too and needs no
service-role key on your machine:

1. **Authentication → Users → Add user → Create new user**: enter the address
   and a password, and tick **Auto Confirm User**.
2. **SQL Editor**, with both addresses replaced by yours:

```sql
insert into public.admin_users (email, user_id, status)
select lower('you@epineon.ai'), u.id, 'active'
from auth.users u
where lower(u.email) = lower('you@epineon.ai');

select email, status, user_id from public.admin_users;
```

The final select must return one row, `status = 'active'`, with a non-null
`user_id`. Then sign in at `/admin/login`. No invitation is involved, because
you are creating the account directly.

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
| `PUBLIC_SITE_URL` | the origin in invitation sign-up links | No |
| `ADMIN_INVITE_TTL_HOURS` | optional; invitation lifetime, default 168 | No |

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

Optionally add `ADMIN_INVITE_TTL_HOURS` to shorten invitation lifetimes.

Then, **in the Supabase dashboard**, under **Authentication → URL
Configuration**: set **Site URL** to your production origin and add
`https://<your-domain>/admin/login` to **Redirect URLs**.

Invitation sign-up links do **not** need this — they carry their own token and
are verified by our own endpoint. It is needed for "Forgot password?" and for
the `--email` bootstrap path, both of which rely on Supabase's own mail and
redirects.

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

## 7b. Which form a submission came from

Every public form posts to the same `/api/contact`. The form's identity travels
as an **id only** (`formId`), which the server resolves against the registry in
[`api/_lib/forms.js`](../api/_lib/forms.js); the display name is looked up there
too. A `formName` in a request body is never read, so a visitor cannot file
their message under a label of their own choosing.

| `form_id` | Shown as | Where on the site |
|---|---|---|
| `demo` | Demo request | `/contact` and `/contact#demo` |
| `sales` | Sales & Enterprise | `/contact#sales` |
| `partnerships` | Partnerships & Ventures | `/contact#partnerships` |
| `contact` | Contact | fallback — submissions that predate `form_id`, or any unrecognised id |

An unknown id is **not** rejected: it lands in the `contact` bucket so a visitor
on a cached bundle can still reach us. The dashboard shows that bucket as its
own section whenever it holds anything, so nothing is ever invisible.

**Adding a form later** means adding a tab in `src/pages/Contact.jsx` *and* an
entry in `api/_lib/forms.js`. `npm test` fails if the two disagree — it reads
the tabs out of the Contact page and compares them with the registry. No
database migration is needed: `form_id` is shape-checked, not enumerated.

---

## 8. Invite the rest of the team

`/admin/team` → enter an address → **Send invitation**. The page then shows a
**one-time sign-up link**. Copy it and pass it to them over a channel you trust
— Signal, a password manager share, in person. Nothing is emailed.

They open the link, choose their own password at `/admin/signup`, and are signed
in. You never see their password.

- The link is shown **once**. Only a hash is stored, so it cannot be shown
  again; invite the same address again to issue a fresh one, which supersedes
  the previous link.
- Links expire after 7 days by default (`ADMIN_INVITE_TTL_HOURS`).
- Pending members show a **Pending** pill; hover it to see when their link
  expires, or whether they have none.
- **Revoke** removes access immediately *and* kills any outstanding link. The
  next request their browser makes fails the `is_admin()` check.
- Someone who has already signed in needs no link — if they are locked out,
  they use **Forgot password?**, which does need SMTP.

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
| Sign-up says the link "is not valid" | Wrong, truncated or superseded token. Inviting the same address again supersedes earlier links, so only the newest works. |
| Sign-up says "already been used" | Single use by design. Invite them again for a fresh link. |
| Sign-up says "an account already exists" | That address has a Supabase auth user already. They should sign in, or use "Forgot password?" — an invitation never overwrites a password. |
| Sign-up link points at `localhost` | `PUBLIC_SITE_URL` is unset wherever the link was minted. |
| Invitation links land on an error | Only applies to the `--email` path: the redirect URL is not in Supabase's allow-list (§6). |
| Sign-up returns 500 | Usually `20261029120000_admin_invitations.sql` has not been applied. |
| Contact form returns 500 | `SUPABASE_SERVICE_ROLE_KEY` missing or wrong in Vercel. |
| Build fails on `WebSocket` | Node < 22 on the builder. `engines.node` should pin it; check the project's Node version setting. |
