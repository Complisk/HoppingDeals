import CategoryPageClient from "@/presentation/pages/CategoryPage";
import StructuredData from "@/presentation/components/shared/StructuredData";
import { categories } from "@/data/mockData";

const SITE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://hoppingdeals.world";

const slugToTitle = (slug) =>
  String(slug || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const known = categories.find((c) => c.id === slug);
  const name = known?.name || slugToTitle(slug);
  const title = `${name} promotions | Hopping Deals`;
  const description = `Browse active ${name.toLowerCase()} promotions and local deals on Hopping Deals.`;
  const path = `/category/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const known = categories.find((c) => c.id === slug);
  const name = known?.name || slugToTitle(slug);
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${name} promotions on Hopping Deals`,
    description: `Active ${name.toLowerCase()} promotions and local deals on Hopping Deals.`,
    url: `${SITE_URL}/category/${slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Hopping Deals",
      url: SITE_URL,
    },
  };
  return (
    <>
      <StructuredData data={collectionSchema} />
      <CategoryPageClient slug={slug} />
    </>
  );
}
