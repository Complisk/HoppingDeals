"use client";

import { useEffect, useState } from "react";

const LOCAL_STORAGE_KEY = "userLocation";

export const useUserLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveToLocalStorage = (loc) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loc));
    } catch {}
  };

  const fetchIpLocation = async () => {
    try {
      const res = await fetch(`https://ipwho.is/`);
      const data = await res.json();
      if (!data.success) throw new Error("IP lookup failed");

      const loc = {
        city: data.city || null,
        state: data.region || null,
        state_code: data.region_code || null,
        country: data.country || null,
        lat: data.latitude || null,
        lng: data.longitude || null,
        timezone: data.timezone?.id || null,
        source: "ip",
      };
      setLocation(loc);
      saveToLocalStorage(loc);
    } catch (err) {
      console.error("IP fallback error:", err);
      setLocation(null);
    }
  };

  const fetchBrowserLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return fetchIpLocation();
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          const data = await res.json();
          const loc = {
            city: data.city || data.locality || null,
            state: data.principalSubdivision || null,
            state_code: data.principalSubdivisionCode || null,
            country: data.countryName || null,
            lat: latitude,
            lng: longitude,
            timezone:
              data.localityInfo?.informative?.find((i) =>
                i.description?.toLowerCase()?.includes("time zone"),
              )?.name || null,
            source: "browser",
          };
          setLocation(loc);
          saveToLocalStorage(loc);
        } catch (err) {
          console.error("Reverse geocode failed:", err);
          fetchIpLocation();
        }
      },
      () => fetchIpLocation(),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    let stored;
    try {
      stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    } catch {}
    if (stored) {
      try {
        const loc = JSON.parse(stored);
        setLocation(loc);
        setLoading(false);
        return;
      } catch {}
    }
    fetchBrowserLocation();
  }, []);

  useEffect(() => {
    if (location !== null) setLoading(false);
  }, [location]);

  return { location, loading };
};
