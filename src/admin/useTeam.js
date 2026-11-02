import { useCallback, useEffect, useState } from 'react'
import { adminFetch } from './supabaseClient.js'

/**
 * The administrator allowlist, read through /api/admin/team so the caller is
 * re-verified server-side. Read-only: every mutation stays on the Team access
 * page, which is the one place that should be changing who has access.
 */
export function useTeam() {
  const [members, setMembers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [state, setState] = useState('loading')

  const load = useCallback(async () => {
    setState('loading')
    try {
      const data = await adminFetch('/api/admin/team')
      setMembers(data.members ?? [])
      setInvitations(data.invitations ?? [])
      setState('ready')
    } catch {
      setState('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { members, invitations, state, reload: load }
}
