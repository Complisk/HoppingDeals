"use client";

// Per-category rows on the homepage. Each row corresponds to one category
// and lists the active promotions tagged with that category. When the
// filtered list is empty, we fall back to a right-aligned "No promotions
// available" line — mirrors the live complisk.com layout.
//
// Reads from the same Redux slice the main feed populates (promotion.featuredPromotions),
// so it doesn't trigger a second network request.

import { useState } from "react";
import { useSelector } from "react-redux";
import PromotionCard from "./PromotionCard";
import PromotionDetailModal from "./PromotionDetailModal";

// Category list mirrors the live deployment. Each entry has:
//   - title:  Display name, identical to the live site headers.
//   - match:  values to look for in promotion.categories[]. Supabase stores
//             these as kebab-case slugs (e.g. "beauty-spas", "general-merchandise-store").
//             Matching is case-insensitive and accepts either underscored
//             or ampersand spellings.
const CATEGORIES = [
  { title: "Restaurants", match: ["restaurants"] },
  { title: "Beauty & Spas", match: ["beauty-spas", "beauty-&-spas"] },
  { title: "Home & Garden", match: ["home-garden", "home-&-garden"] },
  { title: "Coffee & Tea", match: ["coffee-tea", "coffee-&-tea"] },
  { title: "Food", match: ["food"] },
  { title: "Auto Services", match: ["auto-services", "automotive"] },
  { title: "Pets", match: ["pets"] },
  { title: "Professional Services", match: ["professional-services"] },
  { title: "Health & Medical", match: ["health-medical", "health-&-medical"] },
  { title: "Event Planning & Services", match: ["event-planning-services", "event-planning-&-services"] },
  { title: "Hotels & Casinos", match: ["hotels-casinos", "hotels-&-casinos"] },
  { title: "Nightlife", match: ["nightlife"] },
  { title: "Active Life", match: ["active-life"] },
  { title: "Education", match: ["education"] },
  { title: "Arts & Entertainment", match: ["arts-entertainment", "arts-&-entertainment"] },
  { title: "Travel & Activities", match: ["travel-activities", "travel-&-activities"] },
  { title: "Online Shopping", match: ["online-shopping"] },
  { title: "Products", match: ["shopping", "general-merchandise-store"] },
];

function matchesCategory(promotion, matches) {
  const cats = promotion.categories || (promotion.category ? [promotion.category] : []);
  if (!cats.length) return false;
  const haystack = cats.map((c) => String(c).toLowerCase());
  return matches.some((needle) => haystack.includes(needle.toLowerCase()));
}

export default function CategoryPromotionRows() {
  const { featuredPromotions } = useSelector((state) => state.promotion);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [open, setOpen] = useState(false);

  const all = featuredPromotions || [];

  // Pre-filter: only render categories that actually have at least one
  // matching promotion. Avoids the wall of "No promotions available"
  // placeholder rows that the old version produced.
  const populated = CATEGORIES
    .map((cat) => ({ ...cat, items: all.filter((p) => matchesCategory(p, cat.match)) }))
    .filter((cat) => cat.items.length > 0);

  if (populated.length === 0) return null;

  return (
    <>
      <section className="py-8">
        <div className="container mx-auto px-4 space-y-12">
          {populated.map((cat) => (
            <div key={cat.title}>
              <div className="flex items-baseline justify-between mb-4 border-b border-border pb-2">
                <h3 className="text-xl md:text-2xl font-bold">{cat.title}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.items.map((promotion) => (
                  <PromotionCard
                    key={promotion.id}
                    promotion={promotion}
                    onClick={() => {
                      setSelectedPromotion(promotion);
                      setOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <PromotionDetailModal
        open={open}
        onOpenChange={setOpen}
        promotion={selectedPromotion}
      />
    </>
  );
}
