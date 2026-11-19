import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import "./globals.css";

/* eslint-disable @next/next/no-page-custom-font */

export const metadata: Metadata = {
  metadataBase: siteConfig.url,
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.personName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [
    {
      name: siteConfig.personName,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.personName,
  publisher: siteConfig.personName,
  category: "technology",
  keywords: [
    "Aam Hermansyah",
    "fullstack developer Indonesia",
    "Next.js developer",
    "React developer",
    "TypeScript developer",
    "Node.js developer",
    "web application developer",
    "software engineer portfolio",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    locale: "en_US",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The inline script below applies the visitor's accessibility classes to <html>
    // before first paint, so the server markup and the client differ there by design.
    <html lang="en" suppressHydrationWarning>
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
