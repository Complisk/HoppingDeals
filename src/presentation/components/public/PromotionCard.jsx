"use client";

// Shared promotion card. Used by the homepage Featured grid and every
// per-category row. Mirrors the live hoppingdeals.world layout: a fixed-aspect
// image on top, then 3 rows of metadata underneath (business name,
// address, single-line description). The description is clamped to one
// line so cards stay uniform height regardless of how long the metadata
// is.
//
// Only the image box gets the hover lift + border, matching the old
// frontend — the text rows below the image stay flat.
//
// Clicking the card opens PromotionDetailModal (the same modal the old
// frontend used). Callers can pass `onCardClick` to be notified, or
// `disableModal` to suppress the modal (e.g. when the parent already
// renders one).

import { useCallback, useState } from "react";
import { FileText, MapPin, Store } from "lucide-react";
import { PromotionVisualCard } from "../shared/PromotionVisualCard";
import PromotionDetailModal from "./PromotionDetailModal";

export default function PromotionCard({
  promotion,
  onCardClick,
  disableModal = false,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const meta = promotion.metadata || {};
  const businessName =
    promotion.business?.name || meta.businessName || "Promotion";
  const address =
    promotion.business?.businessAddress ||
    meta.businessAddress ||
    "Multiple Locations";
  const description = meta.promotionDescription || "";

  const handleClick = useCallback(() => {
    onCardClick?.(promotion);
    if (!disableModal) {
      setModalOpen(true);
    }
  }, [disableModal, onCardClick, promotion]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className="cursor-pointer p-1 relative group"
      >
        <div className="rounded-lg overflow-hidden border hover:shadow-lg transition relative">
          <PromotionVisualCard
            imageUrl={promotion.imageUrl}
            backgroundColor={promotion.backgroundColor}
            text={promotion.text}
            showOverlay={false}
            className="aspect-[4/4] md:aspect-[4/3]"
          />
        </div>

        <div className="flex items-center gap-1 mt-1 text-xs font-medium">
          <Store className="h-4 w-4 text-primary" />
          <span className="truncate">{businessName}</span>
        </div>
        <div className="flex items-center gap-1 mt-1 text-xs">
          <MapPin className="h-4 w-4 mt-0.5 text-primary" />
          <span className="line-clamp-1">{address}</span>
        </div>

        <span className="flex items-center w-full gap-1 mt-1 text-xs">
          <FileText size={15} className="text-primary" />
          <span className="line-clamp-2 w-[90%] whitespace-pre-wrap break-words">
            {description || "No description"}
          </span>
        </span>
      </div>

      {!disableModal && modalOpen && (
        <PromotionDetailModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          promotion={promotion}
        />
      )}
    </>
  );
}
