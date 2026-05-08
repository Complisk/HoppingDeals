/** @implements {import("../../application/ports/geo-locator.js").GeoLocator} */
export class IpInfoGeoLocator {
  constructor({ token } = {}) {
    this.token = token;
  }

  async lookup(ip) {
    if (!ip) {
      return { city: null, state: null, lat: null, lon: null, country: null, timezone: null };
    }
    const url = this.token
      ? `https://ipinfo.io/${ip}/json?token=${encodeURIComponent(this.token)}`
      : `https://ipinfo.io/${ip}/json`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`ipinfo lookup failed: ${res.status}`);
    }
    const data = await res.json();
    const [latStr, lonStr] = (data.loc ?? "").split(",");
    return {
      city: data.city ?? null,
      state: data.region ?? null,
      lat: latStr ? Number(latStr) : null,
      lon: lonStr ? Number(lonStr) : null,
      country: data.country ?? null,
      timezone: data.timezone ?? null,
    };
  }
}
