import CategoryPageClient from "@/presentation/pages/CategoryPage";
import { categories } from "@/data/mockData";

const slugToTitle = (slug) =>
  String(slug || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const known = categories.find((c) => c.id === slug);
  const name = known?.name || slugToTitle(slug);
  const title = `${name} promotions | Complisk`;
  const description = `Browse active ${name.toLowerCase()} promotions and local deals on Complisk.`;
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
  return <CategoryPageClient slug={slug} />;
}
