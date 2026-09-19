import { loadTestimonialPage } from "@/lib/portfolio/content";

/**
 * Testimonial Express, one page at a time.
 *
 * GET /api/testimonials?page=N&limit=L. The inbox asks with a limit of 1, so
 * each notification is its own request for the next message; the terminal's
 * `testimonials` command pages through a few at once. Only published rows are
 * ever returned.
 *
 * Both parameters are capped: the page, so a stray value cannot ask Postgres to
 * skip a billion rows, and the limit, so nobody can pull the whole table as one
 * page of this public endpoint.
 */
const MAX_PAGE = 10_000;
const MAX_LIMIT = 50;

function readPositive(value: string | null, fallback: number, max: number): number {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 ? Math.min(number, max) : fallback;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const page = readPositive(params.get("page"), 1, MAX_PAGE);
  const limit = readPositive(params.get("limit"), 1, MAX_LIMIT);

  try {
    return Response.json({ ok: true, ...(await loadTestimonialPage(page, limit)) });
  } catch (error) {
    console.error("[portfolio] testimonials failed:", error);
    return Response.json({ ok: false, error: "server" }, { status: 500 });
  }
}
