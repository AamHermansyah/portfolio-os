const DEFAULT_SITE_URL = "https://aamhermansyah.vercel.app";

function resolveSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  try {
    return new URL(configuredUrl || DEFAULT_SITE_URL);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export const siteConfig = {
  name: "PortfolioOS 98",
  personName: "Aam Hermansyah",
  title: "Aam Hermansyah — Fullstack Developer | PortfolioOS",
  description:
    "Portfolio of Aam Hermansyah, an Indonesian fullstack developer building web applications with Next.js, React, TypeScript, Node.js, and PostgreSQL.",
  url: resolveSiteUrl(),
  links: {
    github: "https://github.com/AamHermansyah",
    linkedin: "https://www.linkedin.com/in/aam-hermansyah/",
    fiverr: "https://www.fiverr.com/aam_hermansyah",
  },
} as const;

export const siteOrigin = siteConfig.url.origin;
