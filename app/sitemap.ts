import type { MetadataRoute } from "next";

import { LANGS } from "@/lib/i18n/simple";
import { siteOrigin } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // The Simple view exists once per language, and each entry names both so search
  // engines pair them. The desktop at "/" is its own page.
  const languages = Object.fromEntries(LANGS.map((lang) => [lang, `${siteOrigin}/${lang}`]));

  return [
    {
      url: siteOrigin,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...LANGS.map((lang) => ({
      url: `${siteOrigin}/${lang}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: { languages },
    })),
  ];
}
