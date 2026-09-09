"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    portfolioOsStarted?: boolean;
  }
}

export function PortfolioRuntime() {
  useEffect(() => {
    if (window.portfolioOsStarted) return;
    window.portfolioOsStarted = true;
    const script = document.createElement("script");
    script.src = "/portfolio-runtime.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return null;
}
