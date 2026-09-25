// Backfills property_observations (every historical EPC certificate, not
// just the latest) and properties.uprn for existing properties that were
// seeded before this table existed. Idempotent — safe to re-run.
//
// Usage: node --env-file=.env.local scripts/backfill-epc-observations.mjs [--dry-run]

const dryRun = process.argv.includes("--dry-run");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EPC_KEY = process.env.EPC_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !EPC_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or EPC_API_KEY.");
  process.exit(1);
}

const dbHeaders = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };

function normalizeAddressTokens(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
}

function tokenSetsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const token of a) if (!b.has(token)) return false;
  return true;
}

function findMatches(records, addressLine1, addressLine2) {
  const ourTokens = normalizeAddressTokens(`${addressLine1} ${addressLine2 ?? ""}`);
  return records
    .filter((record) => tokenSetsEqual(normalizeAddressTokens(`${record.addressLine1} ${record.addressLine2 ?? ""}`), ourTokens))
    .sort((a, b) => (a.registrationDate > b.registrationDate ? -1 : 1));
}

const propsRes = await fetch(`${SUPABASE_URL}/rest/v1/properties?select=id,address_line_1,address_line_2,postcode,uprn`, { headers: dbHeaders });
const properties = await propsRes.json();
console.log(`${properties.length} properties to check`);

let observationsWritten = 0;
let uprnsSet = 0;
let noMatch = 0;

for (const [index, property] of properties.entries()) {
  const res = await fetch(`https://api.get-energy-performance-data.communities.gov.uk/api/domestic/search?postcode=${encodeURIComponent(property.postcode)}`, {
    headers: { Authorization: `Bearer ${EPC_KEY}` }
  });
  if (!res.ok) {
    console.warn(`  [${index + 1}/${properties.length}] EPC lookup failed for ${property.postcode} (${res.status})`);
    continue;
  }
  const json = await res.json();
  const matches = findMatches(json.data ?? [], property.address_line_1, property.address_line_2);

  if (!matches.length) {
    noMatch++;
    continue;
  }

  console.log(`  [${index + 1}/${properties.length}] ${property.address_line_1}: ${matches.length} certificate(s)`);

  if (!dryRun) {
    const rows = matches.map((record) => ({
      property_id: property.id,
      observation_type: "epc",
      observed_at: record.registrationDate,
      source: "epc_register",
      source_url: `https://find-energy-certificate.service.gov.uk/energy-certificate/${record.certificateNumber}`,
      source_ref: record.certificateNumber,
      data: { energy_band: record.currentEnergyEfficiencyBand, uprn: record.uprn }
    }));
    const obsRes = await fetch(`${SUPABASE_URL}/rest/v1/property_observations`, {
      method: "POST",
      headers: { ...dbHeaders, Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify(rows)
    });
    if (obsRes.ok) {
      observationsWritten += matches.length;
    } else {
      console.warn(`    observation insert failed:`, await obsRes.text());
    }

    const uprn = matches.find((record) => record.uprn)?.uprn;
    if (uprn && !property.uprn) {
      await fetch(`${SUPABASE_URL}/rest/v1/properties?id=eq.${property.id}`, {
        method: "PATCH",
        headers: dbHeaders,
        body: JSON.stringify({ uprn })
      });
      uprnsSet++;
    }
  }
}

console.log(`\nDone. ${observationsWritten} observations written, ${uprnsSet} UPRNs set, ${noMatch} properties with no EPC match.`);
if (dryRun) console.log("(dry run — no writes made)");
