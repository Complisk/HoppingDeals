const SITE_URL = process.env.NEXT_PUBLIC_API_URL || "https://complisk.com";

export const metadata = {
  title: "Complisk Photos Gallery",
  description:
    "Browse Complisk photos and images of our app, guides, and promotional materials.",
  alternates: { canonical: "/photos" },
  openGraph: {
    title: "Complisk Photos Gallery",
    description:
      "Browse Complisk photos and images of our app, guides, and promotional materials.",
    url: "/photos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Complisk Photos Gallery",
    description:
      "Browse Complisk photos and images of our app, guides, and promotional materials.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Complisk Photos",
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
