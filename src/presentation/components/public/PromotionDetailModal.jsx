"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Clock, MapPin, X } from "lucide-react";
import { PromotionVisualCard } from "../shared/PromotionVisualCard";
const PromotionDetailModal = ({ open, onOpenChange, promotion }) => {
  if (!promotion) return null;
  const startDate = `${promotion?.runTime}`;
  const endDate = `${promotion?.stopTime}`;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />

        {/* Centered Modal */}
        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 z-50
  w-[90vw]            md:h-[60vh] h-[70vh] md:w-[30vw] 
            -translate-x-1/2 -translate-y-1/2  bg-background shadow-xl
            overflow-hidden
          "
        >
          {/* Image + Text */}
          <div className="relative h-[50%] ">
            <PromotionVisualCard
              imageUrl={promotion.imageUrl}
              backgroundColor={promotion.backgroundColor}
              text={promotion.text}
              className="h-[100%] rounded-none border-0 bg-slate-700"
            />

            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-3 z-40 rounded-full bg-white/90 p-2 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Details */}
          <div className="p-5 space-y-4">
            {/* Business Name */}
            <h2 className="text-lg font-semibold">
              {promotion.business?.name}
            </h2>

            {/* Address */}
            <div className="flex gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 text-primary" />
              {promotion.business?.businessAddress || "Address not available"}
            </div>

            {/* Run Time */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>
                <strong>Run:</strong> {startDate}
              </span>
            </div>

            {/* Stop Time */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>
                <strong>Stop:</strong> {endDate}
              </span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
export default PromotionDetailModal;
