import { createSupabaseAdminClient, isConfigured } from "@/lib/supabase";
import { epcCertificateUrl, findMatchingEpcRecords, isEpcConfigured, searchEpcByPostcode, type EpcRecord } from "@/lib/epc";
import { findMatchingSales, searchPricePaidByPostcode, type PricePaidRecord } from "@/lib/land-registry";

export type PropertyObservation = {
  id: string;
  property_id: string;
  observation_type: string;
  observed_at: string | null;
  recorded_at: string;
  source: string;
  source_url: string | null;
  source_ref: string | null;
  data: Record<string, unknown>;
  created_at: string;
};

export async function getPropertyObservations(propertyId: string): Promise<PropertyObservation[]> {
  if (!isConfigured()) return [];
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("property_observations")
    .select("*")
    .eq("property_id", propertyId)
    .order("observed_at", { ascending: false, nullsFirst: false });
  return data ?? [];
}

/**
 * Persists every matched EPC certificate as a property_observations row (not
 * just the latest) and backfills properties.uprn on first match. Idempotent —
 * safe to call on every property page view or from a backfill script.
 */
export async function persistEpcObservations(propertyId: string, records: EpcRecord[]) {
  if (!isConfigured() || !records.length) return;
  const supabase = createSupabaseAdminClient();

  const rows = records.map((record) => ({
    property_id: propertyId,
    observation_type: "epc",
    observed_at: record.registrationDate,
    source: "epc_register",
    source_url: epcCertificateUrl(record.certificateNumber),
    source_ref: record.certificateNumber,
    data: { energy_band: record.currentEnergyEfficiencyBand, uprn: record.uprn }
  }));
  await supabase.from("property_observations").upsert(rows, { onConflict: "property_id,observation_type,source_ref", ignoreDuplicates: true });

  const uprn = records.find((record) => record.uprn)?.uprn;
  if (uprn) {
    await supabase.from("properties").update({ uprn }).eq("id", propertyId).is("uprn", null);
  }
}

/**
 * Reads persisted EPC observations for a property; if none exist yet, does a
 * live lookup and persists the result (lazy backfill on first view). Returns
 * the matched records, most recent first, same shape as a live lookup.
 */
export async function getOrFetchEpcRecords(propertyId: string, postcode: string | null, addressLine1: string, addressLine2?: string | null): Promise<EpcRecord[]> {
  const existing = await getPropertyObservations(propertyId);
  const epcObservations = existing.filter((observation) => observation.observation_type === "epc");
  if (epcObservations.length) {
    return epcObservations.map((observation) => ({
      certificateNumber: observation.source_ref ?? "",
      addressLine1,
      addressLine2: addressLine2 ?? null,
      postcode: postcode ?? "",
      currentEnergyEfficiencyBand: String(observation.data.energy_band ?? ""),
      registrationDate: observation.observed_at ?? observation.created_at,
      uprn: (observation.data.uprn as number | null) ?? null
    }));
  }

  if (!postcode || !isEpcConfigured()) return [];
  const epcRecords = await searchEpcByPostcode(postcode);
  const matches = findMatchingEpcRecords(epcRecords, addressLine1, addressLine2);
  if (matches.length) await persistEpcObservations(propertyId, matches);
  return matches;
}

/**
 * Sale price history from HM Land Registry Price Paid Data. Conservatively
 * matched (see findMatchingSales) — always labelled as a sale price, never
 * conflated with rent anywhere this is displayed.
 */
export async function persistLandRegistrySales(propertyId: string, records: PricePaidRecord[]) {
  if (!isConfigured() || !records.length) return;
  const supabase = createSupabaseAdminClient();
  const rows = records.map((record) => ({
    property_id: propertyId,
    observation_type: "land_registry_sale",
    observed_at: new Date(record.transactionDate).toISOString().slice(0, 10),
    source: "hm_land_registry",
    source_url: "https://landregistry.data.gov.uk/",
    source_ref: record.transactionId,
    data: { price_paid: record.pricePaid, property_type: record.propertyType, new_build: record.newBuild }
  }));
  await supabase.from("property_observations").upsert(rows, { onConflict: "property_id,observation_type,source_ref", ignoreDuplicates: true });
}

export async function getOrFetchLandRegistrySales(propertyId: string, postcode: string | null, addressLine1: string, addressLine2?: string | null): Promise<PricePaidRecord[]> {
  const existing = await getPropertyObservations(propertyId);
  const saleObservations = existing.filter((observation) => observation.observation_type === "land_registry_sale");
  if (saleObservations.length) {
    return saleObservations.map((observation) => ({
      transactionId: observation.source_ref ?? "",
      pricePaid: Number(observation.data.price_paid ?? 0),
      transactionDate: observation.observed_at ?? observation.created_at,
      paon: null,
      saon: null,
      street: null,
      propertyType: (observation.data.property_type as string | null) ?? null,
      newBuild: Boolean(observation.data.new_build)
    }));
  }

  if (!postcode) return [];
  const records = await searchPricePaidByPostcode(postcode);
  const matches = findMatchingSales(records, addressLine1, addressLine2);
  if (matches.length) await persistLandRegistrySales(propertyId, matches);
  return matches;
}
