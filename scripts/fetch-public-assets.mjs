// One-shot asset recovery script.
//
// The first dev shipped images directly to the production server at
// complisk.com but never committed them to GitHub. This script downloads
// every image referenced by the live site (homepage cityscape, PWA icons,
// favicons, OG images) into complisk-fullstack/public/ so we can reproduce
// the live UI locally.
//
// Run: node scripts/fetch-public-assets.mjs

import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, "..", "public");
const BASE = "https://complisk.com";

// Discovered by inspecting:
//   - https://complisk.com/index.html
//   - https://complisk.com/assets/Index-lFFC80Dr.js  (homepage cityscape)
//   - https://complisk.com/manifest.json
const ASSETS = [
  // Favicons / PWA / OG
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/favicon-48x48.png",
  "/apple-touch-icon.png",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
  "/logo-512.png",

  // Homepage cityscape — sky / ground
  "/day-background.webp",
  "/night-bg.webp",
  "/cloud.webp",
  "/sun.webp",
  "/moon.webp",
  "/airplane.png",
  "/car.png",

  // Building illustrations referenced from /
  "/bakery.png",
  "/barber.png",
  "/pharmacy.png",
  "/image.png",
  "/Capture_store-removebg-preview.png",
  "/Casino__Hotel-removebg-preview.png",
  "/Home_Services-removebg-preview.png",
  "/Products___Shopping-removebg-preview.png",

  // /new-assets/ — numbered category illustrations 1..24 (probed live; 25+ 404)
  ...Array.from({ length: 24 }, (_, i) => `/new-assets/${i + 1}.webp`),
  "/new-assets/Capture123-removebg-preview.png",
  "/new-assets/Shopping_Catergory_Building_for_Carousel__1_-removebg-preview.png",
  "/new-assets/art-entertairment.png",
  "/new-assets/online-shopping.png",
];

let success = 0;
let missing = 0;
const missingPaths = [];

for (const remotePath of ASSETS) {
  const target = path.join(PUBLIC_DIR, remotePath.replace(/^\//, ""));
  await fs.mkdir(path.dirname(target), { recursive: true });

  try {
    const res = await fetch(BASE + remotePath, {
      headers: { "User-Agent": "Mozilla/5.0 complisk-asset-recovery" },
    });
    if (!res.ok) {
      missing++;
      missingPaths.push(`${res.status}  ${remotePath}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(target, buf);
    success++;
    console.log(`✓ ${remotePath}  (${(buf.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    missing++;
    missingPaths.push(`ERR  ${remotePath}  ${err.message}`);
  }
}

console.log(`\n  Downloaded ${success}/${ASSETS.length} assets`);
if (missing) {
  console.log(`  ${missing} missing or failed:`);
  for (const m of missingPaths) console.log(`    ${m}`);
}
