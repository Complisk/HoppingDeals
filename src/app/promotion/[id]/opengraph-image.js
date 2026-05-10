// Per-promotion OG image. When someone shares /promotion/<id> on a
// social platform, the platform fetches /promotion/<id>/opengraph-image
// and embeds the result. We render a 1200x630 PNG at the edge with the
// business name + promotion description + a thumbnail of the promo
// image, so social cards look real instead of using the generic logo.
//
// Note: edge runtime can't use the service-role Supabase client (uses
// node:crypto). So we hit Supabase via the publishable-key client which
// works at the edge. Active promotions are publicly readable per RLS.

import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Complisk promotion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function fetchPromotion(id) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon || !id) return null;
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });
  const { data } = await supabase
    .from("Promotions")
    .select(
      "id, imageUrl, metadata, businessId, Businesses(name, businessAddress)",
    )
    .eq("id", id)
    .maybeSingle();
  return data;
}

// Force a Cloudinary URL to a 600x600 thumbnail so the OG image loads
// quickly. If the URL doesn't look like a Cloudinary upload, hand it
// back unchanged.
function toThumb(url) {
  if (!url) return null;
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace(
    /\/image\/upload\//,
    "/image/upload/f_auto,q_auto,w_600,h_600,c_fill/",
  );
}

export default async function Image({ params }) {
  const { id } = params;
  const promotion = await fetchPromotion(id);

  const meta = promotion?.metadata || {};
  const businessName =
    promotion?.Businesses?.name || meta.businessName || "Local Business";
  const description =
    (meta.promotionDescription || "Find this deal on Complisk").slice(0, 220);
  const thumb = toThumb(promotion?.imageUrl);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#1A1110",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Left half — promotion thumbnail */}
        <div
          style={{
            width: "50%",
            height: "100%",
            background: thumb ? `#000` : "#2a1a18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt=""
              width={600}
              height={600}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                fontSize: "200px",
                fontWeight: 800,
                color: "#E31E24",
              }}
            >
              %
            </div>
          )}
        </div>

        {/* Right half — text */}
        <div
          style={{
            width: "50%",
            height: "100%",
            padding: "60px 50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "28px",
              fontWeight: 800,
              color: "#E31E24",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: "#E31E24",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
              }}
            >
              %
            </div>
            Complisk
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                fontSize: "52px",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {businessName}
            </div>
            <div
              style={{
                fontSize: "26px",
                color: "#d1d5db",
                lineHeight: 1.4,
              }}
            >
              {description}
            </div>
          </div>

          <div
            style={{
              fontSize: "22px",
              color: "#9ca3af",
              letterSpacing: "0.05em",
            }}
          >
            complisk.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
