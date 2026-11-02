import { useCallback, useEffect, useState } from 'react'
import { getSupabase } from './supabaseClient.js'
import { LEGACY_FORM_ID } from '../../api/_lib/forms.js'

/**
 * Reads and mutates contact_messages directly through Supabase using the
 * signed-in user's JWT, so every query is evaluated against RLS. No service
 * key is involved and no bespoke read API is needed: if the caller is not an
 * active admin the database simply returns nothing.
 */
export function useMessages() {
  const [messages, setMessages] = useState([])
  const [state, setState] = useState('loading')
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setState('loading')
    setError(null)
    const { data, error: queryError } = await getSupabase()
      .from('contact_messages')
      .select('id, name, email, company, subject, message, status, created_at, form_id, form_name')
      .order('created_at', { ascending: false })
      .limit(500)

    if (queryError) {
      setError('Could not load messages.')
      setState('error')
      return
    }
    setMessages(data ?? [])
    setState('ready')
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const setStatus = useCallback(async (id, status) => {
    const previous = messages
    setMessages((rows) => rows.map((row) => (row.id === id ? { ...row, status } : row)))
    const { error: updateError } = await getSupabase().from('contact_messages').update({ status }).eq('id', id)
    if (updateError) {
      setMessages(previous)
      throw new Error('Could not update that message.')
    }
  }, [messages])

  const remove = useCallback(async (id) => {
    const previous = messages
    setMessages((rows) => rows.filter((row) => row.id !== id))
    const { error: deleteError } = await getSupabase().from('contact_messages').delete().eq('id', id)
    if (deleteError) {
      setMessages(previous)
      throw new Error('Could not delete that message.')
    }
  }, [messages])

  return { messages, state, error, reload: load, setStatus, remove }
}

/**
 * Submissions per form id, for the section counts. Derived from the rows the
 * hook already holds, so it costs no extra query — which also means it reflects
 * the same 500-row window the list does.
 */
export function countByForm(messages) {
  const counts = new Map()
  for (const message of messages) {
    const id = message.form_id || LEGACY_FORM_ID
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return counts
}

export const STATUS_LABELS = {
  unread: 'Unread',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived',
}
