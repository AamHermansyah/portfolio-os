import type { Metadata } from "next";
import "./globals.css";

/* eslint-disable @next/next/no-page-custom-font */

export const metadata: Metadata = {
  title: "PortfolioOS 98 — Aam Hermansyah",
  description:
    "An interactive Windows 98-inspired portfolio for fullstack developer Aam Hermansyah.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=VT323&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/w95fa" rel="stylesheet" />
        {/* Accessibility preferences are applied before first paint, so a reload
            lands on the chosen settings instead of flashing the defaults first. */}
        <script dangerouslySetInnerHTML={{ __html: "(function(){try{var p=JSON.parse(localStorage.getItem('portfolioos.a11y')||'{}'),r=document.documentElement;if(p.reduceMotion)r.classList.add('a11y-motion');if(p.highContrast)r.classList.add('a11y-contrast');if(p.skipBoot)r.classList.add('a11y-noboot');if(p.fontScale)r.style.setProperty('--a11y-scale',p.fontScale/100);}catch(e){}})();" }} />
      </head>
      <body className="crt wall-star">{children}</body>
    </html>
  );
}
