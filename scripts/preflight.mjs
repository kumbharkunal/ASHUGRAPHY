// `npm run preflight`: mechanical copy checks from the taste-skill pre-flight, run over src/.
//   - zero em dashes and en dashes
//   - no filler marketing verbs
//   - no TODO / FIXME / lorem ipsum / "// ..." placeholders
//   - at most one middle dot per line (documented exceptions below)
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { ROOT } from "./image-slots.mjs";

const SOURCE_DIR = path.join(ROOT, "src");
const EXTENSIONS = new Set([".ts", ".tsx", ".css", ".mdx", ".md"]);

/** Lines allowed to carry more than one middle dot, with the reason. */
const MIDDLE_DOT_EXCEPTIONS = [
  { text: "Book your date · Ashugraphy ·", reason: "circular badge ring copy from the brief" },
];

const RULES = [
  { name: "em or en dash", pattern: /[–—]/ },
  {
    name: "filler wording",
    pattern:
      /\b(elevate[sd]?|seamless(ly)?|unleash(es|ed)?|next-gen|revolutioni[sz]e[sd]?|cutting-edge|world-class|game-chang\w*|delve|tapestry|synerg\w*|empower\w*)\b/i,
  },
  { name: "placeholder marker", pattern: /\b(TODO|FIXME|lorem|ipsum)\b|\/\/\s*\.\.\./ },
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "vendor") continue;
      files.push(...(await walk(full)));
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const files = await walk(SOURCE_DIR);
  const problems = [];

  for (const file of files) {
    const lines = (await readFile(file, "utf8")).split(/\r?\n/);
    lines.forEach((line, index) => {
      const where = `${path.relative(ROOT, file)}:${index + 1}`;
      for (const rule of RULES) {
        if (rule.pattern.test(line)) problems.push(`${where}  ${rule.name}: ${line.trim()}`);
      }
      const dots = (line.match(/·/g) ?? []).length;
      const excepted = MIDDLE_DOT_EXCEPTIONS.some((exception) => line.includes(exception.text));
      if (dots > 1 && !excepted) problems.push(`${where}  more than one middle dot: ${line.trim()}`);
    });
  }

  if (problems.length > 0) {
    console.error(`[preflight] ${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
  }
  console.log(`[preflight] ${files.length} files clean (dashes, filler, placeholders, middle dots)`);
}

main().catch((error) => {
  console.error("[preflight] failed:", error);
  process.exit(1);
});
