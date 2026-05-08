"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/presentation/lib/stripe";
import { Button } from "@/presentation/components/ui/button";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/presentation/hooks/use-toast";
/**
 * Inner payment form component with access to Stripe hooks
 */
const CheckoutForm = ({ amount, breakdown }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isReady, setIsReady] = useState(false); // Track if PaymentElement is ready
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setErrorMessage("Stripe has not loaded yet. Please wait...");
      return;
    }
    if (!isReady) {
      setErrorMessage("Payment form is still loading. Please wait...");
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      // Confirm payment with Payment Element
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/business/promotions`,
        },
        redirect: "if_required",
      });
      if (error) {
        console.error("Payment error:", error);
        setErrorMessage(error.message || "Payment failed");
        setIsProcessing(false);
      } else {
        // Payment succeeded
        toast({
          title: "Payment Successful!",
          description: "Your promotion has been created and payment completed.",
        });
        navigate.push("/business/promotions");
      }
    } catch (err) {
      console.error("Payment exception:", err);
      setErrorMessage(err.message || "An unexpected error occurred");
      setIsProcessing(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
      {/* Price Breakdown Card */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Payment Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Additional States:</span>
            <span className="font-medium">${breakdown.states.toFixed(2)}</span>
          </div>
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount:</span>
              <span className="text-primary">
                ${breakdown.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Element Card */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Payment Details</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your card information below. All fields are required.
        </p>
        <div className="min-h-[200px]">
          <PaymentElement
            onReady={() => {
              console.log("✅ PaymentElement is ready and mounted");
              setIsReady(true);
            }}
            onLoadError={(error) => {
              console.error("PaymentElement load error:", error);
              setErrorMessage(
                "Failed to load payment form. Please refresh the page.",
              );
            }}
            options={{
              layout: {
                type: "tabs",
                defaultCollapsed: false,
              },
              fields: {
                billingDetails: {
                  address: {
                    country: "auto",
                  },
                },
              },
            }}
          />
        </div>
        {!isReady && (
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading secure payment form...
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
          <strong>Payment Error:</strong> {errorMessage}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate.push("/business/promotions")}
          disabled={isProcessing}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || !isReady || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : !isReady ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
/**
 * Promotion Checkout Page
 * Dedicated page for completing promotion payment using Stripe Payment Element
 */
const PromotionCheckoutPage = () => {
  const navigate = useRouter();
  // CreatePromotion stashes payment data in sessionStorage before navigating
  // here. Read it once on mount; bail out if missing.
  const [state, setState] = useState(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("promotionCheckoutState");
      if (!raw) {
        navigate.push("/business/promotions");
        return;
      }
      setState(JSON.parse(raw));
    } catch {
      navigate.push("/business/promotions");
    }
  }, [navigate]);

  if (!state || !state.clientSecret) return null;
  const { clientSecret, amount, breakdown } = state;
  const options = useMemo(() => {
    return {
      clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#0F172A",
          borderRadius: "8px",
          fontFamily: "system-ui, sans-serif",
        },
      },
    };
  }, [clientSecret]);
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm amount={amount} breakdown={breakdown} />
        </Elements>
      </div>
    </div>
  );
};
export default PromotionCheckoutPage;
