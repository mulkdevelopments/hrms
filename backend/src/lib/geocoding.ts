export type GeoTagInput = {
  latitude: number;
  longitude: number;
  geoTag?: string | null;
  geoAddress?: string | null;
};

export type GeoTagResult = {
  geoTag: string | null;
  geoAddress: string | null;
};

const geoCache = new Map<string, GeoTagResult>();

function cacheKey(latitude: number, longitude: number) {
  return `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
}

function shortLabelFromAddress(address: Record<string, string>, fallback: string) {
  return address.city
    || address.town
    || address.village
    || address.suburb
    || address.neighbourhood
    || address.state
    || fallback;
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<GeoTagResult> {
  const key = cacheKey(latitude, longitude);
  const cached = geoCache.get(key);
  if (cached) return cached;

  const coordFallback = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("zoom", "16");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "HRMS/1.0 (attendance geo-tagging)",
      },
    });
    if (!response.ok) {
      const result = { geoTag: coordFallback, geoAddress: null };
      geoCache.set(key, result);
      return result;
    }

    const payload = (await response.json()) as {
      display_name?: string;
      name?: string;
      address?: Record<string, string>;
    };
    const address = payload.address ?? {};
    const geoTag = shortLabelFromAddress(address, payload.name ?? coordFallback);
    const geoAddress = typeof payload.display_name === "string" ? payload.display_name : null;
    const result = { geoTag, geoAddress };
    geoCache.set(key, result);
    return result;
  } catch {
    const result = { geoTag: coordFallback, geoAddress: null };
    geoCache.set(key, result);
    return result;
  }
}

export async function resolveGeoTag(input: GeoTagInput): Promise<GeoTagResult> {
  const clientTag = input.geoTag?.trim();
  const clientAddress = input.geoAddress?.trim();
  if (clientTag) {
    return {
      geoTag: clientTag,
      geoAddress: clientAddress || null,
    };
  }

  return reverseGeocode(input.latitude, input.longitude);
}
