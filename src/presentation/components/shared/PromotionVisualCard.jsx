"use client";

import React, { Children } from "react";
import { cn } from "@/presentation/lib/utils";
import OptimizeImage from "./OptimizeImage";
import { extractCloudinaryPublicId } from "@/presentation/lib/extractCloudinaryPublicId";
export const PromotionVisualCard = ({
  imageUrl,
  backgroundColor,
  text = [],
  showOverlay = true,
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-muted  border border-border",
        className,
      )}
    >
      {/* Image Layer */}
      {imageUrl && (
        <div
          className="relative w-full h-full"
          style={{
            filter:
              backgroundColor === 50
                ? "brightness(50%)"
                : backgroundColor === 70
                  ? "brightness(30%)"
                  : backgroundColor === 100
                    ? "brightness(0%)"
                    : "brightness(100%)",
          }}
        >
          <OptimizeImage publicId={extractCloudinaryPublicId(imageUrl)} />
        </div>
      )}
      {text?.length > 0 && (
        <div className="absolute left-0 right-0 inset-0 z-30 pointer-events-none ">
          {text?.map((textItem, index) => (
            <span
              key={index}
              style={{
                position: "absolute",
                left: `${textItem.x}%`,
                top: `${textItem.y}%`,
                transform: "translate(-50%, -50%)",
                fontSize: `${textItem.fontSize}px`,
                color: textItem.color,
                lineHeight: 1.3,
                whiteSpace: "pre-wrap", // ✅ this preserves line breaks
                textAlign: "center",
                wordBreak: "break-word",
                width: "100%",
              }}
              className="font-bold drop-shadow-lg"
            >
              {textItem.content}
            </span>
          ))}
        </div>
      )}

      {/* Custom Children (Badges etc) */}
      {children}
    </div>
  );
};
