import { useCallback, useEffect, useState } from 'react'
import { getSupabase, isSupabaseConfigured } from './supabaseClient.js'

/**
 * Session + authorisation state for the admin area.
 *
 * `isAdmin` is decided by the DATABASE, not by this hook: the probe below is a
 * select against admin_users, which RLS only answers for an active admin. A
 * user who edits this code, or flips a flag in devtools, still gets nothing
 * back from the API or the database.
 */
export function useAdminAuth() {
  const [state, setState] = useState({
    status: isSupabaseConfigured ? 'loading' : 'unconfigured',
    session: null,
    isAdmin: false,
    email: null,
  })

  const evaluate = useCallback(async (session) => {
    if (!session) {
      setState({ status: 'signed-out', session: null, isAdmin: false, email: null })
      return
    }
    // RLS returns rows here only when is_admin() holds for this caller.
    const { data, error } = await getSupabase().from('admin_users').select('id').limit(1)
    const isAdmin = !error && Array.isArray(data) && data.length > 0
    setState({
      status: isAdmin ? 'authorised' : 'unauthorised',
      session,
      isAdmin,
      email: session.user?.email ?? null,
    })
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let cancelled = false

    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) evaluate(data?.session ?? null)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) evaluate(session)
    })

    return () => {
      cancelled = true
      sub?.subscription?.unsubscribe()
    }
  }, [evaluate])

  const signOut = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) return
    await supabase.auth.signOut()
    setState({ status: 'signed-out', session: null, isAdmin: false, email: null })
  }, [])

  return { ...state, signOut }
}
