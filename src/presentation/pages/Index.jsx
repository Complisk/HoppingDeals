"use client";

// Public homepage. Mirrors the live complisk.com layout: header, the new
// CategoryStreet cityscape (cars/airplane/buildings, day/night background),
// then the promotion feed, then the footer.

import Header from "@/presentation/components/homePage/Header";
import Footer from "@/presentation/components/homePage/Footer";
import CategoryStreet from "@/presentation/components/public/CategoryStreet";
import PromotionFeed from "@/presentation/components/public/PromotionFeed";
import { useUserLocation } from "@/presentation/lib/useUserLocation";

export default function Index() {
  // Side-effect-only: ensures the location is cached early so the feed can
  // honour it on first render.
  useUserLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <CategoryStreet />
        <div className="py-6 px-4 sm:px-8">
          <PromotionFeed selectedCategory={null} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
