"use client";

import { useEffect } from "react";

import type { PortfolioContent } from "@/lib/portfolio/contract";

declare global {
  interface Window {
    portfolioOsStarted?: boolean;
    /** Read once by runtime/portfolio-os/08-portfolio-data.js as it starts. */
    portfolioOsContent?: PortfolioContent;
  }
}

export function PortfolioRuntime({ content }: { content: PortfolioContent }) {
  useEffect(() => {
    if (window.portfolioOsStarted) return;
    window.portfolioOsStarted = true;
    // Must be in place before the script runs; the runtime reads it at load.
    window.portfolioOsContent = content;
    const script = document.createElement("script");
    script.src = "/portfolio-runtime.js";
    script.async = true;
    document.body.appendChild(script);
  }, [content]);

  return null;
}
