"use client";

// Mirrors the production complisk.com /category/<slug> page:
//   - Reads the slug, calls getPromotions({ category, state, city }) using the
//     user's stored location, refetches on the global "locationChanged" event.
//   - Renders a 2/3-column PromotionVisualCard grid, with loading skeletons,
//     error state, and an empty state.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Store } from "lucide-react";

import Header from "@/presentation/components/homePage/Header";
import Footer from "@/presentation/components/homePage/Footer";
import PromotionDetailModal from "@/presentation/components/public/PromotionDetailModal";
import { PromotionVisualCard } from "@/presentation/components/shared/PromotionVisualCard";
import { usePromotionService } from "@/presentation/services/promotionService";
import { categories } from "@/data/mockData";

const slugToTitle = (slug) =>
  String(slug || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const readStoredLocation = () => {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem("userLocation");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export default function CategoryPage({ slug }) {
  const { getPromotions } = usePromotionService();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const known = categories.find((c) => c.id === slug);
  const displayName = known?.name || slugToTitle(slug);

  const fetchPromotions = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const location = readStoredLocation();
      const res = await getPromotions({
        category: slug,
        state: location?.state_code,
        city: location?.city,
      });
      const list = Array.isArray(res) ? res : res?.promotions || res?.data || [];
      setPromotions(list);
    } catch {
      setError("Failed to load category promotions");
    } finally {
      setLoading(false);
    }
  }, [slug, getPromotions]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  useEffect(() => {
    const handler = () => fetchPromotions();
    window.addEventListener("locationChanged", handler);
    return () => window.removeEventListener("locationChanged", handler);
  }, [fetchPromotions]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {displayName} Promotions
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {loading
                  ? "Loading deals near you…"
                  : `${promotions.length} active deal${promotions.length === 1 ? "" : "s"} near you`}
              </p>
            </div>
            <Link href="/" className="underline text-sm text-primary">
              Back Home
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-72 bg-gray-200 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-muted-foreground py-12">
              {error}
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No promotions found for this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
              {promotions.map((promotion) => (
                <button
                  key={promotion.id}
                  type="button"
                  onClick={() => {
                    setSelected(promotion);
                    setOpen(true);
                  }}
                  className="text-left cursor-pointer space-y-2 group"
                >
                  <PromotionVisualCard
                    imageUrl={promotion.imageUrl}
                    backgroundColor={promotion.backgroundColor}
                    text={promotion.text}
                    showOverlay={false}
                    className="aspect-[4/5]"
                  />
                  <div className="flex items-center gap-2 text-sm font-medium px-1">
                    <Store className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">
                      {promotion?.business?.name || "Local business"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground px-1">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                    <span className="line-clamp-2">
                      {promotion?.business?.businessAddress ||
                        "Address not available"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <PromotionDetailModal
        open={open}
        onOpenChange={setOpen}
        promotion={selected}
      />
    </div>
  );
}
