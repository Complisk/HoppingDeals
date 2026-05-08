"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/presentation/hooks/use-toast";
import { usePromotionService } from "@/presentation/services/promotionService";
import { useTemplateService } from "@/presentation/services/templateService";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Badge } from "@/presentation/components/ui/badge";
import { TextCustomizer } from "@/presentation/components/business/TextCustomizer";
import { TemplateSelector } from "@/presentation/components/business/TemplateSelector";
import {
  Calendar,
  Clock,
  MapPin,
  Globe,
  ChevronLeft,
  Loader2,
  Check,
} from "lucide-react";
import { format } from "date-fns";
const EditPromotion = ({ isVisitor = false }) => {
  const { promotionId } = useParams();
  const navigate = useRouter();
  const { toast } = useToast();
  const { getPromotionById, updatePromotion } = usePromotionService();
  const { getTemplates } = useTemplateService();
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  // Template & Image State
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [customImage, setCustomImage] = useState(null);
  const [uploadedTemplates, setUploadedTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  // Editable fields
  const [textItems, setTextItems] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState("");
  const [runTime, setRunTime] = useState("");
  const [stopTime, setStopTime] = useState("");
  console.log(selectedTemplate, "check template image please");
  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        setLoading(true);
        const { response, error } = await getPromotionById(promotionId);
        if (error || !response) {
          toast({
            title: "Error",
            description: error || "Promotion not found",
            variant: "destructive",
          });
          navigate.push("/business/promotions");
          return;
        }
        setPromotion(response);
        setCustomImage(response.imageUrl);
        setTextItems(response.text || []);
        setBackgroundColor(response.backgroundColor || "");
        setRunTime(response.runTime || "");
        setStopTime(response.stopTime || "");
      } catch (error) {
        console.error("Fetch promotion error:", error);
        toast({
          title: "Error",
          description: error?.message || "Failed to load promotion",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    if (promotionId) {
      fetchPromotion();
    }
  }, [promotionId, navigate, toast]);
  // Fetch templates
  useEffect(() => {
    let canceled = false;
    const fetch = async () => {
      setLoadingTemplates(true);
      try {
        const res = await getTemplates();
        if (!canceled) {
          setUploadedTemplates(Array.isArray(res) ? res : res?.response || []);
        }
      } catch (err) {
        console.error("Error fetching templates:", err);
      } finally {
        if (!canceled) setLoadingTemplates(false);
      }
    };
    fetch();
    return () => {
      canceled = true;
    };
  }, []);
  // Template & Image handlers
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
    setCustomImage(template.imageUrl);
    setSelectedTemplateId(template.id);
  };
  const handleImageUpload = async (imageData) => {
    setCustomImage(imageData);
    setSelectedTemplate(null);
    setSelectedTemplateId(null);
  };
  const handleSave = async () => {
    if (!promotionId) {
      toast({
        title: "Error",
        description: "Promotion ID not found",
        variant: "destructive",
      });
      return;
    }
    if (!customImage) {
      toast({
        title: "Error",
        description: "Please select an image",
        variant: "destructive",
      });
      return;
    }
    try {
      setSaving(true);
      const updateData = {
        imageUrl: customImage,
        text: textItems,
        backgroundColor,
        runTime,
        stopTime,
      };
      const response = await updatePromotion(promotionId, updateData);
      navigate.push("/business/promotions");
    } catch (error) {
      console.error("Update promotion error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update promotion",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!promotion) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Promotion not found</p>
      </div>
    );
  }
  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate.push("/business/promotions")}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Promotions
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Promotion</h1>
          <p className="text-muted-foreground">
            Customize image, text, colors, and times
          </p>
        </div>
      </div>

      {/* Promotion Info (Read-Only) */}
      <div className="bg-card rounded-2xl p-6 border border-border space-y-6">
        <div>
          <h3 className="font-semibold text-lg">
            Promotion Details (Read-Only)
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            These details cannot be changed. Edit only image, text, start time,
            and end time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Badge */}
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold">
              Status
            </p>
            <Badge
              variant={
                promotion.status === "active"
                  ? "default"
                  : promotion.status === "pending"
                    ? "secondary"
                    : "outline"
              }
              className="capitalize"
            >
              {promotion.status}
            </Badge>
          </div>

          {/* Price */}
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold">
              Price
            </p>
            <p className="font-semibold text-lg">${promotion.price}</p>
          </div>

          {/* Duration */}
          <div className="bg-muted/30 rounded-lg p-4 col-span-1">
            <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Duration
            </p>
            <p className="font-medium text-sm">
              {format(new Date(promotion.runDate), "MMM d")} -{" "}
              {format(new Date(promotion.stopDate), "MMM d, yyyy")}
            </p>
          </div>

          {/* States */}
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold flex items-center gap-1">
              <Globe className="h-3 w-3" /> States
            </p>
            <div className="flex items-center gap-2">
              <p className="font-medium text-lg">
                {promotion.states?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">selected</p>
            </div>
          </div>

          {/* Cities */}
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Cities
            </p>
            <div className="flex items-center gap-2">
              <p className="font-medium text-lg">
                {promotion.cities?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">selected</p>
            </div>
          </div>

          {/* Timezones */}
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold flex items-center gap-1">
              <Clock className="h-3 w-3" /> Timezones
            </p>
            <div className="flex items-center gap-2">
              <p className="font-medium text-lg">
                {promotion.timezones?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">selected</p>
            </div>
          </div>
        </div>

        {/* Selected Locations Details */}
        {(promotion.states?.length > 0 ||
          promotion.cities?.length > 0 ||
          promotion.timezones?.length > 0) && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-semibold text-sm mb-4">Selected Locations</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {promotion.states?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    STATES ({promotion.states.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {promotion.states.map((state) => (
                      <Badge key={state.id} variant="secondary">
                        {state.code || state.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {promotion.cities?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    CITIES ({promotion.cities.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {promotion.cities.map((city) => (
                      <Badge key={city.id} variant="secondary">
                        {city.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {promotion.timezones?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    TIMEZONES ({promotion.timezones.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {promotion.timezones.map((tz) => (
                      <Badge key={tz} variant="secondary">
                        {tz}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Step 1: Template Selection */}
      <section className="bg-card rounded-2xl p-6 border border-border">
        <div className="mb-6">
          <h3 className="font-semibold text-lg">Select or Upload Image</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose from predefined templates or upload your custom image
          </p>
        </div>
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          customImage={customImage}
          onTemplateSelect={handleTemplateSelect}
          onImageUpload={handleImageUpload}
        />
      </section>

      {/* Step 2: Live Preview with Editable Fields */}

      {/* Step 3: Text Customizer */}
      <section className="bg-card rounded-2xl p-6 border border-border">
        <div className="mb-6">
          <h3 className="font-semibold text-lg">Customize Text</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add, edit, and position text on your promotion
          </p>
        </div>
        <TextCustomizer
          selectedTemplate={selectedTemplate}
          customImage={customImage}
          promotionText={textItems}
          textPosition={{ x: 50, y: 50 }}
          fontSize="24"
          textColor=""
          backgroundColor={backgroundColor}
          showOverlay={true}
          onTextChange={(text) => {
            if (Array.isArray(text)) {
              setTextItems(text);
            }
          }}
          onPositionChange={() => {}}
          onFontSizeChange={() => {}}
          onTextColorChange={() => {}}
          onBackgroundColorChange={setBackgroundColor}
          onOverlayChange={() => {}}
        />
      </section>

      <section className="bg-card rounded-2xl p-6 border border-border">
        <h3 className="font-semibold text-lg mb-6">Edit Settings</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editable Fields */}
          <div className="space-y-6">
            {/* Start Time */}
            <div className="space-y-3">
              <Label
                htmlFor="start-time"
                className="font-medium flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Start Time
              </Label>
              <Input
                id="start-time"
                type="time"
                value={runTime}
                onChange={(e) => setRunTime(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                When your promotion starts running each day
              </p>
            </div>

            {/* End Time */}
            <div className="space-y-3">
              <Label
                htmlFor="end-time"
                className="font-medium flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                End Time
              </Label>
              <Input
                id="end-time"
                type="time"
                value={stopTime}
                onChange={(e) => setStopTime(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                When your promotion stops running each day
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Action Buttons */}
      <div className="flex gap-4 justify-end sticky bottom-6 bg-background pt-4 pb-2 border-t border-border">
        <Button
          variant="outline"
          onClick={() => navigate.push("/business/promotions")}
          disabled={saving || uploadingImage}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || uploadingImage || !customImage}
          className="gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
export default EditPromotion;
