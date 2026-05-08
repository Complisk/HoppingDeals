"use client";

import DealSlider from "@/presentation/components/homePage/DealSlider";
import FeaturedPromotion from "@/presentation/components/public/FeaturedPromotion";
import { useEffect } from "react";
import Hero from "@/presentation/components/homePage/Hero";
import Categories from "@/presentation/components/homePage/Categories";
import Header from "@/presentation/components/homePage/Header";
import Footer from "@/presentation/components/homePage/Footer";
import PromotionFeed from "@/presentation/components/public/PromotionFeed";
import { useUserLocation } from "@/presentation/lib/useUserLocation";
const Index = () => {
    const { location, loading } = useUserLocation();
    // function FetchLocation() {
    //   navigator.geolocation.getCurrentPosition(
    //     async (position) => {
    //       const { latitude, longitude } = position.coords;
    //       console.log("User location:", latitude, longitude);
    //       try {
    //         const res = await fetch(
    //           `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    //         );
    //         const data = await res.json();
    //         console.log("Location data:", data);
    //         // Example extracted values
    //         const city =
    //           data.city ||
    //           data.locality ||
    //           data.principalSubdivision ||
    //           "Unknown";
    //         const state = data.principalSubdivision || "Unknown";
    //         const country = data.countryName || "Unknown";
    //         console.log({ city, state, country });
    //       } catch (err) {
    //         console.error("Failed to reverse geocode", err);
    //       }
    //     },
    //     (error) => {
    //       console.error("Geolocation error:", error.message);
    //     },
    //     {
    //       enableHighAccuracy: true,
    //       timeout: 10000,
    //       maximumAge: 0,
    //     },
    //   );
    // }
    // const fetchPromotions = async () => {
    //   fetch(`https://complex-bakend.vercel.app/api/location`)
    //     .then((res) => res.json())
    //     .then((data) => console.log(data, "location data"));
    // };
    // useEffect(() => {
    //   fetchPromotions();
    //   FetchLocation();
    // }, []);
    return (<div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="py-6 px-4 sm:px-8">
          <Hero />
          <Categories />
          {/* <FeaturedPromotion /> */}
          <PromotionFeed selectedCategory={null}/>
          {/* <DealSlider title="Food & Beverage Deals" />
        <DealSlider title="Personal Care Deals" /> */}
        </div>
      </main>
      <Footer />
    </div>);
};
export default Index;
