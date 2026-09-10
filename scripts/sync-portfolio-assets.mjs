import fs from "node:fs";
import path from "node:path";
import terser from "next/dist/compiled/terser/bundle.min.js";

const sourceDirectory = path.join("runtime", "portfolio-os");
const sourceFiles = fs
  .readdirSync(sourceDirectory)
  .filter((file) => /^\d{2}-[a-z0-9-]+\.js$/.test(file))
  .sort();

if (sourceFiles.length === 0) {
  throw new Error(`No runtime sources found in ${sourceDirectory}`);
}

const source = sourceFiles
  .map((file) => fs.readFileSync(path.join(sourceDirectory, file), "utf8").trim())
  .join("\n\n");
const runtime = `(function () {\n  "use strict";\n${source}\n})();`;
const minifiedRuntime = terser.minify_sync(runtime, {
  compress: false,
  mangle: false,
  format: { ascii_only: false, comments: false },
});

if (minifiedRuntime.error || !minifiedRuntime.code) {
  throw minifiedRuntime.error ?? new Error("Unable to minify portfolio runtime");
}

fs.writeFileSync("public/portfolio-runtime.js", `${minifiedRuntime.code}\n`);

console.log(`PortfolioOS runtime synchronized from ${sourceFiles.length} source files`);
