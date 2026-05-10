"use client";

// /business/promotion-templates/create — Build a reusable template the
// business can launch promotions from. Mirrors the production layout:
//   Step 1: Pick a background — upload your own OR pick from the presets
//   Step 2: Customize text — add text elements, live preview, save

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  HelpCircle,
  Plus,
  Trash2,
  Crop as CropIcon,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Textarea } from "@/presentation/components/ui/textarea";
import { useToast } from "@/presentation/hooks/use-toast";
import { uploadImageToCloudinary } from "@/presentation/lib/cloudinaryUtils";

// Six preset background tiles (matching the production grid). The first
// row is solid colours, the second row uses Cloudinary stock imagery.
// Customers picked from these directly on the live site.
const PRESET_BACKGROUNDS = [
  { id: "green", kind: "color", label: "Green", value: "#22C55E" },
  { id: "blue", kind: "color", label: "Blue", value: "#3B82F6" },
  { id: "money", kind: "image", label: "Currency", value: "https://images.unsplash.com/photo-1554260570-e9689a3418b8?w=900&q=80&auto=format&fit=crop" },
  { id: "flag", kind: "image", label: "American Flag", value: "https://images.unsplash.com/photo-1601424420578-3eaa6e9da93f?w=900&q=80&auto=format&fit=crop" },
  { id: "boba", kind: "image", label: "Drinks", value: "https://images.unsplash.com/photo-1558857563-c0c6ee6ff8a1?w=900&q=80&auto=format&fit=crop" },
  { id: "blueprint", kind: "image", label: "Blueprint", value: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=80&auto=format&fit=crop" },
  { id: "deep-blue", kind: "image", label: "Deep Blue", value: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=900&q=80&auto=format&fit=crop" },
  { id: "pastel", kind: "image", label: "Pastel", value: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=900&q=80&auto=format&fit=crop" },
  { id: "blocks", kind: "image", label: "Blocks", value: "https://images.unsplash.com/photo-1620207418302-439b387441b0?w=900&q=80&auto=format&fit=crop" },
  { id: "leaves", kind: "image", label: "Leaves", value: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=900&q=80&auto=format&fit=crop" },
  { id: "cafe", kind: "image", label: "Cafe", value: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=900&q=80&auto=format&fit=crop" },
];

const newTextElement = () => ({
  id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
  content: "",
  x: 50,
  y: 50,
  fontSize: "24",
  color: "#ffffff",
});

export default function CreateTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [imageBackground, setImageBackground] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [textElements, setTextElements] = useState([newTextElement()]);
  const [selectedTextId, setSelectedTextId] = useState(textElements[0].id);

  const selectedText = useMemo(
    () => textElements.find((t) => t.id === selectedTextId) || textElements[0],
    [textElements, selectedTextId],
  );

  const previewBackground = imageBackground;

  function patchSelectedText(patch) {
    setTextElements((arr) =>
      arr.map((t) => (t.id === selectedTextId ? { ...t, ...patch } : t)),
    );
  }
  function addTextElement() {
    const t = newTextElement();
    setTextElements((arr) => [...arr, t]);
    setSelectedTextId(t.id);
  }
  function deleteTextElement(id) {
    setTextElements((arr) => {
      const next = arr.filter((t) => t.id !== id);
      if (next.length === 0) {
        const replacement = newTextElement();
        setSelectedTextId(replacement.id);
        return [replacement];
      }
      if (id === selectedTextId) setSelectedTextId(next[0].id);
      return next;
    });
  }
  function pickPreset(preset) {
    if (preset.kind === "color") {
      setImageBackground({ kind: "color", value: preset.value });
      setImageUrl(null);
    } else {
      setImageBackground({ kind: "image", value: preset.value });
      setImageUrl(preset.value);
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setImageUrl(url);
      setImageBackground({ kind: "image", value: url });
      toast({ title: "Image uploaded" });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err?.message || "Try a different image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      toast({
        title: "Name your template",
        description: "Give the template a short label so you can find it later.",
        variant: "destructive",
      });
      return;
    }
    if (!imageBackground) {
      toast({
        title: "Pick a background",
        description: "Upload an image or pick one of the presets.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/business/promotion-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          imageUrl: imageBackground.kind === "image" ? imageBackground.value : "",
          backgroundColor: imageBackground.kind === "color" ? imageBackground.value : "",
          text: textElements,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Save failed (${res.status})`);
      }
      toast({ title: "Template saved" });
      router.push("/business/promotion-templates");
    } catch (err) {
      toast({
        title: "Could not save template",
        description: err?.message || "Try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Create Template</h1>
          <p className="text-muted-foreground mt-1">
            Build your style template now and save it for quick reuse
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/business/promotion-templates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="space-y-2 max-w-md">
          <Label htmlFor="template-name">Template Name</Label>
          <Input
            id="template-name"
            placeholder="My branded promo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Step 1 — Pick a background */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-primary hover:bg-primary/10 transition-colors disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
              <span className="font-medium">
                {uploading ? "Uploading..." : "Upload your custom template image"}
              </span>
            </button>
            <span
              className="text-muted-foreground"
              title="Or pick a background from the presets below"
            >
              <HelpCircle className="h-5 w-5" />
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PRESET_BACKGROUNDS.map((preset) => {
              const isSelected =
                imageBackground &&
                imageBackground.kind === preset.kind &&
                imageBackground.value === preset.value;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => pickPreset(preset)}
                  aria-label={preset.label}
                  className={
                    "relative aspect-4/3 rounded-lg overflow-hidden border-2 transition-all " +
                    (isSelected
                      ? "border-primary ring-2 ring-primary/40"
                      : "border-transparent hover:border-primary/50")
                  }
                  style={
                    preset.kind === "color"
                      ? { backgroundColor: preset.value }
                      : {
                          backgroundImage: `url(${preset.value})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                  }
                />
              );
            })}
          </div>
        </section>

        {/* Step 2 — Customize text */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              Step 2
            </span>
            <h2 className="text-lg font-semibold">Customize Text</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Live Preview</Label>
                <Button variant="outline" size="sm" disabled>
                  <CropIcon className="h-4 w-4 mr-2" />
                  Crop Image
                </Button>
              </div>
              <div
                className="relative aspect-4/3 rounded-lg overflow-hidden border border-border"
                style={
                  previewBackground?.kind === "color"
                    ? { backgroundColor: previewBackground.value }
                    : previewBackground?.kind === "image"
                      ? {
                          backgroundImage: `url(${previewBackground.value})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : { backgroundColor: "#f1f5f9" }
                }
              >
                {textElements.map((t) => (
                  <span
                    key={t.id}
                    className="absolute font-bold drop-shadow-lg whitespace-pre-wrap text-center"
                    style={{
                      left: `${t.x}%`,
                      top: `${t.y}%`,
                      transform: "translate(-50%, -50%)",
                      fontSize: `${t.fontSize}px`,
                      color: t.color,
                      lineHeight: 1.3,
                      width: "100%",
                      pointerEvents: "none",
                    }}
                  >
                    {t.content}
                  </span>
                ))}
              </div>
            </div>

            {/* Text Elements list + editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Text Elements ({textElements.length})</Label>
                <Button variant="outline" size="sm" onClick={addTextElement}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Text
                </Button>
              </div>

              <div className="space-y-2">
                {textElements.map((t) => {
                  const active = t.id === selectedTextId;
                  return (
                    <div
                      key={t.id}
                      className={
                        "flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer " +
                        (active
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted")
                      }
                      onClick={() => setSelectedTextId(t.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {t.content || "Empty text"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Position: ({t.x}, {t.y}) • Size: {t.fontSize}px
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTextElement(t.id);
                        }}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Delete text element"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="text-content">Text Content</Label>
                <Textarea
                  id="text-content"
                  placeholder="Enter text"
                  rows={3}
                  value={selectedText?.content || ""}
                  onChange={(e) => patchSelectedText({ content: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">X (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={selectedText?.x ?? 50}
                    onChange={(e) =>
                      patchSelectedText({ x: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Y (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={selectedText?.y ?? 50}
                    onChange={(e) =>
                      patchSelectedText({ y: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Size (px)</Label>
                  <Input
                    type="number"
                    min={8}
                    max={120}
                    value={selectedText?.fontSize ?? 24}
                    onChange={(e) =>
                      patchSelectedText({ fontSize: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedText?.color || "#ffffff"}
                    onChange={(e) => patchSelectedText({ color: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer p-0.5"
                  />
                  <Input
                    value={selectedText?.color || "#ffffff"}
                    onChange={(e) => patchSelectedText({ color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" asChild>
            <Link href="/business/promotion-templates">Cancel</Link>
          </Button>
          <Button variant="hero" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Template
          </Button>
        </div>
      </div>
    </div>
  );
}
