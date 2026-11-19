import { PortfolioTemplate } from "@/components/templates/portfolio-template";
import { loadPortfolioContent } from "@/lib/portfolio/content";
import { siteConfig, siteOrigin } from "@/lib/site";

/**
 * The page is still prerendered, with the public content read from Postgres
 * baked in. It regenerates hourly as a backstop, and at once whenever the
 * terminal saves a change (app/api/portfolio/refresh).
 */
export const revalidate = 3600;

const personId = `${siteOrigin}/#person`;
const websiteId = `${siteOrigin}/#website`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: siteConfig.personName,
      url: siteOrigin,
      jobTitle: "Fullstack Developer",
      description: siteConfig.description,
      homeLocation: {
        "@type": "Place",
        name: "Garut, Indonesia",
      },
      knowsAbout: [
        "Next.js",
        "React",
        "TypeScript",
        "Node.js",
        "PostgreSQL",
        "Prisma ORM",
        "Full-stack web development",
      ],
      sameAs: Object.values(siteConfig.links),
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: siteOrigin,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: "en",
      author: { "@id": personId },
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteOrigin}/#profile-page`,
      url: siteOrigin,
      name: siteConfig.title,
      description: siteConfig.description,
      inLanguage: "en",
      isPartOf: { "@id": websiteId },
      mainEntity: { "@id": personId },
    },
  ],
};

export default async function HomePage() {
  const content = await loadPortfolioContent();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <PortfolioTemplate content={content} />
    </>
  );
}
