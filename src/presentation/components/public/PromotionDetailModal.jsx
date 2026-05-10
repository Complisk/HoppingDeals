"use client";

// Public-facing promotion details modal — mirrors the live complisk.com layout:
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
            -translate-x-1/2 -translate-y-1/2
            w-[92vw] max-w-2xl max-h-[92vh]
            bg-background shadow-2xl rounded-lg
            overflow-hidden flex flex-col
          "
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">
            {businessName} promotion details
          </Dialog.Title>

          {/* Hero image with overlay buttons */}
          <div className="relative shrink-0">
            <PromotionVisualCard
              imageUrl={promotion.imageUrl}
              backgroundColor={promotion.backgroundColor}
              text={promotion.text}
              className="aspect-4/3 w-full rounded-none border-0"
            />

            {/* Save (wishlist) — top-left, pill style with heart */}
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              aria-label="Save promotion"
              className="absolute top-3 left-3 z-40 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-medium text-gray-800 shadow hover:bg-white"
            >
              <Heart
                className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`}
              />
              {saved ? "Saved" : "Save"}
            </button>

            {/* Close button — top-right */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="absolute top-3 right-3 z-40 rounded-full bg-white/95 p-2 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Details */}
          <div className="p-5 space-y-4 overflow-y-auto">
            <h2 className="text-xl font-semibold leading-tight">
              {businessName}
            </h2>

            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <span>{address}</span>
            </div>

            {dateRange && (
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>
                  <strong>Date:</strong> {dateRange}
                </span>
              </div>
            )}

            {timeRange && (
              <div className="flex items-start gap-2 text-sm">
                <Clock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>
                  <strong>Time:</strong> {timeRange}
                </span>
              </div>
            )}

            {description && (
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary shrink-0 mt-0.5">📝</span>
                <p className="whitespace-pre-line leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
              >
                <Globe className="h-4 w-4" />
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
