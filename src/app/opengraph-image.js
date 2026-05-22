// Site-wide default Open Graph image. Rendered by @vercel/og at request
// time, cached by Next, served at /opengraph-image. Layout's
// openGraph.images can therefore drop the static PNG and Next will
// auto-pick this one up.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Hopping Deals · Local business promotions and deals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, #1A1110 0%, #2a1a18 50%, #E31E24 200%)",
          color: "white",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "24px",
              background: "#E31E24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "72px",
              fontWeight: 800,
            }}
          >
            %
          </div>
          <div
            style={{
              fontSize: "108px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            Hopping Deals
          </div>
        </div>
        <div
          style={{
            fontSize: "44px",
            color: "#e5e5e5",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.3,
          }}
        >
          Local business promotions, flash deals, and limited-time offers
          near you
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            fontSize: "28px",
            color: "#9ca3af",
            letterSpacing: "0.05em",
          }}
        >
          hoppingdeals.world
        </div>
      </div>
    ),
    { ...size },
  );
}
