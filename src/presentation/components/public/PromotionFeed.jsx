"use client";

import { categories } from "@/data/mockData";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePromotionService } from "@/presentation/services/promotionService";
import PromotionDetailModal from "./PromotionDetailModal";
import PromotionCard from "./PromotionCard";
const PromotionFeed = ({ selectedCategory }) => {
  const dispatch = useDispatch();
  const { getFeaturedPromotions } = usePromotionService();
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [open, setOpen] = useState(false);
  const { featuredPromotions, featuredLoading } = useSelector(
    (state) => state.promotion,
  );
  useEffect(() => {
    getFeaturedPromotions(dispatch);
  }, [dispatch]);
  useEffect(() => {
    const handleLocationChange = () => {
      getFeaturedPromotions(dispatch);
    };
    window.addEventListener("locationChanged", handleLocationChange);
    return () =>
      window.removeEventListener("locationChanged", handleLocationChange);
  }, [dispatch]);
  const filteredPromotions = selectedCategory
    ? (featuredPromotions || []).filter((p) => p.category === selectedCategory)
    : featuredPromotions || [];
  const getCategoryInfo = (categoryId) => {
    return categories.find((c) => c.id === categoryId);
  };
  return (
    <>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {selectedCategory
                  ? `${getCategoryInfo(selectedCategory)?.name} Promotions`
                  : "Featured Promotions"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {filteredPromotions.length} active deals near you
              </p>
            </div>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-4/3 bg-gray-200 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPromotions.map((promotion) => (
                <PromotionCard
                  key={promotion.id}
                  promotion={promotion}
                  onClick={() => {
                    setSelectedPromotion(promotion);
                    setOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      <PromotionDetailModal
        open={open}
        onOpenChange={setOpen}
        promotion={selectedPromotion}
      />
    </>
  );
};
export default PromotionFeed;
