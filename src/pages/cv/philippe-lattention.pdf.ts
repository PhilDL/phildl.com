import {
  getCv,
  getCvFeaturedProjectsFromEntry,
  getCvOpenSourceProjectsFromEntry,
  getEducation,
  getExperiences,
} from "@/content/queries";
import { renderCvPdf } from "@/utils/cvPdf";

export async function GET() {
  const locale = "en";
  const [cv, experiences, education] = await Promise.all([
    getCv(locale),
    getExperiences(locale),
    getEducation(locale),
  ]);
  const featuredProjects = await getCvFeaturedProjectsFromEntry(cv);
  const openSourceProjects = await getCvOpenSourceProjectsFromEntry(cv);

  const pdf = await renderCvPdf({
    locale,
    cv,
    experiences,
    education,
    featuredProjects: featuredProjects.slice(0, 4),
    openSourceProjects: openSourceProjects.slice(0, 4),
  });
  const body = pdf.slice().buffer as ArrayBuffer;

  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="philippe-lattention-cv.pdf"',
    },
  });
}
