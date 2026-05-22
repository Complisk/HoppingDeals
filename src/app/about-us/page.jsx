import AboutUs from "@/presentation/pages/AboutUs";

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || "https://hoppingdeals.world";

export const metadata = {
  title: "About Hopping Deals",
  description:
    "Learn how Hopping Deals helps local businesses launch location-based promotions and helps customers discover timely local deals.",
  alternates: { canonical: "/about-us" },
  openGraph: {
    title: "About Hopping Deals",
    description:
      "Learn how Hopping Deals helps local businesses launch location-based promotions and helps customers discover timely local deals.",
    url: "/about-us",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Hopping Deals",
    description:
      "Learn how Hopping Deals helps local businesses launch location-based promotions and helps customers discover timely local deals.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Hopping Deals",
  url: `${SITE_URL}/about-us`,
  description:
    "Hopping Deals connects local businesses with nearby customers through targeted promotions and transparent campaign tools.",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AboutUs />
    </>
  );
}
