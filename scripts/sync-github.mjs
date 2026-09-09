import fs from "node:fs";

/**
 * Snapshots the GitHub profile into public/github.json so Network Neighborhood
 * can render instantly from a static file instead of calling the API per visit.
 *
 * Runs before dev and build. If GitHub is unreachable or rate-limited the
 * existing snapshot is kept and the build carries on — a portfolio should not
 * fail to build because someone else's API had a bad minute.
 *
 * GITHUB_USER  overrides the account (default: AamHermansyah)
 * GITHUB_TOKEN optional, raises the unauthenticated 60 requests/hour limit
 */

const user = process.env.GITHUB_USER || "AamHermansyah";
const target = "public/github.json";

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": `portfolio-os-sync/${user}`,
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

function keepExisting(reason) {
  if (fs.existsSync(target)) {
    const age = JSON.parse(fs.readFileSync(target, "utf8")).syncedAt;
    console.log(`GitHub sync skipped (${reason}); keeping snapshot from ${age}`);
    return;
  }
  // Nothing to fall back on: write an empty snapshot so the app renders its
  // offline state rather than 404ing on the fetch.
  fs.writeFileSync(target, JSON.stringify({ syncedAt: null, profile: null, repos: [], languages: [] }, null, 2));
  console.log(`GitHub sync failed (${reason}); wrote an empty snapshot`);
}

async function get(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) throw new Error(`${path} responded ${response.status}`);
  return response.json();
}

try {
  const [profile, repos] = await Promise.all([
    get(`/users/${user}`),
    get(`/users/${user}/repos?per_page=100&sort=pushed`),
  ]);

  const owned = repos
    .filter((repo) => !repo.fork && !repo.archived && !repo.private)
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      pushedAt: repo.pushed_at,
      homepage: repo.homepage || null,
      url: repo.html_url,
      topics: repo.topics || [],
    }));

  const counts = new Map();
  for (const repo of owned) {
    if (!repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) || 0) + 1);
  }

  const snapshot = {
    syncedAt: new Date().toISOString(),
    profile: {
      login: profile.login,
      name: profile.name,
      bio: profile.bio,
      location: profile.location,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      createdAt: profile.created_at,
      url: profile.html_url,
      blog: profile.blog || null,
    },
    repos: owned,
    languages: [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  };

  fs.writeFileSync(target, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`GitHub snapshot written: ${owned.length} repositories, ${snapshot.languages.length} languages`);
} catch (error) {
  keepExisting(error.message);
}
