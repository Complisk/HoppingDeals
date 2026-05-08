// Replace any remaining `import.meta.env.VITE_API_BASE_URL` references with
// the empty string so calls become same-origin "/api/..." URLs.
import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..", "src", "presentation");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

let touched = 0;
for (const f of await walk(ROOT)) {
  if (!/\.(jsx?|tsx?)$/.test(f)) continue;
  const orig = await fs.readFile(f, "utf8");
  if (!orig.includes("import.meta.env")) continue;

  // Strip the env reference so the URL becomes just "/api/...".
  let next = orig
    .replace(/\$\{import\.meta\.env\.VITE_API_BASE_URL\}/g, "")
    .replace(/import\.meta\.env\.VITE_API_BASE_URL\s*\|\|\s*["']([^"']*)["']/g, '""')
    .replace(/import\.meta\.env\.VITE_API_BASE_URL/g, '""')
    .replace(/import\.meta\.env\.VITE_STRIPE_PUBLISHABLE_KEY/g, "process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
    .replace(/import\.meta\.env\.VITE_/g, "process.env.NEXT_PUBLIC_");

  if (next !== orig) {
    await fs.writeFile(f, next, "utf8");
    touched++;
  }
}
console.log(`Touched ${touched} files.`);
