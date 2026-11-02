import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isSchemaError, errorRef, logError } from '../api/_lib/http.js'

/** Deciding whether a failure means "the migrations are not applied". */

test('isSchemaError recognises the codes an unapplied migration produces', () => {
  for (const error of [
    { code: '42P01', message: 'relation "public.admin_invitations" does not exist' },
    { code: '42703', message: 'column "form_id" does not exist' },
    { code: 'PGRST204', message: "Could not find the 'company' column of 'contact_messages'" },
    { code: 'PGRST205', message: 'Could not find the table in the schema cache' },
    { message: 'relation "public.contact_messages" does not exist' }, // no code
  ]) {
    assert.equal(isSchemaError(error), true, `missed: ${error.message}`)
  }
})

test('isSchemaError does not misread ordinary failures as schema faults', () => {
  for (const error of [
    { code: '23505', message: 'duplicate key value violates unique constraint' },
    { code: '23503', message: 'insert or update violates foreign key constraint' },
    { code: '42501', message: 'permission denied for table admin_users' },
    { message: 'fetch failed' },
    null,
    undefined,
  ]) {
    assert.equal(isSchemaError(error), false, `false positive: ${JSON.stringify(error)}`)
  }
})

test('errorRef is short and unique enough to match a log line', () => {
  const refs = new Set(Array.from({ length: 200 }, () => errorRef()))
  assert.equal(refs.size, 200)
  for (const ref of refs) assert.match(ref, /^[0-9a-f]{8}$/)
})

test('logError prints the code and hint, not just the message', () => {
  const lines = []
  const original = console.error
  console.error = (...args) => lines.push(args.join(' '))
  try {
    logError('team:insert', {
      code: '42P01',
      message: 'relation does not exist',
      hint: 'apply the migration',
      details: 'nope',
    }, 'abc12345')
  } finally {
    console.error = original
  }
  const out = lines.join('\n')
  assert.match(out, /team:insert/)
  assert.match(out, /abc12345/, 'the reference must appear so it can be searched for')
  assert.match(out, /42P01/, 'the code is what identifies the fault')
  assert.match(out, /apply the migration/, 'the hint is the actionable part')
})

test('logError survives a non-object throw', () => {
  const original = console.error
  const lines = []
  console.error = (...args) => lines.push(args.join(' '))
  try {
    logError('scope', 'a bare string', 'ref1')
    logError('scope', undefined)
  } finally {
    console.error = original
  }
  assert.equal(lines.length, 2)
})
