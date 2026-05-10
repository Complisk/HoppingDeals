"use client";

// /business/promotion-templates — lists the business's saved templates.
// Mirrors the production layout: heading + subhead, "Create Template" CTA
// in the top-right, then either a grid of saved templates or the
// "No templates found" empty state with an inline link to create one.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useToast } from "@/presentation/hooks/use-toast";
import OptimizeImage from "@/presentation/components/shared/OptimizeImage";
import { extractCloudinaryPublicId } from "@/presentation/lib/extractCloudinaryPublicId";

export default function PromotionTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/business/promotion-templates");
        if (!res.ok) {
          if (!cancelled) setTemplates([]);
          return;
        }
        const data = await res.json();
        if (!cancelled) setTemplates(Array.isArray(data) ? data : data.items || []);
      } catch (err) {
        if (!cancelled) {
          toast({
            title: "Could not load templates",
            description: err?.message || "Try again in a moment.",
            variant: "destructive",
          });
          setTemplates([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Promotion Templates</h1>
          <p className="text-muted-foreground mt-1">
            Choose a saved template to launch promotions faster
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link href="/business/promotion-templates/create">
            <Plus className="h-5 w-5 mr-2" />
            Create Template
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          No templates found. Create your first{" "}
          <Link
            href="/business/promotion-templates/create"
            className="text-primary hover:underline"
          >
            template
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-xl border border-border overflow-hidden bg-card hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-4/3 bg-muted">
                {tpl.imageUrl && (
                  <OptimizeImage
                    publicId={extractCloudinaryPublicId(tpl.imageUrl)}
                    ar="4:3"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate">{tpl.name || "Untitled"}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
