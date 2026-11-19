import type { Metadata } from "next";
import { Hanken_Grotesk, VT323 } from "next/font/google";
import { notFound } from "next/navigation";

import { isLang, LANGS } from "@/lib/i18n/simple";
import { siteConfig } from "@/lib/site";

import "./simple.css";

/**
 * The root layout of the Simple view, at /en and /id.
 *
 * It is a second root layout, separate from the desktop's (app/(os)/layout.tsx),
 * because the desktop stylesheet resets the whole document — a black, unscrolling
 * body at 11px — and a normal page cannot live under that. Each root layout
 * imports only its own CSS, and moving between the two is a full page load.
 *
 * Any other first segment (/xyz) is a 404: the languages are the whole list.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

// Hanken Grotesk is a calm, plain text face; VT323 is the desktop's own pixel face,
// kept for window titles and small labels so the two pages share a voice. Both are
// self-hosted at build time, so the page makes no request to a font server.
const text = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const pixel = VT323({ subsets: ["latin"], weight: "400", variable: "--font-pixel", display: "swap" });

// Without this, og:image URLs would resolve against localhost or the Vercel
// preview URL: metadataBase is not inherited from the desktop's root layout.
export const metadata: Metadata = {
  metadataBase: siteConfig.url,
};

export default async function SimpleLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <html className={`${text.variable} ${pixel.variable}`} lang={lang}>
      <body>{children}</body>
    </html>
  );
}
