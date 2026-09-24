// Seeds real property profiles (address + postcode only, no reviews) from the
// government EPC register for a given council area. Safe to re-run — skips
// addresses already in the database.
//
// Usage: node --env-file=.env.local scripts/seed-properties-from-epc.mjs [council] [count] [--dry-run]
// Example: node --env-file=.env.local scripts/seed-properties-from-epc.mjs Cambridge 200

const council = process.argv[2] ?? "Cambridge";
const targetCount = Number(process.argv[3] ?? 200);
const dryRun = process.argv.includes("--dry-run");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EPC_KEY = process.env.EPC_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !EPC_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or EPC_API_KEY.");
  process.exit(1);
}

const dbHeaders = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };

function titleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function normKey(postcode, addr1) {
  return `${postcode.toUpperCase().replace(/\s+/g, "")}|${addr1.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
}

// 1. Fetch EPC certificates for the council, most-recent-first, deduping to one profile per address
const seen = new Map();
for (let page = 1; page <= 10 && seen.size < targetCount * 2; page++) {
  const res = await fetch(
    `https://api.get-energy-performance-data.communities.gov.uk/api/domestic/search?council%5B%5D=${encodeURIComponent(council)}&page_size=500&current_page=${page}`,
    { headers: { Authorization: `Bearer ${EPC_KEY}` } }
  );
  const json = await res.json();
  if (!json.data || !json.data.length) break;
  for (const rec of json.data) {
    const key = normKey(rec.postcode, rec.addressLine1);
    if (!seen.has(key)) seen.set(key, rec); // first occurrence = most recent, API returns newest first
  }
  console.log(`page ${page}: ${json.data.length} records, ${seen.size} unique addresses so far`);
}

const candidates = Array.from(seen.values()).slice(0, targetCount);
console.log(`Selected ${candidates.length} unique ${council} addresses to seed`);
console.log("Sample:", candidates.slice(0, 5).map((c) => `${c.addressLine1}, ${c.addressLine2 || ""} ${c.postcode}`.trim()));

if (dryRun) {
  console.log("Dry run, stopping before DB writes.");
  process.exit(0);
}

// 2. Skip addresses already in the database (idempotent re-run)
const existingRes = await fetch(`${SUPABASE_URL}/rest/v1/properties?select=postcode,address_line_1`, { headers: dbHeaders });
const existing = new Set((await existingRes.json()).map((p) => normKey(p.postcode, p.address_line_1)));
const toInsert = candidates.filter((c) => !existing.has(normKey(c.postcode, c.addressLine1)));
console.log(`${toInsert.length} new (${candidates.length - toInsert.length} already exist)`);

if (!toInsert.length) {
  console.log("Nothing to insert.");
  process.exit(0);
}

// 3. Bulk insert properties, then linked housing_events tagged as epc_seed for auditability
const CHUNK = 50;
const insertedProperties = [];
for (let i = 0; i < toInsert.length; i += CHUNK) {
  const chunk = toInsert.slice(i, i + CHUNK).map((rec) => ({
    address_line_1: rec.addressLine1,
    address_line_2: rec.addressLine2 || null,
    city: titleCase(rec.postTown || council),
    postcode: rec.postcode,
    property_type: null,
    created_by: null
  }));
  const res = await fetch(`${SUPABASE_URL}/rest/v1/properties`, { method: "POST", headers: dbHeaders, body: JSON.stringify(chunk) });
  const data = await res.json();
  if (!Array.isArray(data)) {
    console.error("Insert failed:", data);
    process.exit(1);
  }
  insertedProperties.push(...data);
  console.log(`Inserted properties ${i + 1}-${i + chunk.length}`);
}

let eventCount = 0;
for (let i = 0; i < insertedProperties.length; i += CHUNK) {
  const chunk = insertedProperties.slice(i, i + CHUNK).map((p) => ({
    property_id: p.id,
    actor_type: "anonymous",
    event_type: "property_created",
    metadata: { source: "epc_seed", postcode: p.postcode },
    is_verified: false,
    source_id: null
  }));
  const res = await fetch(`${SUPABASE_URL}/rest/v1/housing_events`, { method: "POST", headers: dbHeaders, body: JSON.stringify(chunk) });
  if (!res.ok) {
    console.error("Housing event insert failed:", await res.text());
  } else {
    eventCount += chunk.length;
  }
}

console.log(`Done. Seeded ${insertedProperties.length} ${council} property profiles with ${eventCount} linked housing events.`);
