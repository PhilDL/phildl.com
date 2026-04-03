import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CollectionEntry } from "astro:content";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, type PDFFont, type PDFImage, type PDFPage, rgb } from "pdf-lib";

import SpaceGroteskBold from "@/assets/SpaceGrotesk-Bold.ttf";
import SpaceGroteskRegular from "@/assets/SpaceGrotesk-Regular.ttf";
import SpaceGroteskSemiBold from "@/assets/SpaceGrotesk-SemiBold.ttf";
import type { SiteLocale } from "@/content/locale";
import { getProjectPrimaryLink } from "@/content/queries";
import { aboutPageCopy, localeInfo } from "@/i18n/utils";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 48;
const MARGIN_TOP = 48;
const MARGIN_BOTTOM = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const ACCENT = rgb(0.988, 0.298, 0.298);
const TEXT = rgb(0.11, 0.122, 0.129);
const MUTED = rgb(0.396, 0.435, 0.482);
const BORDER = rgb(0.89, 0.902, 0.922);

type CvPdfInput = {
  locale: SiteLocale;
  cv: CollectionEntry<"cv">;
  experiences: Array<CollectionEntry<"experience">>;
  education: Array<CollectionEntry<"education">>;
  featuredProjects: Array<CollectionEntry<"project">>;
};

type PdfAssets = {
  regular: PDFFont;
  semiBold: PDFFont;
  bold: PDFFont;
  profileImage: PDFImage;
};

type DrawContext = {
  page: PDFPage;
  pages: Array<PDFPage>;
  cursorY: number;
  assets: PdfAssets;
  locale: SiteLocale;
  copy: (typeof aboutPageCopy)[SiteLocale];
};

type TextBlock = {
  lines: string[];
  font: PDFFont;
  size: number;
  color?: ReturnType<typeof rgb>;
  lineHeight?: number;
};

type HeaderLine = {
  label: string;
  value: string;
};

const pdfCopy = {
  en: {
    page: "Page",
  },
  fr: {
    page: "Page",
  },
} satisfies Record<SiteLocale, { page: string }>;

function getLineHeight(size: number, multiplier = 1.42) {
  return size * multiplier;
}

function sum(array: number[]) {
  return array.reduce((total, value) => total + value, 0);
}

