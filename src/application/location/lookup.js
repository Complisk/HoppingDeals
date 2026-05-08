export class LookupLocationUseCase {
  constructor({ geoLocator }) {
    this.geoLocator = geoLocator;
  }

  async execute({ ip, city, state, lat, lon }) {
    if (city || state || (lat && lon)) {
      return {
        city: city || null,
        state: state || null,
        lat: lat ?? null,
        lon: lon ?? null,
      };
    }

    let resolved = { city: null, state: null, lat: null, lon: null };
    if (ip) {
      try {
        const geo = await this.geoLocator.lookup(ip);
        resolved = {
          city: geo.city ?? null,
          state: geo.state ?? null,
          lat: geo.lat ?? null,
          lon: geo.lon ?? null,
        };
      } catch {
        // Fall through with nulls.
      }
    }
    return resolved;
  }
}
