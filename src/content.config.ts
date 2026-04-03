import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { cvSchema, educationSchema, experienceSchema, postSchema, projectSchema } from "./content/schemas";

const post = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/post" }),
  schema: postSchema,
});

const cv = defineCollection({
  loader: glob({ pattern: "[^_]*.{json,yaml,yml}", base: "./src/content/cv" }),
  schema: cvSchema,
});

const experience = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{json,yaml,yml}", base: "./src/content/experience" }),
  schema: experienceSchema,
});

const education = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{json,yaml,yml}", base: "./src/content/education" }),
  schema: educationSchema,
});

const project = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/project" }),
  schema: projectSchema,
});

export const collections = { post, cv, experience, education, project };
