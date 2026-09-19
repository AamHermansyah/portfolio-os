import { loadPortfolioContent } from "@/lib/portfolio/content";

/**
 * The public content, fresh from Postgres — what the Refresh buttons in the
 * PortfolioOS windows fetch, so a visitor sees a new entry without reloading.
 *
 * It returns exactly what the home page already embeds (published rows only),
 * so it exposes nothing new. The short shared cache lets a CDN absorb a burst
 * of refreshes while keeping what a visitor sees at most a few seconds old;
 * the admin's own refresh goes through POST /api/portfolio/refresh instead,
 * which is never cached.
 */
export async function GET() {
  try {
    const content = await loadPortfolioContent();
    return Response.json(
      { ok: true, content },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=5, stale-while-revalidate=30" } },
    );
  } catch (error) {
    console.error("[portfolio] content failed:", error);
    return Response.json({ ok: false, error: "server" }, { status: 500 });
  }
}
