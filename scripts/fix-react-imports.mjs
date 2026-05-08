// Walk every JSX/JS file in src/presentation and ensure that any React hook
// referenced in the body is imported from "react".
//
// The earlier port pipeline lost some `import { useState } from "react"` lines
// (likely the TS compiler treated certain imports as type-only when an unused
// sibling identifier was present). Rather than re-port from scratch, we patch.

import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..", "src", "presentation");

const HOOKS = [
  "useState",
  "useEffect",
  "useReducer",
  "useContext",
  "useRef",
  "useLayoutEffect",
  "useCallback",
  "useMemo",
  "useImperativeHandle",
  "useTransition",
  "useDeferredValue",
  "useSyncExternalStore",
  "useId",
  "forwardRef",
  "createContext",
  "Fragment",
  "Children",
];

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

let changed = 0;
for (const f of await walk(ROOT)) {
  if (!/\.(jsx?|tsx?)$/.test(f)) continue;
  const orig = await fs.readFile(f, "utf8");
  let src = orig;

  // Find which React identifiers are referenced as values.
  const used = new Set();
  for (const h of HOOKS) {
    // Look for the identifier used as a function call or as JSX <Fragment>
    const rx = new RegExp(`\\b${h}\\b`);
    if (rx.test(src)) used.add(h);
  }
  if (used.size === 0) continue;

  // Determine which hooks are NOT already in any react import.
  const reactImportRx = /import\s+\{([^}]+)\}\s+from\s+["']react["']/g;
  const alreadyImported = new Set();
  for (const m of src.matchAll(reactImportRx)) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (name) alreadyImported.add(name);
    }
  }
  // Default react import like `import React from "react"` doesn't satisfy named hooks.
  const missing = [...used].filter((u) => !alreadyImported.has(u));
  if (missing.length === 0) continue;

  // Insert a fresh `import { ... } from "react"` after "use client" / first import line.
  const importLine = `import { ${missing.join(", ")} } from "react";\n`;

  const useClientMatch = src.match(/^\s*['"]use client['"];?\s*\n/);
  if (useClientMatch) {
    const idx = useClientMatch.index + useClientMatch[0].length;
    src = src.slice(0, idx) + importLine + src.slice(idx);
  } else {
    src = importLine + src;
  }

  await fs.writeFile(f, src, "utf8");
  changed++;
}

console.log(`Patched ${changed} files.`);
