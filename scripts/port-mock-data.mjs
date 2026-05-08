import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import ts from "typescript";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC = path.resolve(__dirname, "..", "..", "complisk-frontend", "src", "data", "mockData.ts");
const OUT = path.resolve(__dirname, "..", "src", "data", "mockData.js");

const source = await fs.readFile(SRC, "utf8");
const result = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    esModuleInterop: true,
  },
});
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, result.outputText, "utf8");
console.log("ported mockData ->", OUT);
