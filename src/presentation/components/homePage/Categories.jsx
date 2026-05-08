"use client";

import React from "react";
const Categories = () => {
  const categories = [
    {
      name: "Nail X",
      icon: "https://picsum.photos/100/100?random=1",
      label: "Modern Bistro",
    },
    {
      name: "Restaurant",
      icon: "https://picsum.photos/100/100?random=2",
      label: "Bistro",
    },
    {
      name: "Retailer",
      icon: "https://picsum.photos/100/100?random=3",
      label: "Shop",
    },
    {
      name: "Airlines",
      icon: "https://picsum.photos/100/100?random=4",
      label: "Fly High",
    },
    {
      name: "Automotive",
      icon: "https://picsum.photos/100/100?random=5",
      label: "Garage",
    },
    {
      name: "Casino",
      icon: "https://picsum.photos/100/100?random=6",
      label: "Grand Mall",
    },
  ];
  return (
    <div className="relative mb-16 overflow-hidden mt-3 bg-gray-300 h-[30vh]"></div>
  );
};
export default Categories;
