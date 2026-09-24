import { createSupabaseAdminClient, isConfigured } from "@/lib/supabase";

type EpcSearchRecord = {
  addressLine1: string;
  addressLine2: string | null;
  postcode: string;
  postTown: string | null;
};

export function titleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function normKey(postcode: string, addr1: string) {
  return `${postcode.toUpperCase().replace(/\s+/g, "")}|${addr1.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
}

export async function seedPropertiesFromEpc({ council = "Cambridge", count = 200 }: { council?: string; count?: number } = {}) {
  const epcKey = process.env.EPC_API_KEY;
  if (!epcKey || !isConfigured()) {
    return { skipped: true as const, reason: "EPC_API_KEY or Supabase not configured" };
  }

  const seen = new Map<string, EpcSearchRecord>();
  for (let page = 1; page <= 10 && seen.size < count * 2; page++) {
    const res = await fetch(
      `https://api.get-energy-performance-data.communities.gov.uk/api/domestic/search?council%5B%5D=${encodeURIComponent(council)}&page_size=500&current_page=${page}`,
      { headers: { Authorization: `Bearer ${epcKey}` } }
    );
    if (!res.ok) break;
    const json = await res.json();
    if (!json.data?.length) break;
    for (const rec of json.data as EpcSearchRecord[]) {
      const key = normKey(rec.postcode, rec.addressLine1);
      if (!seen.has(key)) seen.set(key, rec);
    }
  }

  const candidates = Array.from(seen.values()).slice(0, count);
  if (!candidates.length) return { skipped: false as const, inserted: 0, scanned: 0 };

  const supabase = createSupabaseAdminClient();
  const { data: existingRows } = await supabase.from("properties").select("postcode, address_line_1");
  const existing = new Set((existingRows ?? []).map((p) => normKey(p.postcode, p.address_line_1)));
  const toInsert = candidates.filter((c) => !existing.has(normKey(c.postcode, c.addressLine1)));

  if (!toInsert.length) return { skipped: false as const, inserted: 0, scanned: candidates.length };

  const payload = toInsert.map((rec) => ({
    address_line_1: rec.addressLine1,
    address_line_2: rec.addressLine2 || null,
    city: titleCase(rec.postTown || council),
    postcode: rec.postcode,
    property_type: null,
    created_by: null
  }));
  const { data: inserted, error } = await supabase.from("properties").insert(payload).select("id, postcode");
  if (error) throw error;

  await supabase.from("housing_events").insert(
    (inserted ?? []).map((p) => ({
      property_id: p.id,
      actor_type: "anonymous",
      event_type: "property_created",
      metadata: { source: "epc_seed", postcode: p.postcode },
      is_verified: false
    }))
  );

  return { skipped: false as const, inserted: inserted?.length ?? 0, scanned: candidates.length };
}
