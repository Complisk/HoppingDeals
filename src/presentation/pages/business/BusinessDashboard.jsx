"use client";
import { motion } from "framer-motion";
import {
  TrendingUp,
  QrCode,
  Zap,
  Eye,
  Layers,
  Calendar,
  Clock,
  MapPin,
  Globe,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Edit,
  Power,
  PowerOff,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/presentation/components/ui/button";
import { Badge } from "@/presentation/components/ui/badge";
import { format } from "date-fns";
import { usePromotionService } from "@/presentation/services/promotionService";
import { PromotionDetailsModal } from "@/presentation/components/shared/PromotionDetailsModal";
import { PromotionVisualCard } from "@/presentation/components/shared/PromotionVisualCard";
import { useToast } from "@/presentation/hooks/use-toast";
/* ---------------- Dashboard Component ---------------- */
const BusinessDashboard = () => {
  const {
    getBusinessPromotions,
    getDashboardAnalytics,
    activatePromotion,
    deactivatePromotion,
    getPromotionById,
  } = usePromotionService();
  const { toast } = useToast();
  const [promotions, setPromotions] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [actioningId, setActioningId] = useState(null);
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const analyticsRes = await getDashboardAnalytics();
      const promoRes = await getBusinessPromotions("", "");
      console.log(analyticsRes, "check alylatice please");
      setPromotions(promoRes?.response || []);
      setDashboard(analyticsRes?.response?.response || null);
    } catch (error) {
      console.error("Fetch dashboard error:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboard();
  }, []);
  const handleActivate = async (e, promotionId) => {
    e.stopPropagation();
    try {
      setActioningId(promotionId);
      const res = await activatePromotion(promotionId);
      toast({
        title: "Success",
        description: res?.message,
      });
      const { response, error } = await getBusinessPromotions("", "");
      setPromotions(response || []);
      setActioningId(null);
    } catch (error) {
      console.error("Activate error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to activate promotion",
        variant: "destructive",
      });
    } finally {
      setActioningId(null);
    }
  };
  const handleDeactivate = async (e, promotionId) => {
    e.stopPropagation();
    try {
      setActioningId(promotionId);
      const res = await deactivatePromotion(promotionId);
      toast({
        title: "Success",
        description: res?.message || "Promotion deactivated successfully",
      });
      const { response, error } = await getBusinessPromotions("", "");
      setPromotions(response || []);
      setActioningId(null);
    } catch (error) {
      console.error("Deactivate error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to deactivate promotion",
        variant: "destructive",
      });
    } finally {
      setActioningId(null);
    }
  };
  const weeklyValue = dashboard?.chartData?.weekly || 0;
  const monthlyValue = dashboard?.chartData?.monthly || 0;
  const momentum = dashboard?.chartData?.momentum || {
    score: 0,
    level: "Low",
    message: "No momentum yet",
  };
  const getLevel = (value, type) => {
    if (value === 0) return "Empty";
    if (type === "weekly") {
      if (value === 1) return "Low";
      if (value === 2) return "Medium";
      if (value >= 3) return "High";
    } else if (type === "monthly") {
      if (value <= 3) return "Low";
      if (value <= 7) return "Medium";
      if (value >= 8) return "High";
    }
    return "Low";
  };
  return (
    <div className="space-y-8">
      {/* ---------------- Header ---------------- */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Promotion frequency & growth overview
        </p>
      </div>

      {/* ---------------- Stats ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))
        ) : (
          <>
            <StatCard
              icon={Layers}
              label="Total Promotions"
              value={dashboard?.stats?.totalPromotions || 0}
            />
            <StatCard
              icon={TrendingUp}
              label="Active Promotions"
              value={dashboard?.stats?.activePromotions || 0}
            />
          </>
        )}
      </div>

      {/* ---------------- Simple Charts ---------------- */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Promotion Intensity & Momentum
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-60 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
            {/* -------- Weekly Chart -------- */}
            <SimpleBarChart
              title="Last 7 Days"
              level={getLevel(weeklyValue, "weekly")}
            />

            {/* -------- Monthly Chart with 10 Steps -------- */}
            <MonthlyStepChart
              title="Last 30 Days"
              value={monthlyValue}
              maxValue={10}
            />

            {/* -------- Momentum -------- */}
            <div className="bg-card border rounded-2xl p-6 text-center flex flex-col items-center">
              <div className="flex justify-between w-full mb-4">
                <h3 className="font-medium">Overall Momentum</h3>
                <Zap className="text-accent" />
              </div>

              <div className="flex items-stretch">
                {/* The Bar - Larger */}
                <div className="h-48 w-16 relative overflow-hidden border-2 border-foreground bg-background">
                  <div
                    className="absolute bottom-0 left-0 w-full bg-primary transition-all duration-500"
                    style={{
                      height:
                        momentum.score === 0
                          ? "0%"
                          : momentum.level === "Low"
                            ? "33%"
                            : momentum.level === "Medium"
                              ? "66%"
                              : "100%",
                    }}
                  />

                  {/* Zone divider lines */}
                  <div className="absolute left-0 right-0 top-1/3 border-t border-dashed border-muted-foreground/30" />
                  <div className="absolute left-0 right-0 top-2/3 border-t border-dashed border-muted-foreground/30" />
                </div>

                <div className="flex flex-col justify-between items-start text-start h-48 ml-2 py-1">
                  <span>High</span>
                  <span>Medium</span>
                  <span>Low</span>
                </div>
              </div>

              <p className="font-semibold mt-4">Score: {momentum.score}%</p>
            </div>
          </div>
        )}
      </section>

      {/* ---------------- Promotions ---------------- */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          Recently Added Promotions
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-40 bg-muted rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : promotions.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promotions.slice(0, 6).map((item, index) => (
              <PromotionCard
                key={item.id}
                item={item}
                index={index}
                onClick={() => setSelectedPromotion(item)}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                isActioning={actioningId}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card border-dashed border rounded-2xl p-10 text-center">
            <h3 className="font-semibold mb-2">No Active Promotions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first promotion to build momentum
            </p>
            <Button asChild>
              <Link href="/business/create-promotion">Create Promotion</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Promotion Details Modal */}
      <PromotionDetailsModal
        promotion={selectedPromotion}
        open={!!selectedPromotion}
        onClose={() => setSelectedPromotion(null)}
      />
    </div>
  );
};
/* ---------------- Reusable Components ---------------- */
const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-card border rounded-2xl p-4 flex items-center gap-4">
    <Icon className="h-8 w-8 text-primary" />
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);
// Simple single-bar chart showing all levels with zone labels
const SimpleBarChart = ({ title, level }) => {
  const getFillPercentage = () => {
    if (level === "Empty") return 0;
    if (level === "Low") return 33;
    if (level === "Medium") return 66;
    return 100;
  };
  return (
    <div className="bg-card border rounded-2xl p-6 flex flex-col items-center gap-4">
      <h3 className="font-medium mr-auto">{title}</h3>

      <div className="flex items-stretch">
        <div className="h-48 w-16 relative overflow-hidden border-2 border-foreground bg-background">
          <div
            className="absolute bottom-0 left-0 w-full bg-primary transition-all duration-500"
            style={{ height: `${getFillPercentage()}%` }}
          />
          <div className="absolute left-0 right-0 top-1/3 border-t border-dashed border-muted-foreground/30" />
          <div className="absolute left-0 right-0 top-2/3 border-t border-dashed border-muted-foreground/30" />
        </div>
        <div className="flex flex-col justify-between items-start text-start h-48 ml-2 py-1">
          <span>High</span>
          <span>Medium</span>
          <span>Low</span>
        </div>
      </div>

      <p className="font-semibold mt-2">
        {level === "Empty" ? "No Data" : `${level} Intensity`}
      </p>
    </div>
  );
};
// Monthly chart with 10 steps
const MonthlyStepChart = ({ title, value, maxValue = 10 }) => {
  const steps = Array.from({ length: maxValue }, (_, i) => i + 1);
  const filledSteps = Math.min(value, maxValue);
  return (
    <div className="bg-card border rounded-2xl p-6 flex flex-col items-center gap-4">
      <h3 className="font-medium mr-auto">{title}</h3>
      <div className="flex items-stretch">
        <div className="h-48 w-16 relative overflow-hidden border-2 border-foreground bg-background flex flex-col-reverse">
          {steps.map((step) => (
            <div
              key={step}
              className={`flex-1 transition-all duration-300 ${step <= filledSteps ? "bg-primary" : "bg-transparent"}`}
              style={{
                borderTop: step > 1 ? "1px dashed rgba(0,0,0,0.1)" : "none",
              }}
            />
          ))}
        </div>
        <div className="flex flex-col justify-between items-start text-start h-48 ml-2 py-1">
          <span>High</span>
          <span>Medium</span>
          <span>Low</span>
        </div>
      </div>
      <p className="font-semibold mt-2">{value} Promotions</p>
    </div>
  );
};
// Promotion Card
const PromotionCard = ({
  item,
  index,
  onClick,
  onActivate,
  onDeactivate,
  isActioning,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending Approval
          </Badge>
        );
      case "Expired":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            {/* <AlertCircle className="h-3 w-3 mr-1" /> */}
            Expired
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  const getCitiesText = () => {
    if (!item.cities || item.cities.length === 0) return null;
    return item.cities.length === 1
      ? item.cities[0].name
      : `${item.cities[0].name} +${item.cities.length - 1} more`;
  };
  const getStatesText = () => {
    if (!item.states || item.states.length === 0) return null;
    return item.states.length === 1
      ? item.states[0].name
      : `${item.states[0].name} +${item.states.length - 1} more`;
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border rounded overflow-hidden hover:shadow-lg transition-all group"
      onClick={onClick}
    >
      <PromotionVisualCard
        imageUrl={item.imageUrl}
        backgroundColor={item.backgroundColor}
        text={item.text}
        showOverlay={false}
        className="h-32 rounded-none border-0"
      >
        {/* <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" /> */}
      </PromotionVisualCard>
      <div className="p-4 space-y-3">
        <div className=" flex gap-2">{getStatusBadge(item.status)}</div>
        <div className=" flex justify-between items-end">
          <div className="flex items-center gap-1  font-bold text-lg">
            <DollarSign className="h-4 w-4" />
            {item.price}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>
              {format(new Date(item.runDate), "MMM d")} -{" "}
              {format(new Date(item.stopDate), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>
              {item.runTime?.slice(0, 5)} - {item.stopTime?.slice(0, 5)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          {getCitiesText() && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{getCitiesText()}</span>
            </div>
          )}
          {getStatesText() && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Globe className="h-4 w-4 text-primary" />
              <span>{getStatesText()}</span>
            </div>
          )}
        </div>

        {item.timezones && item.timezones.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.timezones.slice(0, 3).map((tz, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tz}
              </Badge>
            ))}
            {item.timezones.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.timezones.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-sm">
            <Eye className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{item.views || 0}</span>
            <span className="text-muted-foreground text-xs">views</span>
          </div>
        </div>

        {/* Action Buttons */}
        {(item.status == "active" || item.status == "inactive") && (
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              size="sm"
              variant="outline"
              asChild
              onClick={(e) => e.stopPropagation()}
              className="flex-1 gap-1"
            >
              <Link href={`/business/edit-promotion/${item.id}`}>
                <Edit className="h-4 w-4 " />
                Edit
              </Link>
            </Button>

            {item.status == "active" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => onDeactivate(e, item.id)}
                disabled={isActioning === item.id}
                className="gap-1 text-orange-600 hover:bg-orange-50"
              >
                {isActioning === item.id ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <PowerOff className="h-4 w-4" />
                )}
                Deactivate
              </Button>
            )}

            {item.status == "inactive" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => onActivate(e, item.id)}
                disabled={isActioning === item.id}
                className="gap-1 text-green-600 hover:bg-green-50"
              >
                {isActioning === item.id ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
                Activate
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default BusinessDashboard;
