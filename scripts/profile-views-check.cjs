const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

(async () => {
  const { GET, POST } = await import(pathToFileURL(path.resolve('src/app/api/profile-views/route.ts')));
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  assert.equal((await GET()).status, 503, 'Missing storage must not claim a successful count.');
  process.env.KV_REST_API_URL = 'https://counter-test.invalid';
  process.env.KV_REST_API_TOKEN = 'test-only';
  let calls = [];
  let upstream = { result: null };
  global.fetch = async (url, options) => {
    calls.push(JSON.parse(options.body));
    assert.equal(url, 'https://counter-test.invalid');
    assert.equal(options.cache, 'no-store');
    return Response.json(upstream);
  };
  const initial = await GET();
  assert.equal(initial.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await initial.json(), { count: 319 });
  assert.deepEqual(calls, [['GET', '{astraa-profile-views}:total']]);
  upstream = { result: '345' };
  assert.deepEqual(await (await GET()).json(), { count: 345 });
  const view = (id, origin = 'https://astraa1.vercel.app') => new Request('https://astraa1.vercel.app/api/profile-views', { method: 'POST', headers: { 'Idempotency-Key': id, Origin: origin } });
  const id = 'bc84aa31-b591-4b59-8717-2e87b6483f0c';
  calls = [];
  assert.equal((await POST(view('bad'))).status, 400);
  assert.equal((await POST(view(id, 'https://other.example'))).status, 403);
  assert.deepEqual(calls, [], 'Invalid/cross-origin writes must not reach storage.');
  upstream = { result: 346 };
  assert.deepEqual(await (await POST(view(id))).json(), { count: 346 });
  assert.equal(calls[0][0], 'EVAL', 'The increment and deduplication must be one atomic Redis operation.');
  assert.equal(calls[0][2], 2);
  assert.equal(calls[0][4], `{astraa-profile-views}:visit:${id}`);
  for (const result of [undefined, -1, 318, 319.5, true, [], 'bad', Number.MAX_SAFE_INTEGER + 1]) {
    upstream = { result };
    assert.equal((await GET()).status, 503, 'Invalid upstream data must never become a public count.');
  }
  upstream = { error: 'secret provider error', result: 400 };
  const failed = await GET();
  assert.equal(failed.status, 503);
  assert.deepEqual(await failed.json(), { count: null }, 'Provider errors and credentials must stay private.');
  global.fetch = async () => { throw new Error('Timeout'); };
  assert.equal((await POST(view(id))).status, 503);
  console.log('PASS: counter baseline, persisted reads, atomic/idempotent command, input/origin validation, invalid data and unavailable storage.');
})().catch(error => { console.error(error); process.exitCode = 1; });
