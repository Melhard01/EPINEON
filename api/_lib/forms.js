/**
 * The form registry — the server's source of truth for which public forms exist.
 *
 * WHY THIS FILE EXISTS
 * Every public form posts to the same endpoint. Before this registry the only
 * record of *which* form a submission came from was the `subject` string and a
 * `[label]` prefix inside the message body — both chosen by the browser and
 * never checked. Routing a submission on that basis means letting the client
 * decide where its own message files.
 *
 * So: the client sends an `id` and nothing else. The server matches that id
 * against the list below and looks the display NAME up here. A `form_name` in
 * a request body is ignored outright — there is no code path that reads one.
 *
 * Kept free of I/O, of `process.env` and of any Supabase import, because it is
 * imported from three places:
 *   - api/_lib/validation.js   (server: decides what gets stored)
 *   - src/routes.jsx           (build: one prerendered admin route per form)
 *   - src/pages/admin/*        (browser: the dashboard's sections)
 * The security-critical side owns the data and the UI reads from it, never the
 * other way round.
 */

/**
 * Where anything unrecognised lands: submissions from a cached bundle built
 * before this registry, and anything whose id does not match. It is a real
 * section in the dashboard, so nothing is ever invisible to an administrator.
 */
export const LEGACY_FORM_ID = 'contact'

/**
 * `name` is the form's label exactly as the website shows it — these are the
 * same strings src/pages/Contact.jsx renders on its tabs, which is also what
 * the old client put in `subject`, so the backfill in
 * supabase/migrations/20261102000000_submission_forms.sql maps cleanly.
 */
export const FORMS = [
  {
    id: LEGACY_FORM_ID,
    name: 'Contact',
    path: '/contact',
    // Not a form on the site: the bucket for submissions that predate form_id.
    legacy: true,
  },
  { id: 'demo', name: 'Demo request', path: '/contact#demo' },
  { id: 'sales', name: 'Sales & Enterprise', path: '/contact#sales' },
  { id: 'partnerships', name: 'Partnerships & Ventures', path: '/contact#partnerships' },
]

const BY_ID = new Map(FORMS.map((form) => [form.id, form]))

/** Registry name -> id, so a stored form_name or subject can be matched back. */
const BY_NAME = new Map(FORMS.map((form) => [form.name.toLowerCase(), form.id]))

/**
 * Other spellings that mean one of our forms.
 *
 * Rows can carry these for three reasons: a different naming scheme was used
 * before the registry existed, the backfill in
 * 20261102000000_submission_forms.sql did not recognise a subject, or a row was
 * written by something other than /api/contact. Aliasing them here means the
 * dashboard counts and labels them correctly without a second migration.
 */
const ALIASES = new Map([
  ['demo_request', 'demo'],
  ['demo-request', 'demo'],
  ['demorequest', 'demo'],
  ['request_a_demo', 'demo'],
  ['book_a_demo', 'demo'],
  ['sales_inquiry', 'sales'],
  ['sales-inquiry', 'sales'],
  ['sales_enquiry', 'sales'],
  ['salesinquiry', 'sales'],
  ['enterprise', 'sales'],
  ['sales_enterprise', 'sales'],
  ['partnership_inquiry', 'partnerships'],
  ['partnerships_inquiry', 'partnerships'],
  ['partnership-inquiry', 'partnerships'],
  ['partnership', 'partnerships'],
  ['partner', 'partnerships'],
  ['ventures', 'partnerships'],
])

const normalise = (value) => String(value ?? '').trim().toLowerCase()

/** An id, an alias of one, or a registry name — otherwise null. */
function canonicalise(value) {
  const key = normalise(value)
  if (!key) return null
  if (BY_ID.has(key)) return key
  if (ALIASES.has(key)) return ALIASES.get(key)
  if (BY_NAME.has(key)) return BY_NAME.get(key)
  return null
}

export const FORM_IDS = FORMS.map((form) => form.id)

export function isKnownFormId(value) {
  return typeof value === 'string' && BY_ID.has(value)
}

export function getForm(id) {
  return BY_ID.get(id) ?? null
}

/**
 * Resolve whatever the client sent to an id this server recognises.
 *
 * Deliberately falls back instead of rejecting: a visitor on a cached bundle
 * that predates `formId` must still be able to reach us. Their message lands in
 * the legacy bucket rather than being lost.
 */
export function resolveFormId(value) {
  return canonicalise(value) ?? LEGACY_FORM_ID
}

/**
 * The stored display name. Always derived here from an already-resolved id —
 * never taken from, or influenced by, the request body.
 */
export function formNameFor(id) {
  return (BY_ID.get(id) ?? BY_ID.get(LEGACY_FORM_ID)).name
}

/**
 * Work out which form a stored row came from.
 *
 * form_id is believed first, but rows written before the registry — or before
 * the backfill ran — may carry nothing useful there. The old client always put
 * the tab's label in `subject` and opened the body with "[Label]", so those are
 * reliable secondary evidence. Anything still unidentifiable lands in the
 * legacy bucket, which is a real section, never a hole.
 */
export function inferFormId(row) {
  if (!row || typeof row !== 'object') return LEGACY_FORM_ID

  const fromId = canonicalise(row.form_id)
  // A stored 'contact' is the backfill default, not a positive identification,
  // so keep looking before settling for it.
  if (fromId && fromId !== LEGACY_FORM_ID) return fromId

  const fromName = canonicalise(row.form_name)
  if (fromName && fromName !== LEGACY_FORM_ID) return fromName

  const fromSubject = canonicalise(row.subject)
  if (fromSubject && fromSubject !== LEGACY_FORM_ID) return fromSubject

  // "[Demo request]\nCompany: ..." — the prefix the old client composed.
  const prefix = /^\s*\[([^\]]{1,60})\]/.exec(String(row.message ?? ''))
  const fromBody = prefix ? canonicalise(prefix[1]) : null
  if (fromBody && fromBody !== LEGACY_FORM_ID) return fromBody

  return fromId ?? LEGACY_FORM_ID
}

/**
 * What to show an administrator for a row. Never "Unknown form": an
 * unrecognised id still has its stored name, and failing that it is the legacy
 * bucket, which has a name of its own.
 */
export function formLabelForRow(row) {
  const id = inferFormId(row)
  if (id !== LEGACY_FORM_ID) return formNameFor(id)
  const stored = typeof row?.form_name === 'string' ? row.form_name.trim() : ''
  if (stored) return stored
  const raw = typeof row?.form_id === 'string' ? row.form_id.trim() : ''
  if (raw && raw !== LEGACY_FORM_ID) return raw
  return formNameFor(LEGACY_FORM_ID)
}

/** Label for a bare id + stored name pair. Also never "Unknown form". */
export function displayFormName(formId, storedName) {
  return formLabelForRow({ form_id: formId, form_name: storedName })
}
