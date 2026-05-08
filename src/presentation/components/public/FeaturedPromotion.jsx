"use client";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { MapPin, Clock, TrendingUp, Tag } from "lucide-react";
import { format, differenceInHours, differenceInDays } from "date-fns";
import { useEffect } from "react";
import Link from "next/link";
import { usePromotionService } from "@/presentation/services/promotionService";
const FeaturedPromotion = () => {
    const dispatch = useDispatch();
    const { getFeaturedPromotions } = usePromotionService();
    const { featuredPromotions, featuredLoading, featuredError } = useSelector((state) => state.promotion);
    useEffect(() => {
        // Fetch featured promotions using user location from localStorage
        getFeaturedPromotions(dispatch);
    }, []);
    // Listen for location changes and refetch promotions
    useEffect(() => {
        const handleLocationChange = () => {
            console.log("Location changed, refetching featured promotions...");
            getFeaturedPromotions(dispatch);
        };
        window.addEventListener("locationChanged", handleLocationChange);
        return () => window.removeEventListener("locationChanged", handleLocationChange);
    }, [dispatch, getFeaturedPromotions]);
    const getTimeRemaining = (endDate) => {
        try {
            const end = new Date(endDate);
            const now = new Date();
            const hours = differenceInHours(end, now);
            const days = differenceInDays(end, now);
            if (days > 0)
                return `${days} day${days > 1 ? "s" : ""} left`;
            if (hours > 0)
                return `${hours} hour${hours > 1 ? "s" : ""} left`;
            return "Ending soon";
        }
        catch (e) {
            return "Active";
        }
    };
    const formatDate = (date) => {
        try {
            return format(new Date(date), "MMM dd, yyyy");
        }
        catch (e) {
            return date;
        }
    };
    if (featuredLoading) {
        return (<section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Featured Promotions
              </h2>
              <p className="text-muted-foreground mt-1">
                Loading deals near you...
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (<div key={i} className="rounded-lg border border-border bg-background/50 animate-pulse h-96"/>))}
          </div>
        </div>
      </section>);
    }
    if (featuredError) {
        return (<section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <p className="text-destructive">
              Unable to load promotions. Please try again later.
            </p>
          </div>
        </div>
      </section>);
    }
    if (!featuredPromotions || featuredPromotions.length === 0) {
        return (<section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Featured Promotions
              </h2>
              <p className="text-muted-foreground mt-1">
                No promotions available in your area
              </p>
            </div>
          </div>
          <div className="bg-background border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">
              Check back soon for exciting deals in your location!
            </p>
          </div>
        </div>
      </section>);
    }
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    };
    return (<section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Featured Promotions
            </h2>
            <p className="text-muted-foreground mt-1">
              {featuredPromotions.length} active deal
              {featuredPromotions.length > 1 ? "s" : ""} near you
            </p>
          </div>
          <Link href="/promotions" className="text-primary hover:underline flex items-center gap-2">
            View All <TrendingUp size={18}/>
          </Link>
        </div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" animate="visible">
          {featuredPromotions.slice(0, 6).map((promotion) => (<motion.div key={promotion.id} variants={itemVariants} className="group relative rounded-lg overflow-hidden border border-border bg-background hover:shadow-lg transition-shadow duration-300">
              {/* Image Container */}
              <div className="relative h-40 overflow-hidden bg-muted">
                {promotion.imageUrl ? (<img src={promotion.imageUrl} alt={promotion.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>) : (<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <Tag className="text-primary/50" size={32}/>
                  </div>)}

                {/* Category Badge */}
                {promotion.category && (<div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    {promotion.category}
                  </div>)}

                {/* Time Remaining Badge */}
                <div className="absolute top-2 right-2 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Clock size={14}/>
                  {getTimeRemaining(promotion.stopDate)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Business Info */}
                {promotion.business && (<div className="mb-2">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">
                      {promotion.business.name}
                    </p>
                  </div>)}

                {/* Promotion Description */}
                {promotion.description && (<p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {promotion.description}
                  </p>)}

                {/* Location */}
                {(promotion.cities || promotion.states) && (<div className="flex items-start gap-2 text-xs text-muted-foreground mb-3">
                    <MapPin size={14} className="mt-0.5 flex-shrink-0"/>
                    <span className="line-clamp-2">
                      {promotion.cities?.length > 0
                    ? promotion.cities
                        .slice(0, 2)
                        .map((c) => c.name)
                        .join(", ")
                    : promotion.states?.length > 0
                        ? promotion.states
                            .slice(0, 2)
                            .map((s) => s.code)
                            .join(", ")
                        : "Multiple locations"}
                      {promotion.cities?.length > 2 &&
                    ` +${promotion.cities.length - 2}`}
                    </span>
                  </div>)}

                {/* Dates */}
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
                  <span>{formatDate(promotion.runDate)}</span>
                  <span>-</span>
                  <span>{formatDate(promotion.stopDate)}</span>
                </div>

                {/* View Details Link */}
                <Link href={`/promotions/${promotion.id}`} className="inline-block text-primary hover:underline font-medium text-sm">
                  View Details →
                </Link>
              </div>
            </motion.div>))}
        </motion.div>
      </div>
    </section>);
};
export default FeaturedPromotion;
