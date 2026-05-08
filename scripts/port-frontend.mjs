// One-shot script that copies tsx/ts files from complisk-frontend, strips
// types, rewrites @/ imports to the new layout, and writes them under
// complisk-fullstack. Adds "use client" automatically when needed.
//
// Run: node scripts/port-frontend.mjs

import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import ts from "typescript";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC = path.resolve(__dirname, "..", "..", "complisk-frontend", "src");
const OUT = path.resolve(__dirname, "..", "src", "presentation");

// Map old @/ paths -> new @/ paths
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

const clientHookRegex = /\b(useState|useEffect|useReducer|useContext|useRef|useLayoutEffect|useCallback|useMemo|useImperativeHandle|useTransition|useDeferredValue|useSyncExternalStore|useId|useFormState|useFormStatus|use\w+\b)|onClick|onChange|onSubmit|onBlur|onFocus|onKeyDown|onKeyUp/;

const browserGlobalRegex = /\b(window|document|localStorage|sessionStorage|navigator)\b/;

function shouldBeClient(src) {
  // shadcn ui components, anything using state/effects/event handlers, or
  // touching browser globals.
  return clientHookRegex.test(src) || browserGlobalRegex.test(src);
}

function rewriteAliases(src) {
  let out = src;
  for (const [r, replacement] of aliasRewrites) out = out.replace(r, replacement);
  return out;
}

function transpile(src, isTsx) {
  const result = ts.transpileModule(src, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: isTsx ? ts.JsxEmit.Preserve : ts.JsxEmit.None,
      esModuleInterop: true,
      isolatedModules: true,
      verbatimModuleSyntax: false,
      removeComments: false,
    },
  });
  return result.outputText;
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

const SUBTREES = [
  "components/ui",
  "components/shared",
  "components/homePage",
  "components/public",
  "components/business",
  "components/admin",
  "components/layouts",
  "components/NavLink.tsx",
  "components/PrivateRoute.tsx",
  "hooks",
  "store",
  "services",
  "lib",
  "utils",
];

async function exists(p) {
  try { await fs.stat(p); return true; } catch { return false; }
}

let total = 0;

for (const sub of SUBTREES) {
  const inPath = path.join(SRC, sub);
  if (!(await exists(inPath))) continue;

  const stat = await fs.stat(inPath);
  const files = stat.isDirectory() ? await walk(inPath) : [inPath];

  for (const f of files) {
    const rel = path.relative(SRC, f);
    const ext = path.extname(f);
    if (![".ts", ".tsx", ".js", ".jsx"].includes(ext)) continue;

    let src = await fs.readFile(f, "utf8");

    // Strip the old "use client" if present (we'll re-add).
    src = src.replace(/^\s*['"]use client['"];?\s*\n?/m, "");

    src = rewriteAliases(src);
    const transpiled = transpile(src, ext === ".tsx");

    const needsClient = shouldBeClient(transpiled) || ext === ".tsx";
    let content = needsClient ? `"use client";\n\n${transpiled}` : transpiled;

    // Re-route component subtree dirs
    let outRel = rel
      .replace(/^components\//, "components/")
      .replace(/^hooks\//, "hooks/")
      .replace(/^store(\/|$)/, "store$1")
      .replace(/^services\//, "services/")
      .replace(/^lib\//, "lib/")
      .replace(/^utils\//, "lib/"); // legacy utils land under lib

    // .tsx -> .jsx, .ts -> .js
    outRel = outRel.replace(/\.tsx$/, ".jsx").replace(/\.ts$/, ".js");

    const outFull = path.join(OUT, outRel);
    await fs.mkdir(path.dirname(outFull), { recursive: true });
    await fs.writeFile(outFull, content, "utf8");
    total++;
  }
}

console.log(`Ported ${total} files.`);
