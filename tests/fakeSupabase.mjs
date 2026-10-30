import http from 'node:http'

/**
 * A stand-in for the Supabase REST + Auth API, just complete enough for the
 * serverless handlers to run unmodified. Lets the real requireAdmin() and
 * endpoint code be exercised without touching a live project.
 *
 * It models enough PostgREST to be meaningful rather than merely green:
 * `eq`/`is`/`neq` filters, PATCH returning only the rows it actually matched,
 * and exact counts via Content-Range. The filtered PATCH matters most — it is
 * what makes the single-use invitation claim a real test rather than a
 * rubber stamp.
 */
export function startFakeSupabase({
  users = {},
  admins = [],
  invitations = [],
  authUsers = [],
  rateLimitAllows = true,
} = {}) {
  const state = { users, admins, invitations, authUsers, rateLimitAllows, inserted: [], calls: [] }

  /** Translate one PostgREST filter value, e.g. "eq.abc" or "is.null". */
  const matches = (row, column, expression) => {
    const [op, ...rest] = String(expression).split('.')
    const operand = rest.join('.')
    const actual = row[column]
    if (op === 'is') {
      if (operand === 'null') return actual === null || actual === undefined
      if (operand === 'true') return actual === true
      if (operand === 'false') return actual === false
      return false
    }
    if (op === 'eq') return String(actual ?? '') === operand
    if (op === 'neq') return String(actual ?? '') !== operand
    // Anything else is unsupported on purpose: a silent pass would hide a bug.
    throw new Error(`fakeSupabase: unsupported filter "${expression}" on ${column}`)
  }

  const RESERVED = new Set(['select', 'order', 'limit', 'offset', 'on_conflict'])

  /**
   * Honour `?select=` the way PostgREST does, returning only the named columns.
   * Without this a handler that forgets to narrow its select would still look
   * safe in tests — the column leak is exactly what some of them check for.
   */
  const project = (rows, params) => {
    const select = params.get('select')
    if (!select || select === '*') return rows
    const columns = select.split(',').map((c) => c.trim()).filter(Boolean)
    if (!columns.length || columns.includes('*')) return rows
    return rows.map((row) => Object.fromEntries(columns.map((c) => [c, row[c]])))
  }

  const filterRows = (rows, params) => {
    let out = rows
    for (const [column, expression] of params.entries()) {
      if (RESERVED.has(column)) continue
      out = out.filter((row) => matches(row, column, expression))
    }
    const limit = Number(params.get('limit'))
    return Number.isFinite(limit) && limit > 0 ? out.slice(0, limit) : out
  }

  const tableFor = (pathname) => {
    if (pathname === '/rest/v1/admin_users') return state.admins
    if (pathname === '/rest/v1/admin_invitations') return state.invitations
    return null
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    const send = (code, payload, headers = {}) => {
      res.statusCode = code
      res.setHeader('Content-Type', 'application/json')
      for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
      res.end(JSON.stringify(payload))
    }
    const body = await new Promise((resolve) => {
      const chunks = []
      req.on('data', (c) => chunks.push(c))
      req.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8')
        try { resolve(raw ? JSON.parse(raw) : null) } catch { resolve(null) }
      })
    })
    state.calls.push({ method: req.method, path: url.pathname })

    // --- Auth: resolve a bearer token to a user -----------------------------
    if (url.pathname === '/auth/v1/user') {
      const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
      const user = state.users[token]
      if (!user) return send(401, { message: 'invalid claim' })
      return send(200, user)
    }

    // --- Auth admin: create a user ------------------------------------------
    if (url.pathname === '/auth/v1/admin/users' && req.method === 'POST') {
      const email = String(body?.email || '').toLowerCase()
      if (state.authUsers.some((u) => u.email === email)) {
        // GoTrue's wording, which the handler pattern-matches on.
        return send(422, { msg: 'A user with this email address has already been registered' })
      }
      const user = {
        id: `uuid-new-${state.authUsers.length + 1}`,
        email,
        email_confirmed_at: body?.email_confirm ? new Date().toISOString() : null,
        // Recorded so a test can assert a password was actually set; a real
        // GoTrue would never return this.
        password_set: typeof body?.password === 'string' && body.password.length > 0,
        password: body?.password,
      }
      state.authUsers.push(user)
      return send(200, user)
    }

    // --- RPC ----------------------------------------------------------------
    if (url.pathname === '/rest/v1/rpc/bump_rate_limit') {
      return send(200, state.rateLimitAllows)
    }

    // --- Tables -------------------------------------------------------------
    const table = tableFor(url.pathname)
    if (table) {
      const selected = filterRows(table, url.searchParams)

      if (req.method === 'HEAD') {
        // How supabase-js asks for { count: 'exact', head: true }.
        res.statusCode = 200
        res.setHeader('Content-Range', `0-${Math.max(selected.length - 1, 0)}/${selected.length}`)
        return res.end()
      }

      if (req.method === 'GET') return send(200, project(selected, url.searchParams))

      if (req.method === 'PATCH') {
        // Mutate the stored rows first, then project only for the response.
        for (const row of selected) Object.assign(row, body)
        // Representation is what makes a guarded claim observable: zero rows
        // back means the guard held.
        return send(200, project(selected, url.searchParams))
      }

      if (req.method === 'POST') {
        const rows = Array.isArray(body) ? body : [body]
        for (const row of rows) {
          table.push({ id: `row-${table.length + 1}`, accepted_at: null, revoked_at: null, ...row })
        }
        return send(201, rows)
      }
    }

    // --- contact_messages ---------------------------------------------------
    if (url.pathname === '/rest/v1/contact_messages') {
      if (req.method === 'POST') {
        state.inserted.push(body)
        return send(201, [])
      }
    }

    return send(404, { message: 'not found' })
  })

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({
        url: `http://127.0.0.1:${port}`,
        state,
        close: () => new Promise((done) => server.close(done)),
      })
    })
  })
}

/** Minimal req/res doubles matching the Vercel Node signature. */
export function mockReq({ method = 'POST', headers = {}, body = undefined, url = undefined, query = undefined } = {}) {
  return {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body,
    url,
    query,
    socket: { remoteAddress: '203.0.113.9' },
  }
}

export function mockRes() {
  const res = {
    statusCode: null,
    headers: {},
    payload: null,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v },
    status(code) { this.statusCode = code; return this },
    send(raw) { this.payload = typeof raw === 'string' ? JSON.parse(raw) : raw; return this },
  }
  return res
}
