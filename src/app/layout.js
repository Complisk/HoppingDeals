import { Outfit } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import AppProviders from "@/presentation/providers/app-providers";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || "https://hoppingdeals.world";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Hopping Deals | Local business promotions and deals",
    template: "%s · Hopping Deals",
  },
  description:
    "Find local promotions, flash deals, and limited-time offers from nearby businesses with Hopping Deals.",
  applicationName: "Hopping Deals",
  authors: [{ name: "Hopping Deals" }],
  keywords: [
    "local promotions",
    "business promotions",
    "local deals",
    "small business marketing",
    "geo targeted promotions",
    "Hopping Deals",
  ],
  alternates: {
    canonical: "/",
  },
  // Note: openGraph.images and twitter.images are intentionally omitted
  // here — Next.js auto-picks src/app/opengraph-image.js (rendered by
  // @vercel/og at request time, 1200×630, properly sized for social
  // platforms). Per-route opengraph-image.js files (e.g. for /promotion/
  // [id]) override this default.
  openGraph: {
    type: "website",
    title: "Hopping Deals | Local business promotions and deals",
    description:
      "Find local promotions, flash deals, and limited-time offers from nearby businesses with Hopping Deals.",
    url: "/",
    siteName: "Hopping Deals",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hopping Deals | Local business promotions and deals",
    description:
      "Find local promotions, flash deals, and limited-time offers from nearby businesses with Hopping Deals.",
  },
  icons: {
    // Multiple sizes so the browser picks the sharpest one for the tab,
    // bookmark, and home-screen icon.
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#dc2626",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AppProviders>{children}</AppProviders>
        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
      </body>
    </html>
  );
}
