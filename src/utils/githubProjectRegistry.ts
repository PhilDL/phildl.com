import type { CollectionEntry } from "astro:content";

import type { GithubRecentRepository } from "@/utils/githubActivity";

const githubProjectRegistry: Record<string, Array<string>> = {
  manywalls: ["manywalls"],
  atoly: ["atoly"],
  paintinglens: ["paintinglens"],
  "ts-ghost": ["ts-ghost"],
  "remix-gospel-stack": ["remix-gospel-stack"],
};

export type WorkingOnProject = {
  title: string;
  description: string | null;
  href: string;
  repositoryName: string;
  lastPushedAt: string;
};

export function buildWorkingOnProjects(
  recentRepositories: Array<GithubRecentRepository>,
  localizedProjects: Array<CollectionEntry<"project">>,
) {
  const projectLookup = buildProjectLookup(localizedProjects);

  return recentRepositories.map((repository) => {
    const matchedProject =
      projectLookup.get(normalizeRepositoryKey(repository.nameWithOwner)) ??
      projectLookup.get(normalizeRepositoryKey(repository.name));

    return {
      title: matchedProject?.data.title ?? repository.name,
      description: matchedProject?.data.description ?? repository.description,
      href: repository.url,
      repositoryName: repository.nameWithOwner,
      lastPushedAt: repository.lastPushedAt,
    };
  });
}

function buildProjectLookup(localizedProjects: Array<CollectionEntry<"project">>) {
  const lookup = new Map<string, CollectionEntry<"project">>();

  for (const project of localizedProjects) {
    for (const key of collectProjectKeys(project)) {
      if (!lookup.has(key)) {
        lookup.set(key, project);
      }
    }
  }

  return lookup;
}

function collectProjectKeys(project: CollectionEntry<"project">) {
  const keys = new Set<string>();

  addProjectKey(keys, project.data.translationKey);
  addProjectKey(keys, project.data.title);

  if (project.data.links.repo) {
    addProjectKey(keys, extractRepositoryName(project.data.links.repo));
    addProjectKey(keys, extractRepositoryNameWithOwner(project.data.links.repo));
  }

  for (const alias of githubProjectRegistry[project.data.translationKey] ?? []) {
    addProjectKey(keys, alias);
  }

  return keys;
}

function addProjectKey(keys: Set<string>, value: string | null | undefined) {
  if (!value) return;

  const normalizedValue = normalizeRepositoryKey(value);

  if (normalizedValue) {
    keys.add(normalizedValue);
  }
}

function extractRepositoryName(value: string) {
  const repositoryNameWithOwner = extractRepositoryNameWithOwner(value);
  return repositoryNameWithOwner?.split("/").at(-1) ?? null;
}

function extractRepositoryNameWithOwner(value: string) {
  try {
    const url = new URL(value);

    if (url.hostname !== "github.com") {
      return null;
    }

    const [owner, repository] = url.pathname.split("/").filter(Boolean);

    if (!owner || !repository) {
      return null;
    }

    return `${owner}/${repository}`;
  } catch {
    return null;
  }
}

function normalizeRepositoryKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\.git$/, "")
    .replace(/[^a-z0-9/]+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^-+|-+$/g, "");
}
