"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/presentation/components/ui/button";
import { useSubscriptionService } from "@/presentation/services/subscriptionService";
import { useToast } from "@/presentation/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/presentation/hooks/use-redux"; // Assuming you have Redux hooks
const SubscriptionPage = () => {
    const { checkout } = useSubscriptionService();
    const { toast } = useToast();
    const navigate = useRouter();
    const [loading, setLoading] = useState(false);
    const [customMonths, setCustomMonths] = useState(1);
    // Get business type from Redux
    const businessType = useAppSelector((state) => state.auth.business?.businessType);
    // Expected values: "online-ecommerce" or other types
    // Predefined plans based on months
    const predefinedMonths = [1, 2, 3];
    const calculatePrice = (months) => {
        if (businessType === "online-ecommerce") {
            return months * 10; // Online store: 1 month=10, 2 months=20, 3 months=30
        }
        return months * 20; // Other business: 20/month
    };
    const handleSubscribe = async (months) => {
        try {
            setLoading(true);
            const res = await checkout(months);
            if (res?.url) {
                window.location.href = res.url;
                return;
            }
            if (res?.stripeSession?.url) {
                window.location.href = res.stripeSession.url;
                return;
            }
            toast({
                title: "Error",
                description: "Checkout failed",
                variant: "destructive",
            });
        }
        catch (err) {
            toast({
                title: "Error",
                description: err.message || "Subscription failed",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className=" ">
      <h1 className="text-3xl font-bold text-center mb-3">
        Business Subscription
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Choose your plan. <br />
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Predefined plans */}
        {predefinedMonths.map((months) => (<div key={months} className="p-6 border rounded-xl shadow hover:shadow-lg transition duration-300 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {months} Month{months > 1 ? "s" : ""}
              </h3>
              <p className="text-muted-foreground mb-4">
                Total: ${calculatePrice(months)}
              </p>
              <p className="text-sm text-muted-foreground">
                {businessType === "online-ecommerce"
                ? "Includes 2 free cities + 1 free state"
                : "Includes 2 free cities"}
              </p>
            </div>
            <Button variant="default" onClick={() => handleSubscribe(months)} disabled={loading} className="w-full mt-5 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin h-4 w-4"/> : null}
              Subscribe {months} mo
            </Button>
          </div>))}

        {/* Custom months */}
        {/* <div className="p-6 border rounded-xl shadow hover:shadow-lg transition duration-300 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Custom Months</h3>
            <p className="text-muted-foreground mb-2">
              Enter any number of months
            </p>
            <input
              type="number"
              min={1}
              value={customMonths}
              onChange={(e) => setCustomMonths(Number(e.target.value))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-2"
            />
            <p className="text-sm text-muted-foreground">
              Total: ${calculatePrice(customMonths)}
              <br />
              {businessType === "online-ecommerce"
                ? "Includes 2 free cities + 1 free state"
                : "Includes 2 free cities"}
            </p>
          </div>
          <Button
            variant="default"
            onClick={() => handleSubscribe(customMonths)}
            disabled={loading || customMonths < 1}
            className="w-full mt-auto flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : null}
            Subscribe {customMonths} mo
          </Button>
        </div> */}
      </div>
    </div>);
};
export default SubscriptionPage;
