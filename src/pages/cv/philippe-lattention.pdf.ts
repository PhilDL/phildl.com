import { getCv, getEducation, getExperiences, getFeaturedProjects } from "@/content/queries";
import { renderCvPdf } from "@/utils/cvPdf";

export async function GET() {
  const locale = "en";
  const [cv, experiences, education, featuredProjects] = await Promise.all([
    getCv(locale),
    getExperiences(locale),
    getEducation(locale),
    getFeaturedProjects(locale),
  ]);

  const pdf = await renderCvPdf({
    locale,
    cv,
    experiences,
    education,
    featuredProjects: featuredProjects.slice(0, 4),
  });
  const body = pdf.slice().buffer as ArrayBuffer;

  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="philippe-lattention-cv.pdf"',
    },
  });
}
