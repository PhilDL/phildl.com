import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_GITHUB_USERNAME = "PhilDL";
const RECENT_ACTIVITY_WINDOW_DAYS = 30;
const MAX_RECENT_REPOSITORIES = 6;
const USER_AGENT = "phildl.com-github-activity-refresh";
const GITHUB_CONTRIBUTION_LEVEL_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const username = process.env.GITHUB_ACTIVITY_USERNAME ?? DEFAULT_GITHUB_USERNAME;
  const now = new Date();

  const [contributionCalendar, recentRepositories] = await Promise.all([
    fetchContributionCalendar(username, now),
    fetchRecentRepositories(username, now),
  ]);

  const snapshot = {
    generatedAt: now.toISOString(),
    username,
    contributionCalendar,
    recentRepositories,
  };

  const outputUrl = new URL("../src/data/github-activity.json", import.meta.url);
  await mkdir(dirname(fileURLToPath(outputUrl)), { recursive: true });
  await writeFile(outputUrl, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  console.log(`Updated GitHub activity snapshot for ${username}.`);
}

async function fetchContributionCalendar(username, now) {
  const response = await fetch(`https://github.com/users/${username}/contributions`, {
    headers: {
      "User-Agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch contribution calendar: ${response.status} ${response.statusText}`);
  }

  const markup = await response.text();
  const days = extractContributionDays(markup);

  if (!days.length) {
    throw new Error(`Unable to parse contribution calendar for ${username}.`);
  }

  return buildContributionCalendar(days);
}

async function fetchRecentRepositories(username, now) {
  const eventsResponse = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": USER_AGENT,
    },
  });

  if (!eventsResponse.ok) {
    throw new Error(`Failed to fetch public events: ${eventsResponse.status} ${eventsResponse.statusText}`);
  }

  const events = await eventsResponse.json();
  const cutoff = addUtcDays(startOfUtcDay(now), -(RECENT_ACTIVITY_WINDOW_DAYS - 1)).valueOf();
  const latestPushByRepository = new Map();

  for (const event of events) {
    if (event.type !== "PushEvent") continue;

    const repositoryNameWithOwner = event.repo?.name;
    const lastPushedAt = event.created_at;

    if (!repositoryNameWithOwner || !lastPushedAt) continue;
    if (Date.parse(lastPushedAt) < cutoff) continue;
    if (latestPushByRepository.has(repositoryNameWithOwner)) continue;

    latestPushByRepository.set(repositoryNameWithOwner, lastPushedAt);

    if (latestPushByRepository.size >= MAX_RECENT_REPOSITORIES) {
      break;
    }
  }

  const repositories = await Promise.all(
    Array.from(latestPushByRepository.entries()).map(([nameWithOwner, lastPushedAt]) =>
      fetchRepositoryDetails(nameWithOwner, lastPushedAt),
    ),
  );

  return repositories.filter(Boolean);
}

async function fetchRepositoryDetails(nameWithOwner, lastPushedAt) {
  const response = await fetch(`https://api.github.com/repos/${nameWithOwner}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    const fallbackName = nameWithOwner.split("/").at(-1) ?? nameWithOwner;

    return {
      name: fallbackName,
      nameWithOwner,
      url: `https://github.com/${nameWithOwner}`,
      description: null,
      lastPushedAt,
    };
  }

  const repository = await response.json();

  return {
    name: repository.name,
    nameWithOwner: repository.full_name,
    url: repository.html_url,
    description: repository.description,
    lastPushedAt,
  };
}

function extractContributionDays(markup) {
  const tooltipById = new Map(
    Array.from(markup.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]+)<\/tool-tip>/g)).map((match) => [
      match[1],
      match[2].trim(),
    ]),
  );

  const dayTags = markup.match(/<td\b[^>]*class="ContributionCalendar-day"[^>]*><\/td>/g) ?? [];

  return dayTags
    .map((tag) => {
      const elementId = extractAttribute(tag, "id");
      const date = extractAttribute(tag, "data-date");
      const levelValue = extractAttribute(tag, "data-level");
      const level = Number(levelValue);
      const tooltip = tooltipById.get(elementId) ?? "";

      if (!elementId || !date || Number.isNaN(level)) return null;

      return {
        date,
        contributionCount: extractContributionCountFromTooltip(tooltip),
        color: GITHUB_CONTRIBUTION_LEVEL_COLORS[level] ?? GITHUB_CONTRIBUTION_LEVEL_COLORS[0],
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.date.localeCompare(right.date));
}

function buildContributionCalendar(days) {
  const byDate = new Map(days.map((day) => [day.date, day]));
  const firstDate = parseIsoDate(days[0].date);
  const lastDate = parseIsoDate(days.at(-1).date);
  const zeroContributionColor = GITHUB_CONTRIBUTION_LEVEL_COLORS[0];

  const weeks = [];
  let currentWeek = [];

  for (
    let cursor = startOfUtcWeek(firstDate);
    cursor.valueOf() <= endOfUtcWeek(lastDate).valueOf();
    cursor = addUtcDays(cursor, 1)
  ) {
    const date = formatIsoDate(cursor);
    const existingDay = byDate.get(date);

    currentWeek.push({
      date,
      contributionCount: existingDay?.contributionCount ?? 0,
      color: existingDay?.color ?? zeroContributionColor,
      weekday: cursor.getUTCDay(),
    });

    if (currentWeek.length === 7) {
      weeks.push({
        firstDay: currentWeek[0].date,
        days: currentWeek,
      });
      currentWeek = [];
    }
  }

  return {
    totalContributions: days.reduce((total, day) => total + day.contributionCount, 0),
    weeks,
  };
}

function extractContributionCountFromTooltip(tooltip) {
  const countMatch = tooltip.match(/([\d,]+)\s+contribution/);
  return countMatch ? Number(countMatch[1].replaceAll(",", "")) : 0;
}

function extractAttribute(tag, attribute) {
  const match = tag.match(new RegExp(`${attribute}="([^"]+)"`));
  return match?.[1] ?? null;
}

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfUtcWeek(date) {
  return addUtcDays(startOfUtcDay(date), -startOfUtcDay(date).getUTCDay());
}

function endOfUtcWeek(date) {
  return addUtcDays(startOfUtcWeek(date), 6);
}

function addUtcDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function parseIsoDate(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}
