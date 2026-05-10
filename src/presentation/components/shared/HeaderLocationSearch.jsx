"use client";

// Location chip + autocomplete dropdown that powers the "I want to see
// promotions in <X>" filter. Backed by /api/location/search, which proxies
// to OpenStreetMap Nominatim. Free, no API key, no billing — at the cost
// of slightly chunkier results than Google Places.

import React, { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

const HeaderLocationSearch = ({ className = "" }) => {
  const [currentLocation, setCurrentLocation] = useState("Loading...");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Load current location from localStorage
  useEffect(() => {
    const loadLocation = () => {
      try {
        const stored = localStorage.getItem("userLocation");
        if (stored) {
          const location = JSON.parse(stored);
          const displayText =
            location.city && location.state_code
              ? `${location.city}, ${location.state_code}`
              : location.city || location.state || "Set Location";
          setCurrentLocation(displayText);
        } else {
          setCurrentLocation("Set Location");
        }
      } catch (e) {
        console.error("Error loading location:", e);
        setCurrentLocation("Set Location");
      }
    };
    loadLocation();
    const handleLocationChange = () => loadLocation();
    window.addEventListener("locationChanged", handleLocationChange);
    return () =>
      window.removeEventListener("locationChanged", handleLocationChange);
  }, []);

  // Autofocus the input when the dropdown opens.
  useEffect(() => {
    if (isSearchOpen) {
      // requestAnimationFrame is more reliable than autoFocus during a
      // conditional mount with click-outside listeners attached.
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [isSearchOpen]);

  // Search with debounce. Aborts any in-flight request when the user types again.
  const handleSearchChange = (value) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setPredictions([]);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(
          `/api/location/search?q=${encodeURIComponent(trimmed)}`,
          { signal: ctrl.signal },
        );
        if (!res.ok) {
          setPredictions([]);
          return;
        }
        const data = await res.json();
        setPredictions(Array.isArray(data?.results) ? data.results : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("location search failed", err);
          setPredictions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  // Pick a result.
  const handleSelect = (prediction) => {
    const locationData = {
      city: prediction.city,
      state: prediction.state,
      state_code: prediction.state_code,
      country: prediction.country,
      country_code: prediction.country_code,
      lat: prediction.lat,
      lng: prediction.lng,
      timezone: null,
      source: "manual",
    };
    localStorage.setItem("userLocation", JSON.stringify(locationData));

    const displayText =
      prediction.city && prediction.state_code
        ? `${prediction.city}, ${prediction.state_code}`
        : prediction.city || prediction.state || "Set Location";
    setCurrentLocation(displayText);

    window.dispatchEvent(
      new CustomEvent("locationChanged", { detail: locationData }),
    );

    setIsSearchOpen(false);
    setQuery("");
    setPredictions([]);
  };

  // Click-outside to close.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
        setQuery("");
        setPredictions([]);
      }
    };
    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsSearchOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-500 transition-colors"
      >
        <MapPin className="h-5 w-5 text-red-500 shrink-0" />
        <span className="font-medium truncate max-w-50">
          {currentLocation}
        </span>
      </button>

      {isSearchOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-3">
          <div className="mb-2">
            <p className="text-xs text-gray-500 mb-2">
              Search for a city or state
            </p>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Enter city name..."
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {loading && (
            <p className="text-xs text-gray-500 py-2">Searching...</p>
          )}

          {predictions.length > 0 && (
            <ul className="max-h-60 overflow-y-auto border-t border-gray-100 mt-2">
              {predictions.map((pred) => (
                <li
                  key={pred.id}
                  onClick={() => handleSelect(pred)}
                  className="px-3 py-2 cursor-pointer hover:bg-red-50 rounded text-sm flex justify-between items-center gap-2"
                >
                  <span className="text-gray-700 truncate" title={pred.label}>
                    {pred.label}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {pred.kind === "state" ? "(State)" : "(City)"}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {!loading && query.trim().length >= 2 && predictions.length === 0 && (
            <p className="text-xs text-gray-400 py-2 text-center">
              No matches found
            </p>
          )}
          {!loading && query.trim().length < 2 && (
            <p className="text-xs text-gray-400 py-2 text-center">
              Type at least 2 characters
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderLocationSearch;
