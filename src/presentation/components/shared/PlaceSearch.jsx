"use client";

// City / state autocomplete used by the promotion-create flow
// (LocationTargeter). Backed by /api/location/search which proxies to
// OpenStreetMap Nominatim — same provider as HeaderLocationSearch, no
// Google Maps key or billing required.
//
// `searchType` filters the result set: "city" only returns rows whose
// kind is "city", "state" only returns rows whose kind is "state". The
// endpoint hands us a `kind` field that classifies each result based on
// Nominatim's addresstype.

import React, { useState, useRef, useEffect, memo } from "react";

const PlaceSearch = ({ searchType, onSelectPlace }) => {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

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
        const all = Array.isArray(data?.results) ? data.results : [];
        // Filter to the requested kind. Nominatim's classification can
        // miss a state header on city queries (and vice versa), so we
        // also include rows that have the matching field populated.
        const filtered = all.filter((r) => {
          if (searchType === "city") return r.kind === "city" || !!r.city;
          if (searchType === "state") return r.kind === "state" || (!r.city && !!r.state);
          return true;
        });
        setPredictions(filtered);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("place search failed", err);
          setPredictions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleSelect = (pred) => {
    setQuery(pred.label);
    setPredictions([]);
    onSelectPlace({
      placeId: pred.id,
      description: pred.label,
      city: pred.city || "",
      state: pred.state || "",
      state_code: pred.state_code || "",
      country: pred.country || "",
      country_code: pred.country_code || "",
      formattedAddress: pred.label,
      lat: pred.lat,
      lng: pred.lng,
    });
  };

  // Hide the dropdown when focus leaves the component.
  const handleBlur = (e) => {
    if (!containerRef.current?.contains(e.relatedTarget)) {
      setPredictions([]);
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      onBlur={handleBlur}
      className="space-y-1 relative"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder={
          searchType === "city" ? "Search city..." : "Search state..."
        }
        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {loading && <p className="text-xs text-gray-500">Searching...</p>}

      {predictions.length > 0 && (
        <ul className="absolute z-50 w-full border border-gray-300 rounded-lg max-h-52 overflow-y-auto bg-white shadow-md">
          {predictions.map((pred) => (
            <li
              key={pred.id}
              tabIndex={0}
              onClick={() => handleSelect(pred)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between gap-2"
            >
              <span className="truncate" title={pred.label}>
                {pred.label}
              </span>
              <span className="text-xs text-gray-500 shrink-0">
                {pred.kind === "state" ? "(State)" : "(City)"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!loading && query.trim().length >= 2 && predictions.length === 0 && (
        <p className="text-xs text-gray-400">No matches found</p>
      )}
    </div>
  );
};

export default memo(PlaceSearch);
