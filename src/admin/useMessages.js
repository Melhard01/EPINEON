import { useCallback, useEffect, useState } from 'react'
import { getSupabase } from './supabaseClient.js'

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
      .select('id, name, email, subject, message, status, created_at')
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

export const STATUS_LABELS = {
  unread: 'Unread',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived',
}
