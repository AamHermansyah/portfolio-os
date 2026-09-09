import type { Metadata } from "next";
import "./globals.css";

/* eslint-disable @next/next/no-page-custom-font */

export const metadata: Metadata = {
  title: "PortfolioOS 98 — Alex Novak",
  description:
    "An interactive Windows 98-inspired portfolio for fullstack developer Alex Novak.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=VT323&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/w95fa" rel="stylesheet" />
      </head>
      <body className="crt wall-star">{children}</body>
    </html>
  );
}