function stripProtocol(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function createPage(doc: PDFDocument) {
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  page.drawRectangle({
    x: MARGIN_X,
    y: PAGE_HEIGHT - 18,
    width: CONTENT_WIDTH,
    height: 3,
    color: ACCENT,
  });

  return page;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  if (!text.trim()) return [""];

  const lines: string[] = [];
  const paragraphs = text.split(/\n+/);

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);

    if (!words.length) {
      lines.push("");
      continue;
    }

    let currentLine = words[0] ?? "";

    for (const word of words.slice(1)) {
      const candidate = `${currentLine} ${word}`;

      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        currentLine = candidate;
        continue;
      }

      lines.push(currentLine);
      currentLine = word;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

function wrapBullet(text: string, font: PDFFont, size: number, maxWidth: number, bulletWidth: number) {
  const lines = wrapText(text, font, size, maxWidth - bulletWidth);
  return lines.map((line, index) => `${index === 0 ? "• " : "  "}${line}`);
}

function drawTextBlock(
  page: PDFPage,
  x: number,
  startY: number,
  { lines, font, size, color = TEXT, lineHeight = getLineHeight(size) }: TextBlock,
) {
  let y = startY;

  for (const line of lines) {
    page.drawText(line, {
      x,
      y,
      font,
      size,
      color,
    });
    y -= lineHeight;
  }

  return y;
}

function estimateBlockHeight(blocks: Array<TextBlock>) {
  return sum(blocks.map(({ lines, size, lineHeight = getLineHeight(size) }) => lines.length * lineHeight));
}

function ensureSpace(ctx: DrawContext, doc: PDFDocument, minHeight: number) {
  if (ctx.cursorY - minHeight >= MARGIN_BOTTOM) {
    return;
  }

  const page = createPage(doc);
  ctx.page = page;
  ctx.pages.push(page);
  ctx.cursorY = PAGE_HEIGHT - MARGIN_TOP;
}

function drawSectionTitle(ctx: DrawContext, doc: PDFDocument, title: string) {
  ensureSpace(ctx, doc, 34);

  ctx.page.drawText(title.toUpperCase(), {
    x: MARGIN_X,
    y: ctx.cursorY,
    font: ctx.assets.semiBold,
    size: 10,
    color: ACCENT,
  });

  ctx.cursorY -= 14;

  ctx.page.drawLine({
    start: { x: MARGIN_X, y: ctx.cursorY },
    end: { x: PAGE_WIDTH - MARGIN_X, y: ctx.cursorY },
    thickness: 1,
    color: BORDER,
  });

  ctx.cursorY -= 16;
}

function formatDateRange(locale: SiteLocale, startDate: Date, endDate: Date | undefined, presentLabel: string) {
  const formatter = new Intl.DateTimeFormat(localeInfo[locale].dateLocale, {
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(startDate)} - ${endDate ? formatter.format(endDate) : presentLabel}`;
}

function formatYearRange(locale: SiteLocale, startDate: Date, endDate: Date | undefined, presentLabel: string) {
  const formatter = new Intl.DateTimeFormat(localeInfo[locale].dateLocale, {
    year: "numeric",
  });

  return `${formatter.format(startDate)} - ${endDate ? formatter.format(endDate) : presentLabel}`;
}

function getHeaderLines(input: CvPdfInput, copy: (typeof aboutPageCopy)[SiteLocale]) {
  const lines: HeaderLine[] = [];

  if (input.cv.data.basics.location) {
    lines.push({
      label: copy.locationPrefix,
      value: input.cv.data.basics.location,
    });
  }

  if (input.cv.data.availability.details) {
    lines.push({
      label: copy.availabilityLabel,
      value: input.cv.data.availability.details,
    });
  }

  if (input.cv.data.basics.website) {
    lines.push({
      label: copy.websiteLabel,
      value: stripProtocol(input.cv.data.basics.website),
    });
  }

  if (input.cv.data.basics.email) {
    lines.push({
      label: copy.emailLabel,
      value: input.cv.data.basics.email,
    });
  }

  for (const profile of input.cv.data.basics.profiles) {
    lines.push({
      label: profile.label,
      value: stripProtocol(profile.href),
    });
  }

  return lines;
}

function estimateHeaderHeight(input: CvPdfInput, assets: PdfAssets, copy: (typeof aboutPageCopy)[SiteLocale]) {
  const summaryLines = wrapText(input.cv.data.basics.summary, assets.regular, 10.5, CONTENT_WIDTH - 140);
  const headerLines = getHeaderLines(input, copy);
  const headerBlocks: Array<TextBlock> = [
    {
      lines: [input.cv.data.basics.name],
      font: assets.bold,
      size: 24,
    },
    {
      lines: [input.cv.data.basics.headline],
      font: assets.semiBold,
      size: 12,
      color: ACCENT,
      lineHeight: 16,
    },
    {
      lines: summaryLines,
      font: assets.regular,
      size: 10.5,
      lineHeight: 15,
    },
    ...headerLines.map(({ label, value }) => ({
      lines: wrapText(`${label}: ${value}`, assets.regular, 9.5, CONTENT_WIDTH - 140),
      font: assets.regular,
      size: 9.5,
      color: MUTED,
      lineHeight: 13,
    })),
  ];

  return Math.max(118, estimateBlockHeight(headerBlocks)) + 12;
}

function drawHeader(ctx: DrawContext, doc: PDFDocument, input: CvPdfInput) {
  ensureSpace(ctx, doc, estimateHeaderHeight(input, ctx.assets, ctx.copy));

  const imageSize = 104;
  const imageX = PAGE_WIDTH - MARGIN_X - imageSize;
  const imageY = ctx.cursorY - imageSize + 8;
  const textWidth = CONTENT_WIDTH - imageSize - 26;

  ctx.page.drawImage(ctx.assets.profileImage, {
    x: imageX,
    y: imageY,
    width: imageSize,
    height: imageSize,
  });

  ctx.page.drawRectangle({
    x: imageX - 6,
    y: imageY - 6,
    width: imageSize + 12,
    height: imageSize + 12,
    borderColor: BORDER,
    borderWidth: 1,
  });

  let y = ctx.cursorY;

  ctx.page.drawText(input.cv.data.basics.name, {
    x: MARGIN_X,
    y,
    font: ctx.assets.bold,
    size: 24,
    color: TEXT,
  });
  y -= 24;

  ctx.page.drawText(input.cv.data.basics.headline, {
    x: MARGIN_X,
    y,
    font: ctx.assets.semiBold,
    size: 12,
    color: ACCENT,
  });
  y -= 20;

  y = drawTextBlock(ctx.page, MARGIN_X, y, {
    lines: wrapText(input.cv.data.basics.summary, ctx.assets.regular, 10.5, textWidth),
    font: ctx.assets.regular,
    size: 10.5,
    lineHeight: 15,
  });
  y -= 4;

  for (const line of getHeaderLines(input, ctx.copy)) {
    y = drawTextBlock(ctx.page, MARGIN_X, y, {
      lines: wrapText(`${line.label}: ${line.value}`, ctx.assets.regular, 9.5, textWidth),
      font: ctx.assets.regular,
      size: 9.5,
      color: MUTED,
      lineHeight: 13,
    });
  }

  ctx.cursorY = Math.min(y, imageY - 14);
}

function estimateBulletSection(items: string[], font: PDFFont, size: number, width: number) {
  return sum(items.map((item) => wrapBullet(item, font, size, width, 10).length * getLineHeight(size, 1.36) + 4));
}

function drawBulletSection(ctx: DrawContext, doc: PDFDocument, items: string[]) {
  drawSectionTitle(ctx, doc, ctx.copy.focusAreasTitle);
  ensureSpace(ctx, doc, estimateBulletSection(items, ctx.assets.regular, 10, CONTENT_WIDTH));

  for (const item of items) {
    const lines = wrapBullet(item, ctx.assets.regular, 10, CONTENT_WIDTH, 10);
    ctx.cursorY = drawTextBlock(ctx.page, MARGIN_X, ctx.cursorY, {
      lines,
      font: ctx.assets.regular,
      size: 10,
      lineHeight: getLineHeight(10, 1.36),
    });
    ctx.cursorY -= 4;
  }
}

function estimateSkillGroupHeight(
  group: CollectionEntry<"cv">["data"]["skillGroups"][number],
  assets: PdfAssets,
  width: number,
) {
  const blocks: Array<TextBlock> = [
    {
      lines: [group.name],
      font: assets.semiBold,
      size: 10,
      color: ACCENT,
      lineHeight: 14,
    },
    {
      lines: wrapText(group.items.join(" · "), assets.regular, 9.5, width),
      font: assets.regular,
      size: 9.5,
      lineHeight: 13,
    },
  ];

  return estimateBlockHeight(blocks) + 8;
}

function drawSkillSection(ctx: DrawContext, doc: PDFDocument, skillGroups: CvPdfInput["cv"]["data"]["skillGroups"]) {
  drawSectionTitle(ctx, doc, ctx.copy.coreStackTitle);

  for (const group of skillGroups) {
    ensureSpace(ctx, doc, estimateSkillGroupHeight(group, ctx.assets, CONTENT_WIDTH));

    ctx.page.drawText(group.name, {
      x: MARGIN_X,
      y: ctx.cursorY,
      font: ctx.assets.semiBold,
      size: 10,
      color: ACCENT,
    });
    ctx.cursorY -= 14;

    ctx.cursorY = drawTextBlock(ctx.page, MARGIN_X, ctx.cursorY, {
      lines: wrapText(group.items.join(" · "), ctx.assets.regular, 9.5, CONTENT_WIDTH),
      font: ctx.assets.regular,
      size: 9.5,
      lineHeight: 13,
    });
    ctx.cursorY -= 8;
  }
}

function drawLanguagesSection(ctx: DrawContext, doc: PDFDocument, items: CvPdfInput["cv"]["data"]["languages"]) {
  drawSectionTitle(ctx, doc, ctx.copy.languagesTitle);
  const languageLines = wrapText(
    items.map((item) => `${item.name}${item.level ? ` - ${item.level}` : ""}`).join(" · "),
    ctx.assets.regular,
    10,
    CONTENT_WIDTH,
  );
  ensureSpace(ctx, doc, languageLines.length * getLineHeight(10, 1.36) + 4);

  ctx.cursorY = drawTextBlock(ctx.page, MARGIN_X, ctx.cursorY, {
    lines: languageLines,
    font: ctx.assets.regular,
    size: 10,
    lineHeight: getLineHeight(10, 1.36),
  });
  ctx.cursorY -= 4;
}

function estimateExperienceHeight(entry: CollectionEntry<"experience">, ctx: DrawContext, width: number) {
  const dateText = formatDateRange(ctx.locale, entry.data.startDate, entry.data.endDate, ctx.copy.presentLabel);
  const dateWidth = ctx.assets.regular.widthOfTextAtSize(dateText, 9);
  const roleWidth = CONTENT_WIDTH - Math.min(dateWidth + 18, 150);
  const summaryLines = wrapText(entry.data.summary, ctx.assets.regular, 9.8, width);
  const achievementHeight = sum(
    entry.data.achievements.map(
      (achievement) =>
        wrapBullet(achievement, ctx.assets.regular, 9.3, width, 10).length * getLineHeight(9.3, 1.35) + 3,
    ),
  );
  const technologiesLines =
    entry.data.technologies.length > 0
      ? wrapText(
          `${ctx.copy.technologiesLabel}: ${entry.data.technologies.join(" · ")}`,
          ctx.assets.regular,
          8.8,
          width,
        )
      : [];

  const blocks: Array<TextBlock> = [
    {
      lines: wrapText(entry.data.role, ctx.assets.semiBold, 11, roleWidth),
      font: ctx.assets.semiBold,
      size: 11,
      lineHeight: 14,
    },
    {
      lines: [entry.data.company],
      font: ctx.assets.regular,
      size: 10,
      color: ACCENT,
      lineHeight: 14,
    },
    {
      lines: [dateText],
      font: ctx.assets.regular,
      size: 9,
      color: MUTED,
      lineHeight: 12,
    },
    {
      lines: summaryLines,
      font: ctx.assets.regular,
      size: 9.8,
      lineHeight: 13.5,
    },
    {
      lines: technologiesLines,
      font: ctx.assets.regular,
      size: 8.8,
      color: MUTED,
      lineHeight: 12,
    },
  ];

  return estimateBlockHeight(blocks) + achievementHeight + 10;
}

function drawExperienceSection(ctx: DrawContext, doc: PDFDocument, experiences: CvPdfInput["experiences"]) {
  drawSectionTitle(ctx, doc, ctx.copy.experienceTitle);

  for (const entry of experiences) {
    ensureSpace(ctx, doc, estimateExperienceHeight(entry, ctx, CONTENT_WIDTH));

    const dateText = formatDateRange(ctx.locale, entry.data.startDate, entry.data.endDate, ctx.copy.presentLabel);
    const dateWidth = ctx.assets.regular.widthOfTextAtSize(dateText, 9);
    const roleWidth = CONTENT_WIDTH - Math.min(dateWidth + 18, 150);
    const roleLines = wrapText(entry.data.role, ctx.assets.semiBold, 11, roleWidth);
    const roleStartY = ctx.cursorY;

    ctx.cursorY = drawTextBlock(ctx.page, MARGIN_X, ctx.cursorY, {
      lines: roleLines,
      font: ctx.assets.semiBold,
      size: 11,
      lineHeight: 14,
    });

    ctx.page.drawText(dateText, {
      x: PAGE_WIDTH - MARGIN_X - dateWidth,
      y: roleStartY,
      font: ctx.assets.regular,
      size: 9,
      color: MUTED,
    });

    ctx.page.drawText(entry.data.company, {
      x: MARGIN_X,
      y: ctx.cursorY,
      font: ctx.assets.regular,
      size: 10,
      color: ACCENT,
    });
    ctx.cursorY -= 14;

    ctx.cursorY = drawTextBlock(ctx.page, MARGIN_X, ctx.cursorY, {
      lines: wrapText(entry.data.summary, ctx.assets.regular, 9.8, CONTENT_WIDTH),
      font: ctx.assets.regular,
      size: 9.8,
      lineHeight: 13.5,
    });
    ctx.cursorY -= 4;

    for (const achievement of entry.data.achievements) {
      ctx.cursorY = drawTextBlock(ctx.page, MARGIN_X, ctx.cursorY, {
        lines: wrapBullet(achievement, ctx.assets.regular, 9.3, CONTENT_WIDTH, 10),
        font: ctx.assets.regular,
        size: 9.3,
        lineHeight: getLineHeight(9.3, 1.35),
      });
      ctx.cursorY -= 3;
    }

    if (entry.data.technologies.length > 0) {
      ctx.cursorY = drawTextBlock(ctx.page, MARGIN_X, ctx.cursorY, {
        lines: wrapText(
          `${ctx.copy.technologiesLabel}: ${entry.data.technologies.join(" · ")}`,
          ctx.assets.regular,
          8.8,
          CONTENT_WIDTH,
        ),
        font: ctx.assets.regular,
        size: 8.8,
        color: MUTED,
        lineHeight: 12,
      });
    }

    ctx.cursorY -= 12;
  }
}

function estimateProjectHeight(entry: CollectionEntry<"project">, ctx: DrawContext, width: number) {
  const link = getProjectPrimaryLink(entry);
  const blocks: Array<TextBlock> = [
    {
      lines: [entry.data.title],
      font: ctx.assets.semiBold,
      size: 10.5,
      lineHeight: 14,
    },
    {
      lines: wrapText(entry.data.description, ctx.assets.regular, 9.5, width),
      font: ctx.assets.regular,
      size: 9.5,
      lineHeight: 13,
    },
    {
      lines: wrapText(entry.data.technologies.join(" · "), ctx.assets.regular, 8.8, width),
      font: ctx.assets.regular,
      size: 8.8,
      color: MUTED,
      lineHeight: 12,
    },
    {
      lines: link ? wrapText(stripProtocol(link), ctx.assets.regular, 8.8, width) : [],
      font: ctx.assets.regular,
      size: 8.8,
      color: MUTED,
      lineHeight: 12,
    },
  ];

  return estimateBlockHeight(blocks) + 8;
}

function drawProjectsSection(ctx: DrawContext, doc: PDFDocument, projects: CvPdfInput["featuredProjects"]) {
  drawSectionTitle(ctx, doc, ctx.copy.selectedProjectsTitle);

  for (const project of projects) {
    ensureSpace(ctx, doc, estimateProjectHeight(project, ctx, CONTENT_WIDTH));

    ctx.page.drawText(project.data.title, {
      x: MARGIN_X,
      y: ctx.cursorY,
      font: ctx.assets.semiBold,
      size: 10.5,
      color: TEXT,
    });
    ctx.cursorY -= 14;

    ctx.cursorY = drawTextBlock(ctx.page, MARGIN_X, ctx.cursorY, {
      lines: wrapText(project.data.description, ctx.assets.regular, 9.5, CONTENT_WIDTH),
      font: ctx.assets.regular,
      size: 9.5,
      lineHeight: 13,
    });
    ctx.cursorY -= 3;

    ctx.cursorY = drawTextBlock(ctx.page, MARGIN_X, ctx.cursorY, {
      lines: wrapText(project.data.technologies.join(" · "), ctx.assets.regular, 8.8, CONTENT_WIDTH),
      font: ctx.assets.regular,
      size: 8.8,
      color: MUTED,
      lineHeight: 12,
    });

    const link = getProjectPrimaryLink(project);
    if (link) {
      ctx.cursorY = drawTextBlock(ctx.page, MARGIN_X, ctx.cursorY - 1, {
        lines: wrapText(stripProtocol(link), ctx.assets.regular, 8.8, CONTENT_WIDTH),
        font: ctx.assets.regular,
        size: 8.8,
        color: MUTED,
        lineHeight: 12,
      });
    }

    ctx.cursorY -= 9;
  }
}

function estimateEducationHeight(entry: CollectionEntry<"education">, ctx: DrawContext, width: number) {
  const summaryLines = entry.data.summary ? wrapText(entry.data.summary, ctx.assets.regular, 9.5, width) : [];
  const blocks: Array<TextBlock> = [
    {
      lines: [entry.data.degree],
      font: ctx.assets.semiBold,
      size: 10.5,
      lineHeight: 14,
    },
    {
      lines: [entry.data.field ? `${entry.data.institution} · ${entry.data.field}` : entry.data.institution],
      font: ctx.assets.regular,
      size: 9.5,
      color: ACCENT,
      lineHeight: 13,
    },
    {
      lines: [formatYearRange(ctx.locale, entry.data.startDate, entry.data.endDate, ctx.copy.presentLabel)],
      font: ctx.assets.regular,
      size: 8.8,
      color: MUTED,
      lineHeight: 12,
    },
    {
      lines: summaryLines,
      font: ctx.assets.regular,
      size: 9.5,
      lineHeight: 13,
    },
  ];

  return estimateBlockHeight(blocks) + 8;
}

function drawEducationSection(ctx: DrawContext, doc: PDFDocument, education: CvPdfInput["education"]) {
  drawSectionTitle(ctx, doc, ctx.copy.educationTitle);

  for (const entry of education) {
    ensureSpace(ctx, doc, estimateEducationHeight(entry, ctx, CONTENT_WIDTH));

    ctx.page.drawText(entry.data.degree, {
      x: MARGIN_X,
      y: ctx.cursorY,
      font: ctx.assets.semiBold,
      size: 10.5,
      color: TEXT,
    });
    ctx.cursorY -= 14;

    ctx.page.drawText(entry.data.field ? `${entry.data.institution} · ${entry.data.field}` : entry.data.institution, {
      x: MARGIN_X,
      y: ctx.cursorY,
      font: ctx.assets.regular,
      size: 9.5,
      color: ACCENT,
    });
    ctx.cursorY -= 13;

    ctx.page.drawText(formatYearRange(ctx.locale, entry.data.startDate, entry.data.endDate, ctx.copy.presentLabel), {
      x: MARGIN_X,
      y: ctx.cursorY,
      font: ctx.assets.regular,
      size: 8.8,
      color: MUTED,
    });
    ctx.cursorY -= 12;

    if (entry.data.summary) {
      ctx.cursorY = drawTextBlock(ctx.page, MARGIN_X, ctx.cursorY, {
        lines: wrapText(entry.data.summary, ctx.assets.regular, 9.5, CONTENT_WIDTH),
        font: ctx.assets.regular,
        size: 9.5,
        lineHeight: 13,
      });
    }

    ctx.cursorY -= 10;
  }
}

function drawFooter(ctx: DrawContext) {
  ctx.pages.forEach((page, index) => {
    page.drawLine({
      start: { x: MARGIN_X, y: MARGIN_BOTTOM - 10 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: MARGIN_BOTTOM - 10 },
      thickness: 1,
      color: BORDER,
    });

    const footerText = `phildl.com · ${pdfCopy[ctx.locale].page} ${index + 1}/${ctx.pages.length}`;
    const textWidth = ctx.assets.regular.widthOfTextAtSize(footerText, 8.5);

    page.drawText(footerText, {
      x: PAGE_WIDTH - MARGIN_X - textWidth,
      y: MARGIN_BOTTOM - 24,
      font: ctx.assets.regular,
      size: 8.5,
      color: MUTED,
    });
  });
}

async function loadAssets(doc: PDFDocument): Promise<PdfAssets> {
  const profileImagePath = join(process.cwd(), "src/assets/about.jpg");
  const profileImageBytes = await readFile(profileImagePath);

  return {
    regular: await doc.embedFont(Buffer.from(SpaceGroteskRegular), { subset: true }),
    semiBold: await doc.embedFont(Buffer.from(SpaceGroteskSemiBold), { subset: true }),
    bold: await doc.embedFont(Buffer.from(SpaceGroteskBold), { subset: true }),
    profileImage: await doc.embedJpg(profileImageBytes),
  };
}

export async function renderCvPdf(input: CvPdfInput) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`${input.cv.data.basics.name} - CV`);
  doc.setAuthor(input.cv.data.basics.name);
  doc.setCreator("phildl.com");
  doc.setProducer("phildl.com");
  doc.setSubject(input.cv.data.basics.headline);
  doc.setLanguage(input.locale);

  const assets = await loadAssets(doc);
  const firstPage = createPage(doc);
  const ctx: DrawContext = {
    page: firstPage,
    pages: [firstPage],
    cursorY: PAGE_HEIGHT - MARGIN_TOP,
    assets,
    locale: input.locale,
    copy: aboutPageCopy[input.locale],
  };

  drawHeader(ctx, doc, input);
  drawBulletSection(ctx, doc, input.cv.data.focusAreas);
  drawSkillSection(ctx, doc, input.cv.data.skillGroups);
  drawLanguagesSection(ctx, doc, input.cv.data.languages);
  drawExperienceSection(ctx, doc, input.experiences);
  drawProjectsSection(ctx, doc, input.featuredProjects);
  drawEducationSection(ctx, doc, input.education);
  drawFooter(ctx);

  return doc.save();
}
