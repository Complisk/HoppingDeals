// Port pages to a temporary holding spot. We'll then re-route each one into
// the App Router file conventions in the next phase.
import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import ts from "typescript";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC = path.resolve(__dirname, "..", "..", "complisk-frontend", "src", "pages");
const OUT = path.resolve(__dirname, "..", "src", "presentation", "_pages_raw");

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

let n = 0;
for (const f of await walk(SRC)) {
  let src = await fs.readFile(f, "utf8");
  src = src.replace(/^\s*['"]use client['"];?\s*\n?/m, "");
  for (const [r, rep] of aliasRewrites) src = src.replace(r, rep);

  const isTsx = f.endsWith(".tsx");
  const result = ts.transpileModule(src, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: isTsx ? ts.JsxEmit.Preserve : ts.JsxEmit.None,
      esModuleInterop: true,
      isolatedModules: true,
      removeComments: false,
    },
  });

  const rel = path.relative(SRC, f).replace(/\.tsx$/, ".jsx").replace(/\.ts$/, ".js");
  const outFull = path.join(OUT, rel);
  await fs.mkdir(path.dirname(outFull), { recursive: true });
  await fs.writeFile(outFull, `"use client";\n\n${result.outputText}`, "utf8");
  n++;
}

console.log(`Ported ${n} page files into _pages_raw.`);
