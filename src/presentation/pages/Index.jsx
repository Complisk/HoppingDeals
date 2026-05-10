"use client";

// Public homepage. Mirrors the live complisk.com layout: header, the new
// CategoryStreet cityscape (cars/airplane/buildings, day/night background),
// then the promotion feed, then the footer.

import Header from "@/presentation/components/homePage/Header";
import Footer from "@/presentation/components/homePage/Footer";
import CategoryStreet from "@/presentation/components/public/CategoryStreet";
import PromotionFeed from "@/presentation/components/public/PromotionFeed";
import CategoryPromotionRows from "@/presentation/components/public/CategoryPromotionRows";
import { useUserLocation } from "@/presentation/lib/useUserLocation";

export default function Index() {
  // Side-effect-only: ensures the location is cached early so the feed can
  // honour it on first render.
  useUserLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Tagline — mirrors the production strapline above the cityscape. */}
        <section className="bg-background px-4 py-8 md:py-10">
          <p className="mx-auto max-w-4xl text-center text-sm md:text-base font-semibold leading-relaxed text-foreground">
            Promotions and deals in your area, offered by local businesses.
            Deals are updated throughout the day and could expire quickly, so
            keep checking to catch the best savings before they end.
          </p>
        </section>
        <CategoryStreet />
        <div className="py-6 px-4 sm:px-8">
          <PromotionFeed selectedCategory={null} />
          <CategoryPromotionRows />
        </div>
      </main>
      <Footer />
    </div>
  );
}
