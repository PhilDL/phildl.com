import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export type GithubContributionDay = {
  date: string;
  contributionCount: number;
  color: string;
  weekday: number;
};

export type GithubContributionWeek = {
  firstDay: string;
  days: Array<GithubContributionDay>;
};

export type GithubContributionCalendar = {
  totalContributions: number;
  weeks: Array<GithubContributionWeek>;
};

export type GithubRecentRepository = {
  name: string;
  nameWithOwner: string;
  url: string;
  description: string | null;
  lastPushedAt: string;
};

export type GithubActivitySnapshot = {
  generatedAt: string | null;
  username: string;
  contributionCalendar: GithubContributionCalendar | null;
  recentRepositories: Array<GithubRecentRepository>;
};

export const GITHUB_ACTIVITY_RECENT_WINDOW_DAYS = 30;

const EMPTY_GITHUB_ACTIVITY_SNAPSHOT: GithubActivitySnapshot = {
  generatedAt: null,
  username: "PhilDL",
  contributionCalendar: null,
  recentRepositories: [],
};

let githubActivityPromise: Promise<GithubActivitySnapshot> | undefined;

export async function getGithubActivity() {
  if (!githubActivityPromise) {
    githubActivityPromise = readGithubActivitySnapshot();
  }

  return githubActivityPromise;
}

async function readGithubActivitySnapshot() {
  try {
    const snapshotFile = await readFile(resolve(process.cwd(), "src/data/github-activity.json"), "utf8");
    const parsedSnapshot = JSON.parse(snapshotFile);

    if (!isGithubActivitySnapshot(parsedSnapshot)) {
      throw new Error("Invalid GitHub activity snapshot shape.");
    }

    return parsedSnapshot;
  } catch (error) {
    console.warn("Falling back to empty GitHub activity snapshot.", error);
    return EMPTY_GITHUB_ACTIVITY_SNAPSHOT;
  }
}

function isGithubActivitySnapshot(value: unknown): value is GithubActivitySnapshot {
  if (!isRecord(value)) return false;
  if (!(typeof value.generatedAt === "string" || value.generatedAt === null)) return false;
  if (typeof value.username !== "string") return false;
  if (!(value.contributionCalendar === null || isContributionCalendar(value.contributionCalendar))) return false;
  if (!Array.isArray(value.recentRepositories)) return false;

  return value.recentRepositories.every(isRecentRepository);
}

function isContributionCalendar(value: unknown): value is GithubContributionCalendar {
  if (!isRecord(value)) return false;
  if (typeof value.totalContributions !== "number" || !Array.isArray(value.weeks)) {
    return false;
  }
  return value.weeks.every(isContributionWeek);
}

function isContributionWeek(value: unknown): value is GithubContributionWeek {
  if (!isRecord(value)) return false;
  if (typeof value.firstDay !== "string" || !Array.isArray(value.days)) return false;
  return value.days.every(isContributionDay);
}

function isContributionDay(value: unknown): value is GithubContributionDay {
  if (!isRecord(value)) return false;

  return (
    typeof value.date === "string" &&
    typeof value.contributionCount === "number" &&
    typeof value.color === "string" &&
    typeof value.weekday === "number"
  );
}

function isRecentRepository(value: unknown): value is GithubRecentRepository {
  if (!isRecord(value)) return false;

  return (
    typeof value.name === "string" &&
    typeof value.nameWithOwner === "string" &&
    typeof value.url === "string" &&
    (typeof value.description === "string" || value.description === null) &&
    typeof value.lastPushedAt === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
