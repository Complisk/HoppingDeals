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
        url: "/complisk-logo.png",
        width: 583,
        height: 287,
        alt: "Complisk local business promotions platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Complisk | Local business promotions and deals",
    description:
      "Find local promotions, flash deals, and limited-time offers from nearby businesses with Complisk.",
    images: ["/complisk-logo.png"],
  },
  icons: {
    icon: "/complisk-logo.png",
    shortcut: "/complisk-logo.png",
    apple: "/complisk-logo.png",
  },
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
