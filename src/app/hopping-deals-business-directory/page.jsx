import Header from "@/presentation/components/homePage/Header";
import Footer from "@/presentation/components/homePage/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || "https://hoppingdeals.world";

export const metadata = {
  title: "Hopping Deals Business Directory",
  description:
    "Support local with Hopping Deals and discover businesses powering our platform.",
  alternates: { canonical: "/hopping-deals-business-directory" },
  openGraph: {
    title: "Hopping Deals Business Directory",
    description:
      "Support local with Hopping Deals and discover businesses powering our platform.",
    url: "/hopping-deals-business-directory",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hopping Deals Business Directory",
    description:
      "Support local with Hopping Deals and discover businesses powering our platform.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Hopping Deals Business Directory",
  url: `${SITE_URL}/hopping-deals-business-directory`,
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />

      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-grow px-4 py-4 md:py-28 sm:px-8">
          <section className="mx-auto max-w-5xl">
            <h1 className="text-3xl font-extrabold text-center tracking-tight text-slate-900 sm:text-4xl">
              Hopping Deals Business Directory
            </h1>

            <p className="mt-5 text-base leading-8 text-slate-700 sm:text-lg">
              Support Local with Hopping Deals! Discover the incredible businesses
              that power our platform. Whether they have already shared
              exclusive offers with our users or are gearing up for future
              launches, these merchants are committed to excellence. Join us in
              championing local entrepreneurship.
            </p>

            <div className="mt-20">
              <img
                src="/new-assets/hopping-deals-business-directory-snip.PNG"
                alt="Hopping Deals Business Directory"
                className="h-auto max-h-[560px] w-full object-contain"
                loading="lazy"
              />
            </div>

            <div className="mt-8 border-t-2 border-red-600 pt-3 text-center text-sm font-semibold tracking-wide text-red-700 sm:text-3xl">
              COMING SOON
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
