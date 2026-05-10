import IndexPage from "@/presentation/pages/Index";
import StructuredData from "@/presentation/components/shared/StructuredData";

const SITE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://complisk.com";

export const metadata = {
  title: "Complisk | Local business promotions and deals",
  description:
    "Find local business promotions, flash deals, and limited-time offers near you. Browse restaurants, beauty, services, and more on Complisk.",
  alternates: { canonical: "/" },
};

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Complisk",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-512.png`,
  sameAs: ["https://www.instagram.com/complisk_promo"],
  description:
    "Complisk surfaces local-business promotions, flash deals, and limited-time offers from nearby merchants.",
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Complisk",
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
