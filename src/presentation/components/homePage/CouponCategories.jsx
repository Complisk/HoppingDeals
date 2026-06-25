"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BadgePercent,
  BriefcaseBusiness,
  Car,
  Coffee,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Home,
  Hotel,
  MapPin,
  Music,
  Paintbrush,
  PawPrint,
  Scissors,
  ShoppingBag,
  Sparkles,
  Utensils,
  Wrench,
} from "lucide-react";

const coupons = [
  {
    title: "Restaurants",
    slug: "restaurants",
    business: "Local kitchens",
    offer: "$10 off dinner",
    note: "Family meals, lunch specials, and date-night deals.",
    Icon: Utensils,
    accent: "#f97316",
  },
  {
    title: "Beauty & Spas",
    slug: "beauty-spas",
    business: "Salons and spas",
    offer: "30% off services",
    note: "Hair, nails, facials, massage, and wellness offers.",
    Icon: Sparkles,
    accent: "#ec4899",
  },
  {
    title: "Soap & Skincare",
    slug: "shopping",
    business: "Bath boutiques",
    offer: "Buy 2 get 1",
    note: "Handmade soaps, lotions, oils, and care bundles.",
    Icon: Scissors,
    accent: "#14b8a6",
  },
  {
    title: "Coffee & Tea",
    slug: "coffee-tea",
    business: "Cafes",
    offer: "Free pastry",
    note: "Morning drinks, study spots, and weekend treats.",
    Icon: Coffee,
    accent: "#7c3aed",
  },
  {
    title: "Home Services",
    slug: "home-services",
    business: "Home pros",
    offer: "15% off booking",
    note: "Cleaning, repairs, lawn care, and maintenance deals.",
    Icon: Home,
    accent: "#22c55e",
  },
  {
    title: "Auto Services",
    slug: "auto-services",
    business: "Auto shops",
    offer: "$19.99 oil change",
    note: "Tune-ups, detailing, tires, inspections, and repairs.",
    Icon: Car,
    accent: "#2563eb",
  },
  {
    title: "Pets",
    slug: "pets",
    business: "Pet care",
    offer: "Free nail trim",
    note: "Grooming, walking, boarding, and pet supply savings.",
    Icon: PawPrint,
    accent: "#f59e0b",
  },
  {
    title: "Shopping",
    slug: "shopping",
    business: "Local stores",
    offer: "20% off today",
    note: "Boutiques, gifts, supplies, and everyday finds.",
    Icon: ShoppingBag,
    accent: "#8b5cf6",
  },
  {
    title: "Health & Medical",
    slug: "health-medical",
    business: "Clinics",
    offer: "New patient deal",
    note: "Wellness visits, dental, vision, and therapy offers.",
    Icon: HeartPulse,
    accent: "#ef4444",
  },
  {
    title: "Professional Services",
    slug: "professional-services",
    business: "Local experts",
    offer: "Free consultation",
    note: "Tax, legal, marketing, design, and business support.",
    Icon: BriefcaseBusiness,
    accent: "#0f766e",
  },
  {
    title: "Arts & Entertainment",
    slug: "arts-entertainment",
    business: "Venues and studios",
    offer: "2 tickets deal",
    note: "Shows, classes, galleries, museums, and live events.",
    Icon: Paintbrush,
    accent: "#dc2626",
  },
  {
    title: "Nightlife",
    slug: "nightlife",
    business: "Night spots",
    offer: "Happy hour",
    note: "Lounges, bars, music, late-night food, and events.",
    Icon: Music,
    accent: "#9333ea",
  },
  {
    title: "Hotels & Casinos",
    slug: "hotels-casinos",
    business: "Stays and play",
    offer: "Weekend saver",
    note: "Rooms, dining credits, entertainment, and travel perks.",
    Icon: Hotel,
    accent: "#0891b2",
  },
  {
    title: "Fitness",
    slug: "fitness",
    business: "Gyms and trainers",
    offer: "First week free",
    note: "Classes, training, recovery, nutrition, and memberships.",
    Icon: Dumbbell,
    accent: "#16a34a",
  },
  {
    title: "Education",
    slug: "education",
    business: "Tutors and schools",
    offer: "Trial class",
    note: "Lessons, tutoring, workshops, and learning programs.",
    Icon: GraduationCap,
    accent: "#4f46e5",
  },
  {
    title: "Local Services",
    slug: "local-services",
    business: "Neighborhood help",
    offer: "Service bundle",
    note: "Practical nearby services from trusted local businesses.",
    Icon: Wrench,
    accent: "#64748b",
  },
];

export default function CouponCategories() {
  const [showAll, setShowAll] = useState(false);
  const visibleCoupons = showAll ? coupons : coupons.slice(0, 8);
  const remainingCount = coupons.length - 8;

  return (
    <section id="coupon-categories" className="coupon-section">
      <div className="coupon-section__inner">
        <div className="coupon-section__heading">
          <div>
            <p className="coupon-section__eyebrow">Business coupon cards</p>
            <h2>Featured categories with local savings</h2>
          </div>
          <div className="coupon-section__location">
            <MapPin aria-hidden="true" />
            <span>Deals near you</span>
          </div>
        </div>

        <div className="coupon-grid">
          {visibleCoupons.map((coupon) => (
            <CouponCard coupon={coupon} key={coupon.title} />
          ))}
        </div>

        {remainingCount > 0 ? (
          <div className="coupon-section__actions">
            <button
              type="button"
              className="coupon-more-button"
              onClick={() => setShowAll((value) => !value)}
              aria-expanded={showAll}
              aria-controls="coupon-categories"
            >
              <BadgePercent aria-hidden="true" />
              {showAll
                ? "Show fewer categories"
                : `More categories (${remainingCount})`}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CouponCard({ coupon }) {
  const { Icon } = coupon;

  return (
    <Link
      href={`/category/${coupon.slug}`}
      className="coupon-card"
      style={{ "--coupon-accent": coupon.accent }}
    >
      <span className="coupon-card__stub" aria-hidden="true" />
      <div className="coupon-card__top">
        <span className="coupon-card__icon">
          <Icon aria-hidden="true" />
        </span>
        <span className="coupon-card__business">{coupon.business}</span>
      </div>
      <h3>{coupon.title}</h3>
      <p className="coupon-card__offer">{coupon.offer}</p>
      <p className="coupon-card__note">{coupon.note}</p>
      <span className="coupon-card__cta">View coupons</span>
    </Link>
  );
}
