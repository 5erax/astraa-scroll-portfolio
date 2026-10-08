const totalKey = "{astraa-profile-views}:total"
const recordView = `
redis.call('SET', KEYS[1], 318, 'NX')
if redis.call('SET', KEYS[2], 1, 'EX', 86400, 'NX') then
  return redis.call('INCR', KEYS[1])
end
return tonumber(redis.call('GET', KEYS[1]))
`

async function counter(command: (string | number)[]) {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  const headers = { "Cache-Control": "no-store" }
  if (!url || !token) return Response.json({ count: null }, { status: 503, headers })
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    })
    if (!response.ok) throw new Error("Counter unavailable")
    const data = await response.json()
    const result = data.result
    const count = command[0] === "GET" && result === null ? 319 : Number(result)
    if (data.error || !(typeof result === "number" || typeof result === "string" || command[0] === "GET" && result === null) || !Number.isSafeInteger(count) || count < 319) {
      throw new Error("Invalid counter response")
    }
    return Response.json({ count }, { headers })
  } catch {
    return Response.json({ count: null }, { status: 503, headers })
  }
}

export async function GET() {
  return counter(["GET", totalKey])
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin")
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403 })
  const visit = request.headers.get("Idempotency-Key") || ""
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visit)) {
    return new Response(null, { status: 400 })
  }
  // shortcut: counts openings, including repeats and bots; use analytics for unique human visitors.
  return counter(["EVAL", recordView, 2, totalKey, `{astraa-profile-views}:visit:${visit}`])
}
