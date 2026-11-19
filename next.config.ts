import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    // An easy address to remember and to say aloud; the page itself lives at /en.
    return [{ source: "/simple", destination: "/en", permanent: false }];
  },
};

export default nextConfig;
