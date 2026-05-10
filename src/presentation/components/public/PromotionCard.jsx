"use client";

// Shared promotion card. Used by the homepage Featured grid and every
// per-category row. Mirrors the live complisk.com layout: a fixed-aspect
// image on top, then 3 rows of metadata underneath (business name,
// address, single-line description). The description is clamped to one
// line so cards stay uniform height regardless of how long the metadata
// is.
//
// Reads metadata gracefully so admin-created promotions (no joined
// Businesses row) still render — it falls back to promotion.metadata.*
// fields.

import { FileText, MapPin, Store } from "lucide-react";
import { PromotionVisualCard } from "../shared/PromotionVisualCard";

export default function PromotionCard({ promotion, onClick }) {
  const meta = promotion.metadata || {};
  const businessName =
    promotion.business?.name || meta.businessName || "Promotion";
  const address =
    promotion.business?.businessAddress ||
    meta.businessAddress ||
    "Multiple Locations";
  const description = meta.promotionDescription || "";

  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full text-left rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      <PromotionVisualCard
        imageUrl={promotion.imageUrl}
        backgroundColor={promotion.backgroundColor}
        text={promotion.text}
        showOverlay={false}
        className="aspect-4/3 rounded-lg"
      />

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Store className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate">{businessName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate">{address}</span>
        </div>
        {description && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span className="line-clamp-2">{description}</span>
          </div>
        )}
      </div>
    </button>
  );
}
