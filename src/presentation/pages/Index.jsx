"use client";

// Public homepage. Mirrors the live hoppingdeals.world layout:
//   Header → Hero → Categories (cityscape) → 4× CategoryCarousel → Footer.

import Header from "@/presentation/components/homePage/Header";
import Footer from "@/presentation/components/homePage/Footer";
import Hero from "@/presentation/components/homePage/Hero";
import CouponCategories from "@/presentation/components/homePage/CouponCategories";
import CategoryCarousel from "@/presentation/components/public/CategoryCarousel";
import { useUserLocation } from "@/presentation/lib/useUserLocation";

export default function Index() {
  // Side-effect-only: ensures the location is cached early so the feed can
  // honour it on first render.
  useUserLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header overlay />
      <main className="flex-grow">
        <Hero />
        <CouponCategories />
        <CategoryCarousel
          title="Featured Promotion"
          excludeCategories={[
            "general-merchandise-store",
            "online-shopping",
            "shopping",
          ]}
        />

        <CategoryCarousel
          title="Food & Drinks"
          categories={["restaurants", "coffee-&-tea", "food"]}
        />
        <CategoryCarousel
          title="Beauty & Spas"
          categories={["beauty-&-spas"]}
        />
        <CategoryCarousel
          title="Products"
          categories={[
            "general-merchandise-store",
            "online-shopping",
            "shopping",
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
