import { normalizeUkPostcode } from "@/lib/postcode";

export type PricePaidRecord = {
  transactionId: string;
  pricePaid: number;
  transactionDate: string;
  paon: string | null;
  saon: string | null;
  street: string | null;
  propertyType: string | null;
  newBuild: boolean;
};

export function isLandRegistryConfigured() {
  return true; // Open Government Licence, no key required
}

export async function searchPricePaidByPostcode(postcode: string): Promise<PricePaidRecord[]> {
  const normalized = normalizeUkPostcode(postcode);
  if (!normalized) return [];
  try {
    const url = `http://landregistry.data.gov.uk/data/ppi/transaction-record.json?propertyAddress.postcode=${encodeURIComponent(normalized)}&_pageSize=200`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 3600 * 24 } });
    if (!res.ok) return [];
    const json = await res.json();
    const items = json?.result?.items ?? [];
    return items.map((item: Record<string, unknown>) => {
      const address = (item.propertyAddress ?? {}) as Record<string, unknown>;
      return {
        transactionId: String(item.transactionId ?? item._about ?? ""),
        pricePaid: Number(item.pricePaid ?? 0),
        transactionDate: String(item.transactionDate ?? ""),
        paon: address.paon ? String(address.paon) : null,
        saon: address.saon ? String(address.saon) : null,
        street: address.street ? String(address.street) : null,
        propertyType: extractLabel(item.propertyType),
        newBuild: Boolean(item.newBuild)
      };
    });
  } catch {
    return [];
  }
}

function extractLabel(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const prefLabel = (value as Record<string, unknown>).prefLabel;
  if (Array.isArray(prefLabel) && prefLabel[0]) return String((prefLabel[0] as Record<string, unknown>)._value ?? "");
  return null;
}

function normalizeToken(text: string) {
  return text.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function extractLeadingNumber(address: string): string | null {
  const match = address.trim().match(/^(\d+[A-Za-z]?)\b/);
  return match ? normalizeToken(match[1]) : null;
}

/**
 * Conservative on purpose: only returns a match when the house/flat number
 * lines up exactly. A wrong sale price attached to the wrong property is
 * worse than no sale price at all — see the entity-resolution principle in
 * the Cambridge Data Engine plan (never silently merge on a guess).
 */
export function findMatchingSales(records: PricePaidRecord[], addressLine1: string, addressLine2?: string | null): PricePaidRecord[] {
  const line1Number = extractLeadingNumber(addressLine1);
  const line2Number = addressLine2 ? extractLeadingNumber(addressLine2) : null;
  const targetNumber = line1Number ?? line2Number;
  if (!targetNumber) return [];

  const matches = records.filter((record) => {
    const paon = record.paon ? normalizeToken(record.paon) : null;
    const saon = record.saon ? normalizeToken(record.saon) : null;
    return paon === targetNumber || saon === targetNumber;
  });
  return matches.sort((a, b) => (a.transactionDate > b.transactionDate ? -1 : 1));
}
