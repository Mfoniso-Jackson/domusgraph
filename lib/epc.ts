import { normalizeUkPostcode } from "@/lib/postcode";

export type EpcRecord = {
  certificateNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  postcode: string;
  currentEnergyEfficiencyBand: string;
  registrationDate: string;
  uprn: number | null;
};

export function isEpcConfigured() {
  return Boolean(process.env.EPC_API_KEY);
}

export async function searchEpcByPostcode(postcode: string): Promise<EpcRecord[]> {
  const apiKey = process.env.EPC_API_KEY;
  if (!apiKey) return [];
  const normalized = normalizeUkPostcode(postcode);
  if (!normalized) return [];
  try {
    const res = await fetch(`https://api.get-energy-performance-data.communities.gov.uk/api/domestic/search?postcode=${encodeURIComponent(normalized)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data as EpcRecord[]) ?? [];
  } catch {
    return [];
  }
}

function normalizeAddressTokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
}

function tokenSetsEqual(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const token of a) {
    if (!b.has(token)) return false;
  }
  return true;
}

export function findMatchingEpcRecord(records: EpcRecord[], addressLine1: string, addressLine2?: string | null) {
  const ourTokens = normalizeAddressTokens(`${addressLine1} ${addressLine2 ?? ""}`);
  const matches = records.filter((record) => tokenSetsEqual(normalizeAddressTokens(`${record.addressLine1} ${record.addressLine2 ?? ""}`), ourTokens));
  if (!matches.length) return null;
  // A property can have several certificates over time (re-assessed on sale/re-let); take the most recent.
  return matches.reduce((latest, record) => (record.registrationDate > latest.registrationDate ? record : latest));
}

export function epcCertificateUrl(certificateNumber: string) {
  return `https://find-energy-certificate.service.gov.uk/energy-certificate/${certificateNumber}`;
}
