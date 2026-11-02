/**
 * Display helpers for the signed-in administrator.
 *
 * admin_users stores an email and nothing else — no display name column — so a
 * readable name is derived from the address rather than invented. If the local
 * part gives us nothing usable we fall back to the address itself: better a
 * plain email on screen than a made-up name.
 */

/** "y.bouamri@epineon.ai" -> "Y Bouamri";  "admin@epineon.ai" -> "Admin" */
export function adminDisplayName(email) {
  const local = String(email ?? '').split('@')[0]
  if (!local) return 'there'
  const words = local
    .split(/[._\-+]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  return words.length ? words.join(' ') : email
}

/** The eyebrow above every admin page heading, so they all read alike. */
export function adminDateline(now = new Date()) {
  return now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
}

/** Single letter for the avatar disc. */
export function adminInitial(email) {
  const name = adminDisplayName(email)
  return (name.trim().charAt(0) || '?').toUpperCase()
}
