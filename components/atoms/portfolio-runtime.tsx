"use client";

import { useEffect } from "react";

import type { PortfolioContent, PublicProfile } from "@/lib/portfolio/contract";

declare global {
  interface Window {
    portfolioOsStarted?: boolean;
    /** Read once by runtime/portfolio-os/08-portfolio-data.js as it starts. */
    portfolioOsContent?: PortfolioContent;
    /** Who this portfolio is about; read at the same moment as the content. */
    portfolioOsProfile?: PublicProfile;
  }
}

export function PortfolioRuntime({ content, profile }: { content: PortfolioContent; profile: PublicProfile }) {
  useEffect(() => {
    if (window.portfolioOsStarted) return;
    window.portfolioOsStarted = true;
    // Both must be in place before the script runs; the runtime reads them at load.
    window.portfolioOsContent = content;
    window.portfolioOsProfile = profile;
    const script = document.createElement("script");
    script.src = "/portfolio-runtime.js";
    script.async = true;
    document.body.appendChild(script);
  }, [content, profile]);

  return null;
}
