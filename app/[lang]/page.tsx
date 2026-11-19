import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SimpleView } from "@/components/simple/simple-view";
import { isLang, SIMPLE_COPY } from "@/lib/i18n/simple";
import { loadPortfolioContent, loadTestimonialPage } from "@/lib/portfolio/content";
import { profile } from "@/lib/portfolio/profile";
import { OG_LOCALE, ROBOTS, simpleAlternates } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

/**
 * Prerendered with the public content baked in, and regenerated hourly — and at
 * once whenever the terminal saves a change (app/api/portfolio/refresh).
 */
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const copy = SIMPLE_COPY[lang];
  const title = `${profile.name} — ${copy.htmlTitle}`;

  // Metadata merges one level deep, so openGraph, twitter and robots are spelled
  // out here rather than inherited.
  return {
    title,
    description: copy.metaDescription,
    alternates: simpleAlternates(lang),
    openGraph: {
      type: "website",
      url: `/${lang}`,
      locale: OG_LOCALE[lang],
      siteName: siteConfig.name,
      title,
      description: copy.metaDescription,
    },
    twitter: { card: "summary_large_image", title, description: copy.metaDescription },
    robots: ROBOTS,
  };
}

export default async function SimplePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const [content, testimonials] = await Promise.all([loadPortfolioContent(), loadTestimonialPage(1, 6)]);

  return (
    <SimpleView
      content={content}
      copy={SIMPLE_COPY[lang]}
      lang={lang}
      profile={profile}
      testimonials={testimonials.items}
      year={new Date().getFullYear()}
    />
  );
}
