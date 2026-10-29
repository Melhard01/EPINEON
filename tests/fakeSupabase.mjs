import http from 'node:http'

/**
 * A stand-in for the Supabase REST + Auth API, just complete enough for the
 * serverless handlers to run unmodified. Lets the real requireAdmin() and
 * endpoint code be exercised without touching a live project.
 */
export function startFakeSupabase({ users = {}, admins = [], rateLimitAllows = true } = {}) {
  const state = { users, admins, rateLimitAllows, inserted: [], calls: [] }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    const send = (code, payload) => {
      res.statusCode = code
      res.setHeader('Content-Type', 'application/json')
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

    // --- RPC ----------------------------------------------------------------
    if (url.pathname === '/rest/v1/rpc/bump_rate_limit') {
      return send(200, state.rateLimitAllows)
    }

    // --- admin_users --------------------------------------------------------
    if (url.pathname === '/rest/v1/admin_users') {
      if (req.method === 'GET') return send(200, state.admins)
      if (req.method === 'PATCH') return send(200, [])
      if (req.method === 'POST') return send(201, [])
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
export function mockReq({ method = 'POST', headers = {}, body = undefined } = {}) {
  return { method, headers: { 'content-type': 'application/json', ...headers }, body, socket: { remoteAddress: '203.0.113.9' } }
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
