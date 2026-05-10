import PromotionDetail from "@/presentation/pages/PromotionDetail";
import StructuredData from "@/presentation/components/shared/StructuredData";
import { createAdminClient } from "@/utils/supabase/server";

const SITE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://complisk.com";

// Render on demand. There are 143+ active promotions; pre-rendering every
// one at build time is expensive and the data is live anyway.
export const dynamic = "force-dynamic";

// Server-side load for SEO. The client component (PromotionDetail) makes
// its own fetch for the live render — this is the dedicated SEO read so
// search engines and social platforms see the right title/description
// even if the client has yet to render.
async function fetchPromotion(id) {
  if (!id) return null;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("Promotions")
      .select(
        "id, status, price, runDate, stopDate, imageUrl, metadata, businessId, Businesses(name, businessAddress)",
      )
      .eq("id", id)
      .maybeSingle();
    return data;
  } catch (err) {
    console.error("[promotion page] failed to fetch for SEO:", err?.message);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const promotion = await fetchPromotion(id);
  if (!promotion) {
    return {
      title: "Promotion",
      description: "Discover local business promotions on Complisk.",
      alternates: { canonical: `/promotion/${id}` },
    };
  }
  const meta = promotion.metadata || {};
  const businessName = promotion.Businesses?.name || meta.businessName || "Local Business";
  const description = (
    meta.promotionDescription ||
    `Active deal from ${businessName} on Complisk.`
  ).slice(0, 200);
  return {
    title: `${businessName} — Local Deal`,
    description,
    alternates: { canonical: `/promotion/${id}` },
    openGraph: {
      title: `${businessName} on Complisk`,
      description,
      type: "website",
      url: `/promotion/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${businessName} on Complisk`,
      description,
    },
  };
}

function buildOfferSchema(promotion) {
  if (!promotion) return null;
  const meta = promotion.metadata || {};
  const businessName =
    promotion.Businesses?.name || meta.businessName || "Local Business";
  const businessAddress =
    promotion.Businesses?.businessAddress || meta.businessAddress;
  const description =
    meta.promotionDescription ||
    `Active deal from ${businessName} on Complisk.`;
  const url = `${SITE_URL}/promotion/${promotion.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    url,
    name: `${businessName} promotion`,
    description: description.slice(0, 500),
    price: Number(promotion.price ?? 0).toString(),
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    validFrom: promotion.runDate || undefined,
    validThrough: promotion.stopDate || undefined,
    image: promotion.imageUrl || undefined,
    offeredBy: {
      "@type": "LocalBusiness",
      name: businessName,
      address: businessAddress || undefined,
    },
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  const promotion = await fetchPromotion(id);
  const schema = buildOfferSchema(promotion);
  return (
    <>
      {schema ? <StructuredData data={schema} /> : null}
      <PromotionDetail />
    </>
  );
}
