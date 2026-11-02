import { useCallback, useEffect, useState } from 'react'
import { getSupabase } from './supabaseClient.js'
import { inferFormId } from '../../api/_lib/forms.js'

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

  /**
   * Both writes ask for the affected rows back with .select().
   *
   * Without it PostgREST reports neither an error nor a row count when RLS
   * filters the target out, so a blocked update looked like a successful one:
   * the badge flipped to "Read" and stayed that way until a reload put it back
   * to unread. An empty result is now treated as the failure it is.
   */
  const setStatus = useCallback(async (id, status) => {
    const previous = messages
    setMessages((rows) => rows.map((row) => (row.id === id ? { ...row, status } : row)))
    const { data, error: updateError } = await getSupabase()
      .from('contact_messages')
      .update({ status })
      .eq('id', id)
      .select('id, status')
    if (updateError || !data?.length) {
      setMessages(previous)
      throw new Error('Could not update that message.')
    }
    // Trust what came back rather than what we assumed.
    setMessages((rows) => rows.map((row) => (row.id === id ? { ...row, status: data[0].status } : row)))
  }, [messages])

  const remove = useCallback(async (id) => {
    const previous = messages
    setMessages((rows) => rows.filter((row) => row.id !== id))
    const { data, error: deleteError } = await getSupabase()
      .from('contact_messages')
      .delete()
      .eq('id', id)
      .select('id')
    if (deleteError || !data?.length) {
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
    // inferFormId, not message.form_id: rows written before the registry (or
    // before the backfill ran) carry 'contact' or nothing, and counting those
    // literally leaves every form tab reading 0.
    const id = inferFormId(message)
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return counts
}

/** Unread per form — the figure that actually needs an administrator. */
export function unreadByForm(messages) {
  const counts = new Map()
  for (const message of messages) {
    if (message.status !== 'unread') continue
    const id = inferFormId(message)
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
