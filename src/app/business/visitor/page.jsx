import BusinessVisitor from "@/presentation/pages/business/BusinessVisitor";

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || "https://hoppingdeals.world";

export const metadata = {
  title: "Promotion marketing for local businesses",
  description:
    "Launch geo-targeted local promotions, schedule campaigns, and track results with Hopping Deals's business marketing platform.",
  alternates: { canonical: "/business/visitor" },
  openGraph: {
    title: "Promotion marketing for local businesses",
    description:
      "Launch geo-targeted local promotions, schedule campaigns, and track results with Hopping Deals's business marketing platform.",
    url: "/business/visitor",
    type: "website",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Hopping Deals promotion platform",
  provider: {
    "@type": "Organization",
    name: "Hopping Deals",
    url: SITE_URL,
  },
  areaServed: "US",
  description:
    "A promotion marketing platform for businesses that want to publish local offers and measure campaign performance.",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BusinessVisitor />
    </>
  );
}
