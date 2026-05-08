// Rewrites react-router-dom usage -> next/link + next/navigation across the
// ported presentation tree. Runs in-place over each .jsx/.js file.
//
// Replacements:
//   import { Link, useNavigate, useParams, useLocation, NavLink, Outlet,
//            Navigate } from "react-router-dom"
//     -> split into next/link + next/navigation imports
//   <Link to="...">   -> <Link href="...">
//   <NavLink to="..."> -> <Link href="..."> (active styling handled per-file)
//   useNavigate() -> useRouter()
//   navigate("/x") -> router.push("/x")
//   <Navigate to="/x" replace /> -> redirect("/x") via next/navigation
//   <Outlet /> -> {children}

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

const FILE_RE = /\.(jsx?|tsx?)$/;

let changed = 0;
for (const f of await walk(ROOT)) {
  if (!FILE_RE.test(f)) continue;
  const orig = await fs.readFile(f, "utf8");
  if (!orig.includes("react-router-dom")) continue;

  let src = orig;

  // Identify which symbols are imported from react-router-dom.
  // (The transpiler may produce one or many `import { ... } from "react-router-dom"` lines.)
  const usedNextLink = /\b(Link|NavLink)\b/.test(src);
  const usedRouter = /\buseNavigate\b/.test(src);
  const usedParams = /\buseParams\b/.test(src);
  const usedPathname = /\buseLocation\b/.test(src);
  const usedSearchParams = usedPathname; // useLocation usually accesses .search
  const usedRedirect = /<Navigate\b/.test(src);

  // Strip every `from "react-router-dom"` import line.
  src = src.replace(
    /^\s*import\s+(?:[\s\S]*?)\s+from\s+['"]react-router-dom['"];?\s*\n/gm,
    "",
  );

  // Build the new imports
  const nextImports = [];
  if (usedNextLink) nextImports.push(`import Link from "next/link";`);

  const navParts = [];
  if (usedRouter) navParts.push("useRouter");
  if (usedParams) navParts.push("useParams");
  if (usedPathname) navParts.push("usePathname");
  if (usedSearchParams) navParts.push("useSearchParams");
  if (usedRedirect) navParts.push("redirect");
  if (navParts.length) {
    nextImports.push(`import { ${navParts.join(", ")} } from "next/navigation";`);
  }

  // Insert after the "use client" line (or at the top).
  const useClientMatch = src.match(/^\s*['"]use client['"];?\s*\n/);
  if (useClientMatch) {
    const idx = useClientMatch.index + useClientMatch[0].length;
    src = src.slice(0, idx) + nextImports.join("\n") + "\n" + src.slice(idx);
  } else {
    src = nextImports.join("\n") + "\n" + src;
  }

  // Body rewrites
  // <Link to=" -> <Link href="
  src = src.replace(/<Link\b([^>]*?)\sto=/g, "<Link$1 href=");
  // <NavLink to=" -> <Link href="  (active state handled in components/NavLink.jsx separately)
  src = src.replace(/<NavLink\b([^>]*?)\sto=/g, "<Link$1 href=");
  src = src.replace(/<\/NavLink>/g, "</Link>");

  // useNavigate() -> useRouter()
  src = src.replace(/\buseNavigate\(\)/g, "useRouter()");

  // const navigate = useRouter() — keep variable name; rewrite navigate(x) -> navigate.push(x)
  // but only when the original code did `const navigate = useNavigate()`.
  // We detect "const navigate =" assignment that now reads "const navigate = useRouter()".
  const usedNavigateVariable = /const\s+navigate\s*=\s*useRouter\(\)/.test(src);
  if (usedNavigateVariable) {
    // navigate('/x') -> navigate.push('/x')
    src = src.replace(/\bnavigate\(/g, "navigate.push(");
    // navigate.push.push happens if the original had .push; not in this codebase.
    // navigate.push(..., { replace: true }) — Next ignores the 2nd arg, but signature change is harmless.
  }

  // <Outlet /> -> {children}
  src = src.replace(/<Outlet\s*\/>/g, "{children}");

  // <Navigate to="/x" replace /> -> { redirect("/x"); return null; }
  // Only replace simple usages.
  src = src.replace(
    /<Navigate\s+to=\{?["']([^"'}]+)["']\}?\s*(replace\s*)?\/>/g,
    "{redirect(\"$1\")}",
  );

  if (src !== orig) {
    await fs.writeFile(f, src, "utf8");
    changed++;
  }
}

console.log(`Updated ${changed} files.`);
