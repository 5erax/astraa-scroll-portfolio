import type { PostcardProject } from '@/components/ui/torn-postcard-portfolio';

type Repository = {
  full_name: string; name: string; private: boolean; archived: boolean; fork: boolean;
  pushed_at: string; description: string | null; homepage: string | null; language: string | null;
  size: number;
};
type Contribution = {
  type: string; actor: { login: string }; repo: { name: string }; created_at: string;
  payload?: { action?: string; pull_request?: { user?: { login?: string } } };
};
const excluded = new Set(['5erax/5erax', '5erax/pflio', '5erax/astraa-scroll-portfolio']);
const repositoryName = /^[\w.-]+\/[\w.-]+$/;
function isContribution(event: Contribution) {
  return event.actor?.login?.toLowerCase() === '5erax' && (event.type === 'PushEvent'
    || (event.type === 'PullRequestEvent' && event.payload?.action === 'opened'
      && event.payload.pull_request?.user?.login?.toLowerCase() === '5erax'));
}

async function github(path: string): Promise<unknown> {
  const response = await fetch(`https://api.github.com/${path}`, {
    headers: { Accept: 'application/vnd.github+json' },
    next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  return response.json();
}

export function selectProjects(repositories: Repository[], events: Contribution[], curated: PostcardProject[]) {
  const contributions = new Map<string, number>();
  for (const event of events) {
    if (!isContribution(event) || !repositoryName.test(event.repo?.name)) continue;
    const name = event.repo.name.toLowerCase();
    const timestamp = Date.parse(event.created_at);
    if (Number.isFinite(timestamp)) contributions.set(name, Math.max(contributions.get(name) ?? 0, timestamp));
  }
  const known = new Map(curated.map(project => [project.repository?.toLowerCase(), project]));
  return repositories.filter(repo => repositoryName.test(repo.full_name) && !repo.private && !repo.archived
    && repo.size > 0
    && !excluded.has(repo.full_name.toLowerCase()) && (!repo.fork || contributions.has(repo.full_name.toLowerCase()))
    && Number.isFinite(Date.parse(repo.pushed_at)))
    .sort((a, b) => (contributions.get(b.full_name.toLowerCase()) ?? Date.parse(b.pushed_at))
      - (contributions.get(a.full_name.toLowerCase()) ?? Date.parse(a.pushed_at)))
    .slice(0, 12).map((repo): PostcardProject => {
      const saved = known.get(repo.full_name.toLowerCase());
      let url = `https://github.com/${repo.full_name}`;
      try {
        const homepage = new URL(repo.homepage || '');
        if (homepage.protocol === 'https:' && !homepage.username && !homepage.password) url = homepage.href;
      } catch { /* Repositories without a website link open their source. */ }
      return {
        ...saved, repository: repo.full_name, name: saved?.name ?? repo.name.replace(/[-_]+/g, ' '),
        description: repo.description?.trim() || saved?.description || 'Explore the source, progress and latest changes on GitHub.',
        role: saved?.role ?? 'GitHub project', tags: saved?.tags ?? (repo.language ? [repo.language] : []),
        note: saved?.note ?? 'recent GitHub work', url, scene: saved?.scene ?? 'lake',
      };
    });
}

export async function getGitHubProjects(curated: PostcardProject[]): Promise<PostcardProject[]> {
  try {
    const [repos, ...eventPages] = await Promise.all([
      github('users/5erax/repos?sort=pushed&per_page=100'),
      ...[1, 2, 3].map(page => github(`users/5erax/events/public?per_page=100&page=${page}`)),
    ]);
    if (!Array.isArray(repos) || eventPages.some(page => !Array.isArray(page))) throw new Error('Invalid GitHub response');
    const events = eventPages.flat() as Contribution[];
    const names = new Set((repos as Repository[]).map(repo => repo.full_name.toLowerCase()));
    const external = [...new Set(events.filter(isContribution)
      .map(event => event.repo?.name).filter(name => repositoryName.test(name) && !names.has(name.toLowerCase())))].slice(0, 10);
    const results = await Promise.allSettled(external.map(name => github(`repos/${name}`)));
    const all = [...repos, ...results.flatMap(result => result.status === 'fulfilled' ? [result.value] : [])] as Repository[];
    const selected = selectProjects(all, events, curated);
    return selected.length ? selected : curated;
  } catch {
    console.warn('GitHub project sync unavailable; serving the saved project catalogue.');
    return curated;
  }
}
