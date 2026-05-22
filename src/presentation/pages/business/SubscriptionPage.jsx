"use client";

// /business/subscription — three-tier campaign plan selector that mirrors
// the production hoppingdeals.world layout: Starter / Professional (highlighted)
// / Enterprise. "Get Started" hands the customer to the existing checkout
// service which spins up a Stripe session.

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useToast } from "@/presentation/hooks/use-toast";
import { useSubscriptionService } from "@/presentation/services/subscriptionService";
import { cn } from "@/presentation/lib/utils";

const PLAN_FEATURES = [
  "1 active promotion (1-month campaign – modify anytime during the run)",
  null, // tier-specific city-count slot, replaced per plan below
  "City-focused targeting",
  "Track QR Code Scans",
  "Realtime Analytics Dashboard",
  "Schedule Start Date in Advance",
];

// Visual config keyed by template name. Live price/templateId come from
// the SubscriptionTemplates table fetched at runtime.
const PLAN_VISUAL = {
  Starter: { highlight: false, cities: "Target 1 city" },
  Professional: { highlight: true, cities: "Target 3 cities" },
  Enterprise: { highlight: false, cities: "Target 8 cities" },
};

const SubscriptionPage = () => {
  const { checkout, listTemplates } = useSubscriptionService();
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  // Pull the live SubscriptionTemplates so prices + UUIDs match what the
  // backend's CreateSubscriptionCheckoutUseCase will accept.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listTemplates();
        if (cancelled) return;
        // Sort by price, decorate with visual config keyed by name.
        const decorated = (list || [])
          .filter((t) => t.isActive)
          .sort((a, b) => Number(a.price) - Number(b.price))
          .map((t) => ({
            id: t.id,
            name: t.name,
            price: Number(t.price),
            durationMonths: t.durationMonths,
            highlight: PLAN_VISUAL[t.name]?.highlight ?? false,
            cities:
              PLAN_VISUAL[t.name]?.cities ??
              `Target ${t.freeCities ?? 1} city${(t.freeCities ?? 1) === 1 ? "" : "ies"}`,
          }));
        setPlans(decorated);
      } catch (err) {
        toast({
          title: "Could not load plans",
          description: err?.message || "Try refreshing in a moment.",
          variant: "destructive",
        });
      } finally {
        if (!cancelled) setPlansLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // listTemplates and toast are referentially fresh every render; the
    // effect should run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubscribe = async (plan) => {
    try {
      setLoadingPlanId(plan.id);
      const res = await checkout(plan.id);
      const url = res?.url || res?.stripeSession?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      toast({
        title: "Checkout failed",
        description:
          "Could not start the subscription session. Please try again.",
        variant: "destructive",
      });
    } catch (err) {
      toast({
        title: "Subscription error",
        description: err?.message || "Something went wrong starting checkout.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Business Subscription Plans</h1>
        <p className="text-muted-foreground mt-1">
          Choose a subscription plan that suits your business needs.
        </p>
      </div>

      {plansLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-end max-w-6xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-120 rounded-2xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No subscription plans available yet. Please check back soon.
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-end max-w-6xl mx-auto">
        {plans.map((plan) => {
          const features = PLAN_FEATURES.map((f, idx) =>
            idx === 1 ? plan.cities : f,
          );
          const loading = loadingPlanId === plan.id;
          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl overflow-hidden bg-black text-white shadow-2xl border-2 transition-all",
                plan.highlight
                  ? "border-[#7C3AED] md:scale-105 md:-translate-y-2"
                  : "border-primary/30 hover:border-primary/60",
              )}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-orange-400 via-purple-500 to-orange-400 blur-sm opacity-80" />
              )}

              <div className="bg-primary py-6 text-center">
                <div className="text-2xl font-extrabold uppercase tracking-wide">
                  {plan.name}
                </div>
                <div className="text-sm font-bold uppercase tracking-wider opacity-90">
                  Campaign
                </div>
              </div>

              <div className="px-8 py-8 flex-1 flex flex-col items-center">
                <div className="text-center mb-6">
                  <div className="text-6xl font-black leading-none">
                    ${plan.price}
                  </div>
                  <div className="text-gray-400 mt-1">/campaign</div>
                  <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-400">
                    Flat Fee. No Subscriptions
                  </div>
                </div>

                <div className="w-full h-px bg-white/10 mb-6" />

                <ul className="space-y-4 w-full mb-8">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 mt-0.5 shrink-0 text-yellow-400" />
                      <span className="text-sm text-gray-300 leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto w-full space-y-4">
                  <div className="text-center text-3xl font-black">
                    ${plan.price}
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleSubscribe(plan)}
                    disabled={!!loadingPlanId}
                    className={cn(
                      "w-full py-6 text-lg font-bold rounded-lg",
                      "bg-primary hover:bg-primary/90 text-primary-foreground",
                    )}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Starting checkout...
                      </span>
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      <p className="text-center text-xs text-muted-foreground max-w-xl mx-auto">
        Statewide and add-on pricing is calculated automatically when you
        configure your promotion. You will only be charged after you confirm
        your campaign details on the next screen.
      </p>
    </div>
  );
};

export default SubscriptionPage;
