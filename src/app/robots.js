// Next.js App Router metadata file: served at /robots.txt at runtime.
// Tells crawlers which surfaces to index. Disallows the logged-in
// portals (admin, business dashboard) and the API itself, and points
// at the sitemap.

const SITE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://hoppingdeals.world";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/business", "/api", "/auth"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
