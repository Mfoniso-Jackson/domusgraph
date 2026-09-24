const UK_POSTCODE_REGEX = /^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})$/i;

export function normalizeUkPostcode(raw: string): string | null {
  const compact = raw.trim().toUpperCase();
  const match = compact.match(UK_POSTCODE_REGEX);
  if (!match) return null;
  return `${match[1]} ${match[2]}`;
}

export async function lookupPostcode(postcode: string) {
  const normalized = normalizeUkPostcode(postcode);
  if (!normalized) return null;
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(normalized)}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== 200 || !json.result) return null;
    return {
      postcode: json.result.postcode as string,
      adminDistrict: (json.result.admin_district as string | null) ?? null,
      region: (json.result.region as string | null) ?? null,
      country: (json.result.country as string | null) ?? null
    };
  } catch {
    return null;
  }
}
