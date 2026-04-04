import type { CollectionEntry } from "astro:content";
import { getCollection, getEntry } from "astro:content";

import { DEFAULT_LOCALE, type SiteLocale } from "./locale";

const FIRST_PARTY_PROJECT_KINDS = new Set<CollectionEntry<"project">["data"]["kind"]>(["saas", "product", "personal"]);

function sortProjectsByDate(projects: Array<CollectionEntry<"project">>) {
  return [...projects].sort((a, b) => {
    const aDate = (a.data.updatedDate ?? a.data.endDate ?? a.data.startDate ?? new Date(0)).valueOf();
    const bDate = (b.data.updatedDate ?? b.data.endDate ?? b.data.startDate ?? new Date(0)).valueOf();
    return bDate - aDate;
  });
}

function sortTimelineByDate<T extends CollectionEntry<"experience"> | CollectionEntry<"education">>(
  entries: Array<T>,
) {
  return [...entries].sort((a, b) => {
    const aEnd = (a.data.endDate ?? new Date()).valueOf();
    const bEnd = (b.data.endDate ?? new Date()).valueOf();

    if (aEnd !== bEnd) return bEnd - aEnd;

    return b.data.startDate.valueOf() - a.data.startDate.valueOf();
  });
}

export async function getCv(locale: SiteLocale = DEFAULT_LOCALE) {
  const cv = await getEntry("cv", locale);

  if (!cv) {
    throw new Error(`Missing CV entry for locale "${locale}".`);
  }

  return cv;
}

export async function getProjects(locale: SiteLocale = DEFAULT_LOCALE) {
  const projects = await getCollection("project", ({ data }) => data.locale === locale && data.draft !== true);
  return sortProjectsByDate(projects);
}

export async function getFeaturedProjects(locale: SiteLocale = DEFAULT_LOCALE) {
  return (await getProjects(locale)).filter(({ data }) => data.featured);
}

export async function getFeaturedProductProjects(locale: SiteLocale = DEFAULT_LOCALE) {
  return (await getProjects(locale)).filter(({ data }) => data.featured && FIRST_PARTY_PROJECT_KINDS.has(data.kind));
}

async function resolveProjectReferences(references: CollectionEntry<"cv">["data"]["featuredProjects"]) {
  const projects = await Promise.all(references.map((reference) => getEntry(reference)));
  return projects.filter((project): project is CollectionEntry<"project"> => Boolean(project));
}

export async function getCvFeaturedProjectsFromEntry(cv: CollectionEntry<"cv">) {
  const projects = await resolveProjectReferences(cv.data.featuredProjects);
  return projects.length > 0 ? projects : getFeaturedProjects(cv.data.locale);
}

export async function getCvFeaturedProjects(locale: SiteLocale = DEFAULT_LOCALE) {
  return getCvFeaturedProjectsFromEntry(await getCv(locale));
}

export async function getClientProjects(locale: SiteLocale = DEFAULT_LOCALE) {
  return (await getProjects(locale)).filter(({ data }) => data.kind === "client");
}

export async function getFeaturedOpenSourceProjects(locale: SiteLocale = DEFAULT_LOCALE) {
  return (await getProjects(locale)).filter(({ data }) => data.kind === "open-source" && data.featured);
}

export async function getCvOpenSourceProjectsFromEntry(cv: CollectionEntry<"cv">) {
  const projects = await resolveProjectReferences(cv.data.openSourceProjects ?? []);
  return projects.length > 0 ? projects : getFeaturedOpenSourceProjects(cv.data.locale);
}

export async function getCvOpenSourceProjects(locale: SiteLocale = DEFAULT_LOCALE) {
  return getCvOpenSourceProjectsFromEntry(await getCv(locale));
}

export async function getExperiences(locale: SiteLocale = DEFAULT_LOCALE) {
  const experiences = await getCollection("experience", ({ data }) => data.locale === locale && data.draft !== true);
  return sortTimelineByDate(experiences);
}

export async function getEducation(locale: SiteLocale = DEFAULT_LOCALE) {
  const educationEntries = await getCollection(
    "education",
    ({ data }) => data.locale === locale && data.draft !== true,
  );
  return sortTimelineByDate(educationEntries);
}

export function getProjectPrimaryLink(project: CollectionEntry<"project">) {
  return project.data.links.live ?? project.data.links.demo ?? project.data.links.repo ?? project.data.links.docs;
}
