import type { Lang } from "@/lib/i18n/simple";

/**
 * What the Simple view's metadata shares across languages.
 *
 * Next merges metadata one level deep: a page that sets `openGraph` replaces the
 * parent's whole object. So each language page spells out its own openGraph,
 * twitter and robots from these pieces instead of leaning on a parent's.
 */

export const OG_LOCALE: Record<Lang, string> = { en: "en_US", id: "id_ID" };

/** Canonical plus the hreflang map; both languages point at each other. */
export function simpleAlternates(lang: Lang) {
  return {
    canonical: `/${lang}`,
    languages: { en: "/en", id: "/id", "x-default": "/en" },
  };
}

export const ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large" as const,
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};
