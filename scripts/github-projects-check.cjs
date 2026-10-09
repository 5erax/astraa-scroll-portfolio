const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

(async () => {
  const { selectProjects, getGitHubProjects } = await import(pathToFileURL(path.resolve('src/lib/github-projects.ts')));
  const repo = (full_name, extra = {}) => ({ full_name, name: full_name.split('/')[1], private: false,
    archived: false, fork: false, pushed_at: '2026-10-01T00:00:00Z', description: null,
    homepage: null, language: 'TypeScript', size: 100, ...extra });
  const event = (name, date, type = 'PushEvent') => ({ type, repo: { name },
    actor: { login: '5erax' }, created_at: date });
  const curated = [{ name: 'Nét Studio', repository: '5erax/net-studio', image: '/media/net-studio-preview.webp', description: 'Saved description' }];
  const events = [event('5erax/net-studio', '2026-10-08'), event('team/new-app', '2026-10-09'),
    event('5erax/net-studio', '2026-10-02'), event('other/starred', '2026-10-10', 'WatchEvent')];
  const repositories = [repo('5erax/net-studio', { homepage: 'javascript:alert(1)' }),
    repo('team/new-app', { fork: true, homepage: 'https://new-app.example/', description: 'New app' }),
    repo('other/starred', { fork: true }), repo('5erax/astraa-scroll-portfolio'), repo('5erax/5erax'),
    repo('5erax/pflio'), repo('5erax/secret', { private: true }), repo('5erax/old', { archived: true }), repo('5erax/empty', { size: 0 })];
  const result = selectProjects(repositories, events, curated);
  assert.deepEqual(result.map(p => p.repository), ['team/new-app', '5erax/net-studio']);
  assert.equal(result[0].url, 'https://new-app.example/');
  assert.equal(result[0].description, 'New app');
  assert.equal(result[1].name, 'Nét Studio');
  assert.equal(result[1].image, '/media/net-studio-preview.webp');
  assert.equal(result[1].url, 'https://github.com/5erax/net-studio');
  assert.equal(result[1].description, 'Saved description');
  assert.equal(selectProjects(Array.from({ length: 20 }, (_, i) => repo(`5erax/app-${i}`)), [], []).length, 12);
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push(url);
    assert.equal(options.next.revalidate, 3600);
    assert.ok(options.signal);
    if (url.includes('/events/')) return Response.json(url.endsWith('page=1') ? events : []);
    if (url.includes('/users/')) return Response.json([repositories[0]]);
    assert.equal(url, 'https://api.github.com/repos/team/new-app', 'Only actual external contributions are fetched.');
    return Response.json(repositories[1]);
  };
  assert.deepEqual(await getGitHubProjects(curated), result);
  assert.equal(calls.length, 5);
  global.fetch = async () => new Response('', { status: 403 });
  assert.deepEqual(await getGitHubProjects(curated), curated, 'A rate limit must retain a usable saved catalogue.');
  global.fetch = async () => Response.json({ message: 'bad response' });
  assert.deepEqual(await getGitHubProjects(curated), curated);
  console.log('PASS: latest contributions, deduplication, public/fork/archive filters, preview preservation, safe links, new projects, hourly cache and API failure fallback.');
})().catch(error => { console.error(error); process.exitCode = 1; });
