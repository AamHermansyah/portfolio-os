import fs from "node:fs";
import terser from "next/dist/compiled/terser/bundle.min.js";

const source = fs.readFileSync("portfolio.html", "utf8");
const stylesheet = source.match(/<style>([\s\S]*?)<\/style>/)?.[1];
const runtime = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];

if (!stylesheet || !runtime) {
  throw new Error("portfolio.html must contain one <style> and one <script> block");
}

const minifiedRuntime = terser.minify_sync(runtime, {
  compress: false,
  mangle: false,
  format: { ascii_only: false, comments: false },
});

if (minifiedRuntime.error || !minifiedRuntime.code) {
  throw minifiedRuntime.error ?? new Error("Unable to minify portfolio runtime");
}

fs.writeFileSync(
  "styles/portfolio-os.css",
  `${stylesheet.trim().replace(/\r?\n/g, " ")}\n`,
);
fs.writeFileSync("public/portfolio-runtime.js", `${minifiedRuntime.code}\n`);

console.log("PortfolioOS CSS and runtime synchronized from portfolio.html");
