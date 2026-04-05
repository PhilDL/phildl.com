import type { ComponentType, SVGProps } from "react";

import AnsibleLogo from "@thesvg/react/ansible";
import AstroLogo from "@thesvg/react/astro";
import CloudflareLogo from "@thesvg/react/cloudflare";
import CloudflareWorkersLogo from "@thesvg/react/cloudflare-workers";
import ConvexLogo from "@thesvg/react/convex";
import DockerLogo from "@thesvg/react/docker";
import DrizzleOrmLogo from "@thesvg/react/drizzle-orm";
import ExpoLogo from "@thesvg/react/expo";
import FastapiLogo from "@thesvg/react/fastapi";
import FlydotioLogo from "@thesvg/react/flydotio";
import GhostLogo from "@thesvg/react/ghost";
import GithubLogo from "@thesvg/react/github";
import GitlabLogo from "@thesvg/react/gitlab";
import HonoLogo from "@thesvg/react/hono";
import InngestLogo from "@thesvg/react/inngest";
import JavascriptLogo from "@thesvg/react/javascript";
import JwtLogo from "@thesvg/react/jwt";
import LaravelLogo from "@thesvg/react/laravel";
import OdooLogo from "@thesvg/react/odoo";
import OpenapiInitiativeLogo from "@thesvg/react/openapi-initiative";
import OpencvLogo from "@thesvg/react/opencv";
import PnpmLogo from "@thesvg/react/pnpm";
import PosthogLogo from "@thesvg/react/posthog";
import PrestashopLogo from "@thesvg/react/prestashop";
import PrismaLogo from "@thesvg/react/prisma";
import PhpLogo from "@thesvg/react/php";
import PythonLogo from "@thesvg/react/python";
import ReactRouterLogo from "@thesvg/react/react-router";
import ReactLogo from "@thesvg/react/react";
import RemixLogo from "@thesvg/react/remix";
import RevenuecatLogo from "@thesvg/react/revenuecat";
import SanityLogo from "@thesvg/react/sanity";
import SentryLogo from "@thesvg/react/sentry";
import SstLogo from "@thesvg/react/sst";
import StripeLogo from "@thesvg/react/stripe";
import ThreedotjsLogo from "@thesvg/react/threedotjs";
import TurborepoLogo from "@thesvg/react/turborepo";
import TursoLogo from "@thesvg/react/turso";
import TypescriptLogo from "@thesvg/react/typescript";
import VuedotjsLogo from "@thesvg/react/vuedotjs";
import ZodLogo from "@thesvg/react/zod";
import { NextjsLogo, NodejsLogo, PostgresqlLogo } from "../components/technologyLogos";

type TechnologyLogo = ComponentType<SVGProps<SVGSVGElement>>;

export type TechnologyDefinition = {
  key: string;
  label: string;
  logo?: TechnologyLogo;
};

type TechnologyRegistryEntry = TechnologyDefinition & {
  aliases?: readonly string[];
};

