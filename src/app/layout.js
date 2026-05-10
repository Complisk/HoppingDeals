import { Outfit } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import AppProviders from "@/presentation/providers/app-providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || "https://complisk.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Complisk | Local business promotions and deals",
    template: "%s · Complisk",
  },
  description:
    "Find local promotions, flash deals, and limited-time offers from nearby businesses with Complisk.",
  applicationName: "Complisk",
  authors: [{ name: "Complisk" }],
  keywords: [
    "local promotions",
    "business promotions",
    "local deals",
    "small business marketing",
    "geo targeted promotions",
    "Complisk",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Complisk | Local business promotions and deals",
    description:
      "Find local promotions, flash deals, and limited-time offers from nearby businesses with Complisk.",
    url: "/",
    siteName: "Complisk",
    images: [
      {
        url: "/logo-512.png",
        width: 512,
        height: 512,
        alt: "Complisk local business promotions platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Complisk | Local business promotions and deals",
    description:
      "Find local promotions, flash deals, and limited-time offers from nearby businesses with Complisk.",
    images: ["/logo-512.png"],
  },
  icons: {
    // Multiple sizes so the browser can pick the sharpest one for the
    // tab / bookmark / device. Production complisk.com uses these same
    // assets — they live in /public.
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
      </body>
    </html>
  );
}
