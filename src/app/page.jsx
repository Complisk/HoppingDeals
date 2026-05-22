import IndexPage from "@/presentation/pages/Index";
import StructuredData from "@/presentation/components/shared/StructuredData";

const SITE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://hoppingdeals.world";

export const metadata = {
  title: "Hopping Deals | Local business promotions and deals",
  description:
    "Find local business promotions, flash deals, and limited-time offers near you. Browse restaurants, beauty, services, and more on Hopping Deals.",
  alternates: { canonical: "/" },
};

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Hopping Deals",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-512.png`,
  sameAs: ["https://www.instagram.com/hopping_deals"],
  description:
    "Hopping Deals surfaces local-business promotions, flash deals, and limited-time offers from nearby merchants.",
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Hopping Deals",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/category/{search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function Page() {
  return (
    <>
      <StructuredData data={organization} />
      <StructuredData data={website} />
      <IndexPage />
    </>
  );
}
