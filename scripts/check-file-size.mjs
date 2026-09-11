import fs from "node:fs";
import path from "node:path";

const MAX_LINES = 500;
const CODE_EXTENSIONS = new Set([".css", ".html", ".js", ".mjs", ".ts", ".tsx"]);
// `generated` holds machine-written output (Prisma Client). The cap is a
// readability rule for code people maintain by hand, so it has nothing to say
// about files a generator rewrites on every `prisma generate`.
const IGNORED_DIRECTORIES = new Set([".git", ".next", "generated", "node_modules"]);
const oversized = [];

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue;

    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(target);
      continue;
    }

    if (!CODE_EXTENSIONS.has(path.extname(entry.name))) continue;
    const content = fs.readFileSync(target, "utf8").replace(/\r\n/g, "\n");
    const lines = content === ""
      ? 0
      : content.split("\n").length - (content.endsWith("\n") ? 1 : 0);
    if (lines > MAX_LINES) oversized.push({ target, lines });
  }
}

visit(".");

if (oversized.length > 0) {
  for (const file of oversized) {
    console.error(`${file.target}: ${file.lines} lines (maximum ${MAX_LINES})`);
  }
  process.exitCode = 1;
} else {
  console.log(`File-size check passed: every code file is at most ${MAX_LINES} lines`);
}
