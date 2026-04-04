import { reference, type SchemaContext } from "astro:content";
import { z } from "astro/zod";

import { SUPPORTED_LOCALES } from "./locale";

const localeSchema = z.enum(SUPPORTED_LOCALES);
const translationKeySchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const urlSchema = z.string().url();

function removeDupsAndLowerCase(array: string[]) {
  if (!array.length) return array;
  const lowercaseItems = array.map((str) => str.toLowerCase());
  const distinctItems = new Set(lowercaseItems);
  return Array.from(distinctItems);
}

function hasOrderedDates({ startDate, endDate }: { startDate: Date; endDate?: Date | undefined }) {
  return !endDate || endDate >= startDate;
}

const cvProfileSchema = z
  .object({
    label: z.string().min(1),
    href: urlSchema,
  })
  .strict();

const skillGroupSchema = z
  .object({
    name: z.string().min(1),
    items: z.array(z.string().min(1)).default([]),
  })
  .strict();

const languageSchema = z
  .object({
    name: z.string().min(1),
    code: localeSchema.optional(),
    level: z.string().min(1).optional(),
  })
  .strict();

const experienceDetailItemSchema = z
  .object({
    title: z.string().min(1),
    summary: z.string().min(1).optional(),
    achievements: z.array(z.string().min(1)).default([]),
    technologies: z.array(z.string().min(1)).default([]),
  })
  .strict();

const experienceDetailGroupSchema = z
  .object({
    title: z.string().min(1),
    summary: z.string().min(1).optional(),
    achievements: z.array(z.string().min(1)).default([]),
    items: z.array(experienceDetailItemSchema).default([]),
    technologies: z.array(z.string().min(1)).default([]),
  })
  .strict();

const timelineBaseSchema = z
  .object({
    locale: localeSchema,
    translationKey: translationKeySchema,
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  })
  .strict()
  .refine(hasOrderedDates, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

const projectLinksSchema = z
  .object({
    live: urlSchema.optional(),
    demo: urlSchema.optional(),
    repo: urlSchema.optional(),
    docs: urlSchema.optional(),
  })
  .strict()
  .default({});

const projectMetricSchema = z
  .object({
    label: z.string().min(1),
    value: z.string().min(1),
  })
  .strict();

const coverImageSchema = ({ image }: SchemaContext) =>
  z
    .object({
      src: image(),
      alt: z.string().min(1),
    })
    .strict();

export const postSchema = ({ image }: SchemaContext) =>
  z
    .object({
      title: z.string().max(65),
      description: z.string().min(50).max(160),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      coverImage: coverImageSchema({ image }).optional(),
      draft: z.boolean().default(false),
      tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
      ogImage: z.string().optional(),
    })
    .strict();

export const cvSchema = z
  .object({
    locale: localeSchema,
    basics: z
      .object({
        name: z.string().min(1),
        headline: z.string().min(1),
        summary: z.string().min(1),
        location: z.string().min(1).optional(),
        email: z.string().email().optional(),
        website: urlSchema.optional(),
        profiles: z.array(cvProfileSchema).default([]),
      })
      .strict(),
    focusAreas: z.array(z.string().min(1)).default([]),
    availability: z
      .object({
        status: z.enum(["open", "selective", "closed"]).default("selective"),
        details: z.string().min(1).optional(),
      })
      .strict()
      .default({ status: "selective" }),
    skillGroups: z.array(skillGroupSchema).default([]),
    languages: z.array(languageSchema).default([]),
    experience: z.array(reference("experience")).default([]),
    education: z.array(reference("education")).default([]),
    featuredProjects: z.array(reference("project")).default([]),
  })
  .strict();

export const experienceSchema = timelineBaseSchema.extend({
  company: z.string().min(1),
  companyUrl: urlSchema.optional(),
  role: z.string().min(1),
  employmentType: z.enum(["full-time", "part-time", "contract", "freelance", "founder"]).optional(),
  location: z.string().min(1).optional(),
  remote: z.boolean().default(false),
  summary: z.string().min(1),
  achievements: z.array(z.string().min(1)).default([]),
  detailGroups: z.array(experienceDetailGroupSchema).default([]),
  technologies: z.array(z.string().min(1)).default([]),
});

export const educationSchema = timelineBaseSchema.extend({
  institution: z.string().min(1),
  institutionUrl: urlSchema.optional(),
  degree: z.string().min(1),
  field: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  achievements: z.array(z.string().min(1)).default([]),
});

export const projectSchema = ({ image }: SchemaContext) =>
  z
    .object({
      locale: localeSchema,
      translationKey: translationKeySchema,
      title: z.string().min(1).max(80),
      description: z.string().min(40).max(220),
      kind: z.enum(["saas", "open-source", "product", "content", "personal", "client"]),
      status: z.enum(["live", "active", "maintained", "paused", "archived", "concept"]).default("active"),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      role: z.string().min(1).optional(),
      client: z.string().min(1).optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      updatedDate: z.coerce.date().optional(),
      technologies: z.array(z.string().min(1)).default([]),
      highlights: z.array(z.string().min(1)).default([]),
      metrics: z.array(projectMetricSchema).default([]),
      links: projectLinksSchema,
      coverImage: coverImageSchema({ image }).optional(),
      relatedExperience: z.array(reference("experience")).default([]),
      ogImage: z.string().optional(),
    })
    .strict()
    .refine(
      ({ startDate, endDate }) => {
        if (!startDate || !endDate) return true;
        return endDate >= startDate;
      },
      {
        message: "endDate must be on or after startDate",
        path: ["endDate"],
      },
    );
