// Removes duplicate React named imports inserted by the previous fix script.
// If a file has `import React, { ... } from "react"` already covering a hook,
// strip the redundant `import { ... } from "react"` line.
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

let changed = 0;
for (const f of await walk(ROOT)) {
  if (!/\.(jsx?|tsx?)$/.test(f)) continue;
  const orig = await fs.readFile(f, "utf8");

  // Collect every react import line and the names they bring in.
  const reactLines = [];
  const re =
    /^[ \t]*import\s+([\s\S]*?)\s+from\s+["']react["'];?\s*\n/gm;
  let m;
  const lines = [];
  while ((m = re.exec(orig)) !== null) {
    lines.push({
      start: m.index,
      end: m.index + m[0].length,
      raw: m[0],
      decl: m[1].trim(),
    });
  }
  if (lines.length < 2) continue;

  // Parse declarations.
  let defaultName = null;
  const named = new Set();
  const ns = []; // namespace imports `import * as X`
  for (const line of lines) {
    const decl = line.decl;
    if (/^\*\s+as\s+/.test(decl)) {
      ns.push(decl.replace(/^\*\s+as\s+/, "").trim());
      continue;
    }
    // Could be: React, { useState } | { useState } | React
    const braceMatch = decl.match(/\{([^}]*)\}/);
    let beforeBrace = decl;
    if (braceMatch) {
      beforeBrace = decl.replace(braceMatch[0], "").replace(/,\s*$/, "").trim();
      for (const part of braceMatch[1].split(",")) {
        const name = part.trim().split(/\s+as\s+/)[0].trim();
        if (name) named.add(name);
      }
    }
    if (beforeBrace) {
      const cleaned = beforeBrace.replace(/^,/, "").trim();
      if (cleaned && cleaned !== "*") defaultName = defaultName || cleaned;
    }
  }

  // Build a single canonical import line.
  let consolidated = "import ";
  if (ns.length) {
    // Keep namespace imports as their own line; rare case.
    consolidated = null;
  } else if (defaultName && named.size) {
    consolidated += `${defaultName}, { ${[...named].join(", ")} }`;
  } else if (defaultName) {
    consolidated += `${defaultName}`;
  } else if (named.size) {
    consolidated += `{ ${[...named].join(", ")} }`;
  } else {
    consolidated = null;
  }

  if (!consolidated) continue;
  consolidated += ` from "react";\n`;

  // Remove the original lines (in reverse order) and insert one consolidated
  // line at the position of the first one.
  let next = orig;
  for (let i = lines.length - 1; i >= 0; i--) {
    next = next.slice(0, lines[i].start) + next.slice(lines[i].end);
  }
  next = next.slice(0, lines[0].start) + consolidated + next.slice(lines[0].start);

  // Add namespace imports back at the top if any.
  for (const ns_name of ns) {
    next = `import * as ${ns_name} from "react";\n` + next;
  }

  if (next !== orig) {
    await fs.writeFile(f, next, "utf8");
    changed++;
  }
}

console.log(`Deduped ${changed} files.`);
