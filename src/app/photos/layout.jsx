const SITE_URL = process.env.NEXT_PUBLIC_API_URL || "https://hoppingdeals.world";

export const metadata = {
  title: "Hopping Deals Photos Gallery",
  description:
    "Browse Hopping Deals photos and images of our app, guides, and promotional materials.",
  alternates: { canonical: "/photos" },
  openGraph: {
    title: "Hopping Deals Photos Gallery",
    description:
      "Browse Hopping Deals photos and images of our app, guides, and promotional materials.",
    url: "/photos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hopping Deals Photos Gallery",
    description:
      "Browse Hopping Deals photos and images of our app, guides, and promotional materials.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Hopping Deals Photos",
  url: `${SITE_URL}/photos`,
};

export default function PhotosLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
