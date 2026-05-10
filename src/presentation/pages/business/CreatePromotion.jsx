"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import "react-datepicker/dist/react-datepicker.css";
import { useToast } from "@/presentation/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/presentation/hooks/use-redux";
import { usePromotionService } from "@/presentation/services/promotionService";
import { useSubscriptionService } from "@/presentation/services/subscriptionService";
import { TemplateSelector } from "@/presentation/components/business/TemplateSelector";
import { TextCustomizer } from "@/presentation/components/business/TextCustomizer";
import { LocationTargeter } from "@/presentation/components/business/LocationTargeter";
import { ScheduleAndPricing } from "@/presentation/components/business/ScheduleAndPricing";
import { Loader2 } from "lucide-react";
const CreatePromotion = ({ isVisitor = false }) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { isLoading: isCreatingPromotion } = useAppSelector(
    (state) => state.promotion,
  );
  const [activeSubscriptionLoading, setActiveSubscriptionLoading] =
    useState(false);
  const { createPromotion } = usePromotionService();
  const { getActive } = useSubscriptionService();
  const [activeSubscription, setActiveSubscription] = useState(null);
  const navigate = useRouter();
  const business = useSelector((state) => state.auth.business);
  console.log(business, "check business data ");
  const businessCategory = business?.category || "General";
  // Load active subscription on mount
  useEffect(() => {
    setActiveSubscriptionLoading(true);
    const load = async () => {
      try {
        const sub = await getActive();
        setActiveSubscription(sub);
        setActiveSubscriptionLoading(false);
      } catch (err) {
        console.debug("No active subscription", err);
        setActiveSubscriptionLoading(false);
      }
    };
    load();
  }, []);
  // Template & Text State
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [customImage, setCustomImage] = useState(null);
  const [promotionText, setPromotionText] = useState([
    {
      id: Date.now().toString(),
      content: "",
      color: "#ffffff",
      fontSize: "24",
      x: 50,
      y: 50,
    },
  ]);
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [fontSize, setFontSize] = useState("24");
  const [textColor, setTextColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  // Location State
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedTimezones, setSelectedTimezones] = useState([]);
  const [months, setMonths] = useState(1);
  // Schedule State
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  // Auto-calculate months
  const calculateMonths = (start, end) => {
    if (!start || !end) return 1;
    if (start > end) return 0;
    let m = 0;
    const s = new Date(start);
    const e = new Date(end);
    const addMonths = (d, count) => {
      const nd = new Date(d.getTime());
      const day = nd.getDate();
      nd.setMonth(nd.getMonth() + count);
      if (nd.getDate() < day) nd.setDate(0);
      return nd;
    };
    while (true) {
      const boundary = addMonths(s, m + 1);
      if (boundary <= e) {
        m += 1;
        continue;
      }
      break;
    }
    const lastBoundary = addMonths(s, m);
    if (e > lastBoundary) m += 1;
    return m < 1 ? 1 : m;
  };
  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (date && endDate) setMonths(calculateMonths(date, endDate));
  };
  const handleEndDateChange = (date) => {
    setEndDate(date);
    if (startDate && date) setMonths(calculateMonths(startDate, date));
  };
  // Template & Image handlers
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
    setCustomImage(template.imageUrl);
    setSelectedTemplateId(template.id);
  };
  const handleImageUpload = (imageData) => {
    setCustomImage(imageData);
    setSelectedTemplate(null);
    setSelectedTemplateId(null);
  };
  // Text handlers
  const handleMoveText = (direction) => {
    const step = 5;
    setTextPosition((prev) => ({
      x:
        direction === "left"
          ? Math.max(0, prev.x - step)
          : direction === "right"
            ? Math.min(100, prev.x + step)
            : prev.x,
      y:
        direction === "up"
          ? Math.max(0, prev.y - step)
          : direction === "down"
            ? Math.min(100, prev.y + step)
            : prev.y,
    }));
  };
  // Location handlers
  const handleAddCity = (location) => {
    if (selectedCities.length >= 2) {
      toast({
        title: "Limit Reached",
        description: "Maximum 2 cities allowed for physical location",
        variant: "destructive",
      });
      return;
    }
    if (!selectedCities.find((c) => c.id === location.id)) {
      setSelectedCities([...selectedCities, location]);
    }
  };
  const handleRemoveCity = (id) =>
    setSelectedCities(selectedCities.filter((c) => c.id !== id));
  const handleAddState = (location) => {
    if (!selectedStates.find((s) => s.id === location.id)) {
      setSelectedStates([...selectedStates, location]);
    }
  };
  const handleRemoveState = (id) =>
    setSelectedStates(selectedStates.filter((s) => s.id !== id));
  const handleTimezoneToggle = (timezone) => {
    if (selectedTimezones.includes(timezone)) {
      setSelectedTimezones(selectedTimezones.filter((tz) => tz !== timezone));
    } else {
      setSelectedTimezones([...selectedTimezones, timezone]);
    }
  };
  // Run Promotion handler
  const handleRunPromotion = async () => {
    if (isVisitor) {
      toast({
        title: "Access Denied",
        description: "You must be logged in to create promotions.",
        variant: "destructive",
      });
      return;
    }
    if (!activeSubscription) {
      toast({
        title: "No Active Subscription",
        description:
          "You currently do not have an active subscription. Please subscribe to allow promotions to run successfully.",
        variant: "default",
      });
      return;
    }
    if (!selectedTemplate && !customImage) {
      toast({
        title: "Error",
        description: "Please select a template or upload an image",
        variant: "destructive",
      });
      return;
    }
    if (!startDate || !endDate || !startTime || !endTime) {
      toast({
        title: "Error",
        description: "Please select start/end date and time",
        variant: "destructive",
      });
      return;
    }
    // Calculate price on frontend
    const isOnlineStore = business?.businessType === "online-ecommerce";
    const hasEasternTimezone = selectedTimezones.some((tz) =>
      tz.toLowerCase().includes("eastern"),
    );
    let stateCost = 0;
    let timezoneCost = 0;
    if (isOnlineStore) {
      if (selectedStates.length > 1) {
        stateCost = (selectedStates.length - 1) * 10;
      }
      if (selectedTimezones.length > 0) {
        if (hasEasternTimezone) {
          const nonEasternCount = selectedTimezones.filter(
            (tz) => !tz.toLowerCase().includes("eastern"),
          ).length;
          timezoneCost = nonEasternCount * 30 + 50;
        } else {
          timezoneCost = selectedTimezones.length * 30;
        }
      }
    } else {
      if (selectedStates.length > 0) {
        stateCost = selectedStates.length * 20;
      } else {
      }
      if (selectedTimezones.length > 0) {
        if (hasEasternTimezone) {
          const nonEasternCount = selectedTimezones.filter(
            (tz) => !tz.toLowerCase().includes("eastern"),
          ).length;
          timezoneCost = nonEasternCount * 60 + 100;
        } else {
          timezoneCost = selectedTimezones.length * 60;
        }
      }
    }
    const subtotal = stateCost + timezoneCost;
    const totalPrice = subtotal;
    const payload = {
      imageUrl: customImage || selectedTemplateId || "",
      text: promotionText,
      backgroundColor,
      category: businessCategory,
      cities: selectedCities,
      states: selectedStates,
      timezones: selectedTimezones,
      runDate: startDate,
      stopDate: endDate,
      runTime: startTime,
      stopTime: endTime,
      price: totalPrice,
    };
    // If no active subscription, show a toast guidance (frontend only)
    try {
      const response = await createPromotion(dispatch, payload);
      if (!response) {
        throw new Error("Failed to create promotion");
      }
      // Check if payment is required
      if (response.requiresPayment && response.clientSecret) {
        // Navigate to checkout page with payment data
        navigate.push("/business/checkout", {
          state: {
            clientSecret: response.clientSecret,
            amount: totalPrice,
            breakdown: {
              states: stateCost,
              timezones: timezoneCost,
              total: totalPrice,
            },
            promotionId: response.promotion.id,
          },
        });
      } else {
        // Free promotion - show success
        toast({
          title: "Success",
          description: "Promotion created successfully!",
        });
        navigate.push("/business/promotions");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to create promotion",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="w-full space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Create Promotion
          </h1>
          <p className="text-muted-foreground">
            Design, customize, and launch your promotion
          </p>
        </div>

        {activeSubscriptionLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin h-5 w-5 text-foreground" />
            <span className="text-sm text-foreground">
              Loading subscription...
            </span>
          </div>
        ) : (
          <div>
            {/* Subscription status label */}
            {activeSubscription && activeSubscription.endDate ? (
              (() => {
                const end = new Date(activeSubscription.endDate);
                const today = new Date();
                if (end >= today) {
                  return (
                    <div className="text-sm px-3 py-2 bg-green-50 text-green-800 rounded-lg">
                      Active until{" "}
                      {new Date(
                        activeSubscription.endDate,
                      ).toLocaleDateString()}
                    </div>
                  );
                }
                return (
                  <a
                    href="/business/subscription"
                    className="text-sm px-3 py-2 bg-yellow-50 text-yellow-800 rounded-lg"
                  >
                    Subscription expired — renew
                  </a>
                );
              })()
            ) : (
              <a
                href="/business/subscription"
                className="text-sm px-3 py-2 bg-red-50 text-red-800 rounded-lg"
              >
                No active subscription — subscribe
              </a>
            )}
          </div>
        )}
      </div>

      {/* Step 1: Template */}
      <section className="bg-card rounded-2xl p-6 border border-border">
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          customImage={customImage}
          onTemplateSelect={handleTemplateSelect}
          onImageUpload={handleImageUpload}
        />
      </section>

      {/* Step 2: Text Customizer */}
      <section className="bg-card rounded-2xl p-6 border border-border">
        <TextCustomizer
          selectedTemplate={selectedTemplate}
          customImage={customImage}
          promotionText={promotionText}
          textPosition={textPosition}
          fontSize={fontSize}
          textColor={textColor}
          backgroundColor={backgroundColor}
          showOverlay={showOverlay}
          onTextChange={setPromotionText}
          onPositionChange={handleMoveText}
          onFontSizeChange={setFontSize}
          onTextColorChange={setTextColor}
          onBackgroundColorChange={setBackgroundColor}
          onOverlayChange={setShowOverlay}
        />
      </section>

      {/* Step 3: Location */}
      <section className="bg-card rounded-2xl p-6 border border-border">
        <LocationTargeter
          selectedCities={selectedCities}
          selectedStates={selectedStates}
          selectedTimezones={selectedTimezones}
          onAddCity={handleAddCity}
          onRemoveCity={handleRemoveCity}
          onAddState={handleAddState}
          onRemoveState={handleRemoveState}
          onTimezoneToggle={handleTimezoneToggle}
        />
      </section>

      {/* Step 4: Schedule & Pricing */}
      <section className="bg-card rounded-2xl p-6 border border-border">
        <ScheduleAndPricing
          selectedTemplate={selectedTemplate}
          customImage={customImage}
          selectedCitiesCount={selectedCities.length}
          selectedStatesCount={selectedStates.length}
          selectedTimezonesCount={selectedTimezones.length}
          selectedTimezones={selectedTimezones}
          months={months}
          startDate={startDate}
          startTime={startTime}
          endDate={endDate}
          endTime={endTime}
          businessType={business?.businessType || "small"}
          onStartDateChange={(date) => handleStartDateChange(date)}
          onStartTimeChange={setStartTime}
          onEndDateChange={(date) => handleEndDateChange(date)}
          onEndTimeChange={setEndTime}
          onRunPromotion={handleRunPromotion}
          selectedEndDate={activeSubscription?.endDate}
          isLoading={isCreatingPromotion}
        />
      </section>
    </div>
  );
};
export default CreatePromotion;
