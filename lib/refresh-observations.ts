import { createSupabaseAdminClient, isConfigured } from "@/lib/supabase";
import { findMatchingEpcRecords, isEpcConfigured, searchEpcByPostcode } from "@/lib/epc";
import { findMatchingSales, searchPricePaidByPostcode } from "@/lib/land-registry";
import { persistEpcObservations, persistLandRegistrySales } from "@/lib/observations";

/**
 * Turns the two verified-clean, one-off backfills (EPC, Land Registry) into
 * a real recurring crawler: scheduled, idempotent (persistence is deduped on
 * (property_id, observation_type, source_ref)), change-detecting — a new EPC
 * certificate or a newly recorded sale gets picked up on the next run; an
 * already-seen one is silently skipped. No new source, no scraping — just
 * the existing clean connectors run continuously instead of once.
 */
export async function refreshPropertyObservations() {
  if (!isConfigured()) return { skipped: true as const, reason: "Supabase not configured" };

  const supabase = createSupabaseAdminClient();
  const { data: properties } = await supabase.from("properties").select("id, address_line_1, address_line_2, postcode");
  const rows = properties ?? [];

  const byPostcode = new Map<string, typeof rows>();
  for (const property of rows) {
    const key = property.postcode?.toUpperCase().trim();
    if (!key) continue;
    if (!byPostcode.has(key)) byPostcode.set(key, []);
    byPostcode.get(key)!.push(property);
  }

  let epcObservationsWritten = 0;
  let saleObservationsWritten = 0;
  let propertiesScanned = 0;

  for (const [postcode, propsAtPostcode] of byPostcode) {
    propertiesScanned += propsAtPostcode.length;

    if (isEpcConfigured()) {
      const epcRecords = await searchEpcByPostcode(postcode);
      for (const property of propsAtPostcode) {
        const matches = findMatchingEpcRecords(epcRecords, property.address_line_1, property.address_line_2);
        if (matches.length) epcObservationsWritten += await persistEpcObservations(property.id, matches);
      }
    }

    const saleRecords = await searchPricePaidByPostcode(postcode);
    for (const property of propsAtPostcode) {
      const matches = findMatchingSales(saleRecords, property.address_line_1, property.address_line_2);
      if (matches.length) saleObservationsWritten += await persistLandRegistrySales(property.id, matches);
    }
  }

  return {
    skipped: false as const,
    propertiesScanned,
    postcodesChecked: byPostcode.size,
    newEpcObservations: epcObservationsWritten,
    newSaleObservations: saleObservationsWritten
  };
}
