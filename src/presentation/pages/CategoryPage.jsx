"use client";

// Mirrors the production complisk.com /category/<slug> page:
//   - Reads the slug, calls getPromotions({ category, state, city }) using the
//     user's stored location, refetches on the global "locationChanged" event.
//   - Renders a 2/3-column PromotionVisualCard grid, with loading skeletons,
//     error state, and an empty state.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import Header from "@/presentation/components/homePage/Header";
import Footer from "@/presentation/components/homePage/Footer";
import PromotionDetailModal from "@/presentation/components/public/PromotionDetailModal";
import PromotionCard from "@/presentation/components/public/PromotionCard";
import { usePromotionService } from "@/presentation/services/promotionService";
import { categories } from "@/data/mockData";

// Defensively decode a slug up to twice so URLs like /category/coffee-%26-tea
// (already once-encoded) and /category/coffee-%2526-tea (double-encoded by
// older code) both land back on "coffee-&-tea" before we use it.
function decodeSlug(slug) {
  let v = String(slug || "");
  for (let i = 0; i < 2; i++) {
    try {
      const next = decodeURIComponent(v);
      if (next === v) break;
      v = next;
    } catch {
      break;
    }
  }
  return v;
}

// Render a slug like "coffee-&-tea" or "restaurants,food" as a human title:
//   "Coffee & Tea"   "Restaurants, Food"
function slugToTitle(slug) {
  return String(slug || "")
    .split(",")
    .map((part) =>
      part
        .trim()
        .split("-")
        .filter(Boolean)
        .map((word) => (word === "&" ? "&" : word.charAt(0).toUpperCase() + word.slice(1)))
        .join(" ")
        .replace(/\s+&\s+/g, " & "),
    )
    .filter(Boolean)
    .join(", ");
}

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

  // The CategoryStreet on the homepage links to multi-category URLs
  // like /category/restaurants,food and /category/food,coffee-&-tea,
  // restaurants. Decode the param (Turbopack / typed URLs sometimes hand
  // it over still-encoded) and split on commas. We memoize so the title
  // doesn't show "Coffee %26 Tea" before the effect has run.
  const slugParts = useMemo(() => {
    const decoded = decodeSlug(slug);
    return decoded
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [slug]);

  // Pretty title. If exactly one slug AND it's in our known list, use the
  // canonical display name; otherwise fall back to a humanized slug.
  const displayName = useMemo(() => {
    if (slugParts.length === 1) {
      const single = slugParts[0];
      const known = categories.find(
        (c) =>
          c.id === single ||
          c.id.replace(/&/g, "and") === single.replace(/&/g, "and"),
      );
      if (known) return known.name;
    }
    return slugToTitle(slugParts.join(","));
  }, [slugParts]);

  // usePromotionService rebuilds {getPromotions} on every render, so it's
  // a fresh reference each time. If we use it directly in a useEffect
  // dep array we'd loop forever. Stash the latest version in a ref and
  // depend only on slug + the locationChanged event.
  const getPromotionsRef = useRef(getPromotions);
  useEffect(() => {
    getPromotionsRef.current = getPromotions;
  });

  // Stable comma-joined string for the effect's dep array.
  const slugQuery = slugParts.join(",");

  useEffect(() => {
    if (!slugQuery) return;
    let cancelled = false;

    const fetchPromotions = async () => {
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
      try {
        const location = readStoredLocation();
        // Pass the comma-joined slug list — the API splits it again on
        // the server. Empty parts are filtered, so a single slug still
        // serializes to just that slug.
        const res = await getPromotionsRef.current({
          category: slugQuery,
          state: location?.state_code,
          city: location?.city,
        });
        if (cancelled) return;
        // promotionService.getPromotions returns the raw {response, error}
        // shape from fetchData when given to call() without destructuring.
        // Unwrap it before falling back to a plain-array response.
        const payload = res?.response ?? res;
        const list = Array.isArray(payload)
          ? payload
          : payload?.promotions || payload?.data || [];
        setPromotions(list);
      } catch {
        if (!cancelled) setError("Failed to load category promotions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPromotions();
    const handler = () => fetchPromotions();
    window.addEventListener("locationChanged", handler);
    return () => {
      cancelled = true;
      window.removeEventListener("locationChanged", handler);
    };
  }, [slugQuery]);

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promotion) => (
                <PromotionCard
                  key={promotion.id}
                  promotion={promotion}
                  onClick={() => {
                    setSelected(promotion);
                    setOpen(true);
                  }}
                />
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