const technologyEntries = [
  { key: "ansible", label: "Ansible", logo: AnsibleLogo },
  { key: "astro", label: "Astro", logo: AstroLogo },
  {
    key: "cloudflare",
    label: "Cloudflare",
    logo: CloudflareLogo,
    aliases: ["Cloudflare R2", "Cloudflare D1"],
  },
  { key: "cloudflare-workers", label: "Cloudflare Workers", logo: CloudflareWorkersLogo },
  { key: "convex", label: "Convex", logo: ConvexLogo },
  { key: "docker", label: "Docker", logo: DockerLogo },
  { key: "drizzle-orm", label: "Drizzle ORM", logo: DrizzleOrmLogo, aliases: ["Drizzle"] },
  { key: "expo", label: "Expo", logo: ExpoLogo },
  { key: "fastapi", label: "FastAPI", logo: FastapiLogo },
  { key: "flydotio", label: "Fly.io", logo: FlydotioLogo, aliases: ["Fly.io"] },
  {
    key: "ghost",
    label: "Ghost",
    logo: GhostLogo,
    aliases: ["Ghost Admin API", "Ghost Content API"],
  },
  { key: "github", label: "GitHub", logo: GithubLogo, aliases: ["GitHub actions", "GitHub Actions"] },
  { key: "gitlab", label: "GitLab", logo: GitlabLogo },
  { key: "hono", label: "Hono", logo: HonoLogo },
  { key: "inngest", label: "Inngest", logo: InngestLogo },
  { key: "javascript", label: "JavaScript", logo: JavascriptLogo, aliases: ["JavaScript / OWL"] },
  { key: "jwt", label: "JWT", logo: JwtLogo },
  { key: "laravel", label: "Laravel", logo: LaravelLogo },
  { key: "nextdotjs", label: "Next.js", logo: NextjsLogo, aliases: ["NextJS"] },
  { key: "nodedotjs", label: "Node.js", logo: NodejsLogo, aliases: ["NodeJS", "NodeJS (Fullstack RR / Hono)"] },
  { key: "odoo", label: "Odoo", logo: OdooLogo },
  { key: "openapi-initiative", label: "OpenAPI", logo: OpenapiInitiativeLogo, aliases: ["REST APIs (OpenAPI)"] },
  { key: "opencv", label: "OpenCV", logo: OpencvLogo },
  { key: "pnpm", label: "pnpm", logo: PnpmLogo },
  { key: "posthog", label: "PostHog", logo: PosthogLogo },
  { key: "postgresql", label: "PostgreSQL", logo: PostgresqlLogo },
  { key: "prestashop", label: "PrestaShop", logo: PrestashopLogo, aliases: ["Prestashop"] },
  { key: "prisma", label: "Prisma", logo: PrismaLogo },
  { key: "php", label: "PHP", logo: PhpLogo },
  {
    key: "python",
    label: "Python",
    logo: PythonLogo,
    aliases: ["Python (Odoo / Werkzeug / FastAPI)"],
  },
  { key: "react", label: "React", logo: ReactLogo, aliases: ["React 19"] },
  { key: "react-native", label: "React Native", logo: ReactLogo },
  { key: "react-router", label: "React Router", logo: ReactRouterLogo },
  { key: "remix", label: "Remix", logo: RemixLogo },
  { key: "revenuecat", label: "RevenueCat", logo: RevenuecatLogo },
  { key: "sanity", label: "Sanity", logo: SanityLogo, aliases: ["Sanity CMS"] },
  { key: "sentry", label: "Sentry", logo: SentryLogo },
  { key: "sst", label: "SST", logo: SstLogo },
  { key: "stripe", label: "Stripe", logo: StripeLogo, aliases: ["Stripe Connect"] },
  { key: "threedotjs", label: "Three.js", logo: ThreedotjsLogo, aliases: ["Three.js"] },
  { key: "turborepo", label: "Turborepo", logo: TurborepoLogo },
  {
    key: "turso",
    label: "Turso",
    logo: TursoLogo,
    aliases: ["Turso + embedded replicas", "Turso (one DB per tenant + embedded replicas)"],
  },
  { key: "typescript", label: "TypeScript", logo: TypescriptLogo },
  { key: "vuedotjs", label: "Vue.js", logo: VuedotjsLogo, aliases: ["Vue.js"] },
  { key: "zod", label: "Zod", logo: ZodLogo },
] satisfies readonly TechnologyRegistryEntry[];

export const technologyRegistry = Object.fromEntries(
  technologyEntries.map(({ aliases: _aliases, ...technology }) => [technology.key, technology]),
) as Record<string, TechnologyDefinition>;

const technologyAliases = new Map<string, string>();

for (const technology of technologyEntries) {
  const aliases = [technology.key, technology.label, ...(technology.aliases ?? [])];

  for (const alias of aliases) {
    technologyAliases.set(normalizeTechnologyInput(alias), technology.key);
  }
}

function normalizeTechnologyInput(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function resolveTechnology(value: string): TechnologyDefinition | null {
  const technologyKey = technologyAliases.get(normalizeTechnologyInput(value));
  return technologyKey ? (technologyRegistry[technologyKey] ?? null) : null;
}
