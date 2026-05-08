"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { Check, Upload, Loader2 } from "lucide-react";
import { useTemplateService } from "@/presentation/services/templateService";
import { uploadImageToCloudinary } from "@/presentation/lib/cloudinaryUtils";
import { cn } from "@/presentation/lib/utils";
import OptimizeImage from "../shared/OptimizeImage";
const TemplateItem = memo(
  ({ id, cloudinaryPublicId, isSelected, onSelectId }) => {
    const handleClick = useCallback(() => {
      onSelectId(id);
    }, [id, onSelectId]);
    return (
      <button
        onClick={handleClick}
        className={cn(
          "relative aspect-[4/3] overflow-hidden border border-border",
          isSelected
            ? "ring-4 ring-primary ring-offset-2"
            : "hover:ring-2 hover:ring-primary/50",
        )}
      >
        <OptimizeImage publicId={cloudinaryPublicId} />
        {isSelected && (
          <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
      </button>
    );
  },
  (prev, next) => prev.isSelected === next.isSelected,
);
export const TemplateSelector = memo(
  ({ selectedTemplate, customImage, onTemplateSelect, onImageUpload }) => {
    const fileInputRef = useRef(null);
    const { getTemplates } = useTemplateService();
    const [uploadedTemplates, setUploadedTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    // fetch templates once
    useEffect(() => {
      let canceled = false;
      const fetch = async () => {
        setLoadingTemplates(true);
        try {
          const res = await getTemplates();
          setUploadedTemplates(res?.response || []);
        } catch (err) {
          console.error(err);
        } finally {
          if (!canceled) setLoadingTemplates(false);
        }
      };
      fetch();
      return () => {
        canceled = true;
      };
    }, []);
    // isolate upload state
    const handleUpload = useCallback(
      async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        try {
          const imageUrl = await uploadImageToCloudinary(file);
          if (imageUrl) onImageUpload(imageUrl);
        } finally {
          setUploadingImage(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      [onImageUpload],
    );
    // stable callback for selecting template
    const handleSelectId = useCallback(
      (id) => {
        const found = uploadedTemplates.find((t) => t.id === id);
        if (found) onTemplateSelect({ id: found.id, imageUrl: found.imageUrl });
      },
      [uploadedTemplates, onTemplateSelect],
    );
    return (
      <div className="space-y-6">
        {/* UPLOAD AREA */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />

        <div
          className={cn(
            "p-4 border-2 border-dashed cursor-pointer transition-all",
            customImage
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50",
            uploadingImage && "opacity-50 cursor-not-allowed",
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex items-center gap-4">
            {uploadingImage ? (
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            ) : customImage ? (
              <>
                <img
                  src={customImage}
                  loading="lazy"
                  decoding="async"
                  alt="Custom"
                  className="w-16 h-16 object-cover"
                />
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Enter your custom template image
                </span>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Enter your custom template image
                </span>
              </>
            )}
          </div>
        </div>

        {/* TEMPLATES GRID */}
        {loadingTemplates ? (
          <TemplateBoxSkeleton />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {uploadedTemplates.map((template) => (
              <TemplateItem
                key={template.id}
                id={template.id}
                cloudinaryPublicId={template.cloudinaryPublicId}
                isSelected={selectedTemplate === template.id}
                onSelectId={handleSelectId}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);
// ---- MEMOIZED SKELETON ----
const TemplateBoxSkeletonComponent = ({ count = 12 }) => (
  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="aspect-[4/3] bg-muted rounded-xl animate-pulse" />
    ))}
  </div>
);
export const TemplateBoxSkeleton = memo(TemplateBoxSkeletonComponent);
TemplateBoxSkeleton.displayName = "TemplateBoxSkeleton";
