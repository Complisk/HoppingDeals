"use client";

// Public-facing promotion details modal — mirrors the live hoppingdeals.world layout:
// the hero image at the top, then a card below with business name, address,
// formatted date range, formatted time range, the rich description (from
// metadata.promotionDescription), and a Website Link CTA. Save (wishlist)
// button sits over the hero image. Falls back to metadata.* fields when the
// joined Businesses row is absent (admin-created promotions have no business).

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Calendar,
  Clock,
  FileText,
  Globe,
  Heart,
  MapPin,
  X,
} from "lucide-react";
import { PromotionVisualCard } from "../shared/PromotionVisualCard";

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Accepts "10:30:00", "10:30", "22:00:00" — returns "10:30 AM" / "10:00 PM".
function formatTime(value) {
  if (!value) return null;
  const [hStr, mStr] = String(value).split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${String(m).padStart(2, "0")} ${period}`;
}

const PromotionDetailModal = ({ open, onOpenChange, promotion }) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!promotion) return null;

  const meta = promotion.metadata || {};

  const businessName =
    promotion.business?.name || meta.businessName || "Promotion";
  const address =
    promotion.business?.businessAddress ||
    meta.businessAddress ||
    "Multiple Locations";
  const description = meta.promotionDescription || "";
  const websiteUrl = meta.websiteUrl || null;

  const startDate = formatDate(promotion.runDate);
  const endDate = formatDate(promotion.stopDate);
  const dateRange =
    startDate && endDate
      ? `${startDate} - ${endDate}`
      : startDate || endDate || null;

  const startTime = formatTime(promotion.runTime);
  const endTime = formatTime(promotion.stopTime);
  const timeRange =
    startTime && endTime
      ? `${startTime} - ${endTime}`
      : startTime || endTime || null;

  async function onSave() {
    if (saving || saved) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/users/wishlist/${encodeURIComponent(promotion.id)}`,
        { method: "POST" },
      );
      // 200 -> saved; 401 -> not logged in; ignore the rest silently to
      // match the production "Save" button's quiet behaviour.
      if (res.ok) setSaved(true);
    } catch {
      // No-op; the wishlist is best-effort UX.
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />

        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 z-50
            w-[90vw] md:h-[90vh] h-[90vh] md:w-[30vw]
            -translate-x-1/2 -translate-y-1/2
            bg-background shadow-xl overflow-hidden
          "
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">
            {businessName} promotion details
          </Dialog.Title>

          {/* Image Section — top 50% */}
          <div className="relative h-[50%]">
            <PromotionVisualCard
              imageUrl={promotion.imageUrl}
              backgroundColor={promotion.backgroundColor}
              text={promotion.text}
              modal
              className="h-full rounded-none border-0 bg-slate-700"
            />

            {/* Close */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="absolute top-3 right-3 z-40 rounded-full bg-white/90 p-2 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Wishlist */}
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              aria-label="Save promotion"
              className={`absolute top-3 left-3 z-40 flex items-center gap-1 rounded-full p-2 px-3 text-sm font-medium transition-colors ${
                saved
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-white" : ""}`} />
              {saved ? "Remove" : "Save"}
            </button>
          </div>

          {/* Details Section — bottom 50%, scrollable */}
          <div className="p-5 space-y-4 overflow-y-auto h-[50%]">
            <h2 className="text-lg font-semibold">{businessName}</h2>

            {/* Address */}
            <div className="flex gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 text-primary" />
              {address}
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span>
                <strong>Date :</strong> {dateRange || "Not available"}
              </span>
            </div>

            {/* Time Range */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>
                <strong>Time :</strong> {timeRange || "Not available"}
              </span>
            </div>

            {/* Description */}
            <div className="flex items-start w-full gap-2 text-xs">
              <FileText size={15} className="text-primary mt-0.5" />
              <span className="w-[90%] whitespace-pre-wrap break-words">
                {description || "No description"}
              </span>
            </div>

            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-fit items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                <Globe className="h-4 w-4 text-primary" />
                Website Link
              </a>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PromotionDetailModal;
