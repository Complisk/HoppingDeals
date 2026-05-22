// Dynamic sitemap. Lists every public route plus one entry per active
// promotion so search engines can crawl them. Uses the service-role
// Supabase client so it doesn't depend on RLS being permissive.
//
// Cached for an hour to keep crawler load low — tweak `revalidate` if
// you want fresher updates after launching new promotions.

import { createAdminClient } from "@/utils/supabase/server";

export const revalidate = 3600;

const SITE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://hoppingdeals.world";

const STATIC_ROUTES = [
  "/",
  "/blog",
  "/photos",
  "/categories",
  "/about-us",
  "/terms",
  "/hopping-deals-business-directory",
];

// Mirrors src/data/mockData.js. Hard-coded so the sitemap stays
// deterministic even when the homepage's CategoryStreet evolves.
const CATEGORY_SLUGS = [
  "active-life",
  "arts-entertainment",
  "automotive",
  "beauty-spas",
  "education",
  "fitness",
  "food",
  "health-medical",
  "home-services",
  "hotels-travel",
  "local-services",
  "nightlife",
  "pets",
  "professional-services",
  "restaurants",
  "shopping",
];

export default async function sitemap() {
  const now = new Date();

  let promotions = [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("Promotions")
      .select("id, updatedAt")
      .eq("status", "active");
    promotions = data ?? [];
  } catch (err) {
    // If Supabase is misconfigured at build time, log and serve the
    // static portion of the sitemap rather than blowing up.
    console.error("[sitemap] failed to fetch promotions:", err?.message);
  }

  return [
    ...STATIC_ROUTES.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: path === "/" ? 1.0 : 0.7,
    })),
    ...CATEGORY_SLUGS.map((slug) => ({
      url: `${SITE_URL}/category/${slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    })),
    ...promotions.map((p) => ({
      url: `${SITE_URL}/promotion/${p.id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "daily",
      priority: 0.5,
    })),
  ];
}
