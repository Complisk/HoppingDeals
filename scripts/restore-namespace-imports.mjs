// For every ported .jsx file in src/presentation, look at the original .tsx
// (or .ts) in complisk-frontend. Find every `import * as X from "..."` and
// `import { X } from "..."` line that's MISSING in the ported file, and
// re-insert it.
//
// We only care about these classes of import that the TS transpiler tends to
// drop or mis-handle:
//   - namespace imports                : import * as X from "..."
//   - default imports                  : import X from "..."
//   - named imports                    : import { A, B } from "..."
//
// We do NOT touch react-router-dom (already rewritten), or lines whose source
// path begins with "@/" because the alias rewrite step changed those paths.
// For those, we apply the alias map ourselves.

import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND = path.resolve(__dirname, "..", "..", "complisk-frontend", "src");
const TARGET = path.resolve(__dirname, "..", "src", "presentation");

const aliasRewrites = [
  [/@\/components\/ui\//g, "@/presentation/components/ui/"],
  [/@\/components\//g, "@/presentation/components/"],
  [/@\/lib\/utils/g, "@/presentation/lib/utils"],
  [/@\/lib\//g, "@/presentation/lib/"],
  [/@\/hooks\//g, "@/presentation/hooks/"],
  [/@\/store/g, "@/presentation/store"],
  [/@\/services\//g, "@/presentation/services/"],
  [/@\/utils\//g, "@/presentation/lib/"],
];
const rewriteAlias = (s) => {
  let out = s;
  for (const [r, rep] of aliasRewrites) out = out.replace(r, rep);
  return out;
};

const SKIP_SOURCES = new Set(["react-router-dom"]);

// Walk target tree, mapping each file to its original source path.
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

function findOriginal(targetFile) {
  // src/presentation/components/foo.jsx -> complisk-frontend/src/components/foo.tsx
  const rel = path.relative(TARGET, targetFile);
  const candidates = [];
  // pages/foo.jsx -> pages/foo.tsx
  candidates.push(rel.replace(/\.jsx?$/, ".tsx"));
  candidates.push(rel.replace(/\.jsx?$/, ".ts"));
  // lib/foo.js -> utils/foo.tsx (because we mapped utils -> lib)
  if (/^lib\//.test(rel)) {
    candidates.push(rel.replace(/^lib\//, "utils/").replace(/\.jsx?$/, ".tsx"));
    candidates.push(rel.replace(/^lib\//, "utils/").replace(/\.jsx?$/, ".ts"));
  }
  return candidates.map((c) => path.join(FRONTEND, c));
}

function parseImportsFrom(src) {
  // Returns array of { raw, kind, names, source }
  // kind: "default", "named", "namespace", "side-effect"
  const out = [];
  const re =
    /import\s+([\s\S]*?)\s+from\s+["']([^"']+)["']\s*;?|import\s+["']([^"']+)["']\s*;?/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    if (m[3]) {
      out.push({ raw: m[0], kind: "side-effect", names: [], source: m[3] });
      continue;
    }
    const decl = (m[1] || "").trim();
    const source = m[2];
    let kind = "named";
    let names = [];
    let defaultName = null;

    const ns = decl.match(/^\*\s+as\s+(\w+)/);
    if (ns) {
      kind = "namespace";
      names = [ns[1]];
      out.push({ raw: m[0], kind, names, source });
      continue;
    }

    const braceMatch = decl.match(/\{([^}]+)\}/);
    if (braceMatch) {
      names = braceMatch[1]
        .split(",")
        .map((p) => p.trim().split(/\s+as\s+/)[0].trim())
        .filter(Boolean);
    }

    const beforeBrace = decl.replace(/\{[^}]+\}/, "").replace(/,/g, "").trim();
    if (beforeBrace) {
      defaultName = beforeBrace;
    }

    if (defaultName && names.length) {
      out.push({ raw: m[0], kind: "default+named", names: [defaultName, ...names], source });
    } else if (defaultName) {
      out.push({ raw: m[0], kind: "default", names: [defaultName], source });
    } else if (names.length) {
      out.push({ raw: m[0], kind: "named", names, source });
    }
  }
  return out;
}

let touched = 0;

for (const tFile of await walk(TARGET)) {
  if (!/\.(jsx?|tsx?)$/.test(tFile)) continue;
  const targetSrc = await fs.readFile(tFile, "utf8");

  // Locate original.
  let originalSrc = null;
  for (const cand of findOriginal(tFile)) {
    try {
      originalSrc = await fs.readFile(cand, "utf8");
      break;
    } catch {}
  }
  if (!originalSrc) continue;

  const origImports = parseImportsFrom(originalSrc).map((imp) => ({
    ...imp,
    source: imp.source.startsWith("@/") ? rewriteAlias(imp.source) : imp.source,
  }));

  const tgtImports = parseImportsFrom(targetSrc);
  const tgtNamesBySource = new Map();
  for (const t of tgtImports) {
    if (!tgtNamesBySource.has(t.source)) tgtNamesBySource.set(t.source, new Set());
    for (const n of t.names) tgtNamesBySource.get(t.source).add(n);
  }

  const missing = [];
  for (const imp of origImports) {
    if (SKIP_SOURCES.has(imp.source)) continue;
    if (imp.source === "react") continue; // already fixed
    if (imp.kind === "side-effect") {
      // Keep side-effect imports if absent.
      if (!tgtNamesBySource.has(imp.source)) {
        missing.push(`import "${imp.source}";`);
      }
      continue;
    }
    const have = tgtNamesBySource.get(imp.source) ?? new Set();
    const need = imp.names.filter((n) => !have.has(n));
    if (need.length === 0) continue;

    // Only add if at least one of the missing names is actually referenced in
    // the target body (avoid resurrecting a dead import like a TS-only type).
    const referenced = need.some((n) => new RegExp(`\\b${n}\\b`).test(targetSrc));
    if (!referenced) continue;

    if (imp.kind === "namespace") {
      missing.push(`import * as ${imp.names[0]} from "${imp.source}";`);
    } else if (imp.kind === "default") {
      missing.push(`import ${imp.names[0]} from "${imp.source}";`);
    } else if (imp.kind === "default+named") {
      const [d, ...rest] = imp.names;
      missing.push(`import ${d}, { ${rest.join(", ")} } from "${imp.source}";`);
    } else {
      missing.push(`import { ${need.join(", ")} } from "${imp.source}";`);
    }
  }

  if (missing.length === 0) continue;

  // Insert after "use client" (or first existing import).
  let next = targetSrc;
  const useClient = next.match(/^\s*['"]use client['"];?\s*\n/);
  const insertAt = useClient ? useClient.index + useClient[0].length : 0;
  next = next.slice(0, insertAt) + missing.join("\n") + "\n" + next.slice(insertAt);

  await fs.writeFile(tFile, next, "utf8");
  touched++;
}

console.log(`Touched ${touched} files.`);
