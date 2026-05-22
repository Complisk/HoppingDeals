import { NextResponse } from "next/server";

// Server-side proxy for OpenStreetMap Nominatim's free geocoding API.
// We route through Next so we can attach the User-Agent header Nominatim's
// usage policy requires, debounce/throttle if needed, and swap providers
// later without touching the UI.
//
// Usage policy reminder: <= 1 req/sec, identify with a real User-Agent that
// includes contact info. See https://operations.osmfoundation.org/policies/nominatim/

export const runtime = "nodejs";

const USER_AGENT =
  "HoppingDeals/1.0 (https://hoppingdeals.world; support@hoppingdeals.world) location-autocomplete";

export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim();
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");
  // Bias toward cities/states/regions; Nominatim doesn't expose a hard
  // city-only filter, but `featuretype=city` + `featuretype=state` cover
  // the common autocomplete cases. We omit it here so we still get the
  // right results for "Manila" (which is more specific than featuretype
  // would allow), and just rely on the addressdetails to classify.

  let nominatimRes;
  try {
    nominatimRes = await fetch(url.toString(), {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
        "Accept-Language": "en",
      },
      // Nominatim is sometimes slow; cap the wait and let the UI show "no results".
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    return NextResponse.json(
      { results: [], error: "Location service unavailable" },
      { status: 502 },
    );
  }

  if (!nominatimRes.ok) {
    return NextResponse.json(
      { results: [], error: `Upstream ${nominatimRes.status}` },
      { status: 502 },
    );
  }

  const data = await nominatimRes.json();

  // Normalise into the shape the client component expects.
  const results = (Array.isArray(data) ? data : []).map((row) => {
    const a = row.address || {};
    const city =
      a.city ||
      a.town ||
      a.village ||
      a.hamlet ||
      a.municipality ||
      a.suburb ||
      null;
    const state = a.state || a.region || null;
    const stateCode = a["ISO3166-2-lvl4"]
      ? a["ISO3166-2-lvl4"].split("-")[1]
      : null;
    const country = a.country || null;
    const countryCode = (a.country_code || "").toUpperCase() || null;

    // What "kind" is this — city or state? Nominatim's `addresstype` is the
    // most reliable signal we have.
    const kind =
      row.addresstype === "state" || row.addresstype === "province"
        ? "state"
        : "city";

    return {
      id: row.place_id ? String(row.place_id) : `${row.osm_type}-${row.osm_id}`,
      label: row.display_name,
      city,
      state,
      state_code: stateCode,
      country,
      country_code: countryCode,
      lat: row.lat ? Number(row.lat) : null,
      lng: row.lon ? Number(row.lon) : null,
      kind,
    };
  });

  return NextResponse.json({ results });
}
