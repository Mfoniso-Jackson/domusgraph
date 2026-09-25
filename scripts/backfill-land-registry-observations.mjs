// Backfills property_observations with HM Land Registry Price Paid Data
// (sale history) for existing properties. Conservative matching: only a
// clean house/flat-number match is persisted, matching the same principle
// as the EPC backfill — no guessing. Idempotent, safe to re-run.
//
// Usage: node --env-file=.env.local scripts/backfill-land-registry-observations.mjs [--dry-run]

const dryRun = process.argv.includes("--dry-run");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const dbHeaders = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };

function normalizeToken(text) {
  return text.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function extractLeadingNumber(address) {
  const match = address.trim().match(/^(\d+[A-Za-z]?)\b/);
  return match ? normalizeToken(match[1]) : null;
}

function findMatchingSales(records, addressLine1, addressLine2) {
  const targetNumber = extractLeadingNumber(addressLine1) ?? (addressLine2 ? extractLeadingNumber(addressLine2) : null);
  if (!targetNumber) return [];
  return records
    .filter((record) => {
      const paon = record.paon ? normalizeToken(record.paon) : null;
      const saon = record.saon ? normalizeToken(record.saon) : null;
      return paon === targetNumber || saon === targetNumber;
    })
    .sort((a, b) => (a.transactionDate > b.transactionDate ? -1 : 1));
}

const propsRes = await fetch(`${SUPABASE_URL}/rest/v1/properties?select=id,address_line_1,address_line_2,postcode`, { headers: dbHeaders });
const properties = await propsRes.json();
console.log(`${properties.length} properties to check`);

// Group by postcode so each postcode is only queried once against Land Registry.
const byPostcode = new Map();
for (const property of properties) {
  const key = property.postcode?.toUpperCase().trim();
  if (!key) continue;
  if (!byPostcode.has(key)) byPostcode.set(key, []);
  byPostcode.get(key).push(property);
}
console.log(`${byPostcode.size} unique postcodes`);

let observationsWritten = 0;
let propertiesMatched = 0;
let noMatch = 0;
let index = 0;

for (const [postcode, propsAtPostcode] of byPostcode) {
  index++;
  const url = `http://landregistry.data.gov.uk/data/ppi/transaction-record.json?propertyAddress.postcode=${encodeURIComponent(postcode)}&_pageSize=200`;
  let records = [];
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (res.ok) {
      const json = await res.json();
      records = (json?.result?.items ?? []).map((item) => {
        const address = item.propertyAddress ?? {};
        return {
          transactionId: item.transactionId ?? item._about ?? "",
          pricePaid: Number(item.pricePaid ?? 0),
          transactionDate: item.transactionDate ?? "",
          paon: address.paon ?? null,
          saon: address.saon ?? null,
          propertyType: item.propertyType?.prefLabel?.[0]?._value ?? null,
          newBuild: Boolean(item.newBuild)
        };
      });
    }
  } catch (error) {
    console.warn(`  [${index}/${byPostcode.size}] ${postcode}: fetch failed (${error.message})`);
    continue;
  }

  for (const property of propsAtPostcode) {
    const matches = findMatchingSales(records, property.address_line_1, property.address_line_2);
    if (!matches.length) {
      noMatch++;
      continue;
    }
    propertiesMatched++;
    console.log(`  [${index}/${byPostcode.size}] ${property.address_line_1}, ${postcode}: ${matches.length} sale(s)`);

    if (!dryRun) {
      const rows = matches.map((record) => ({
        property_id: property.id,
        observation_type: "land_registry_sale",
        observed_at: record.transactionDate ? new Date(record.transactionDate).toISOString().slice(0, 10) : null,
        source: "hm_land_registry",
        source_url: "https://landregistry.data.gov.uk/",
        source_ref: record.transactionId,
        data: { price_paid: record.pricePaid, property_type: record.propertyType, new_build: record.newBuild }
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
    }
  }
}

console.log(`\nDone. ${observationsWritten} observations written across ${propertiesMatched} matched properties, ${noMatch} properties with no Land Registry match.`);
if (dryRun) console.log("(dry run — no writes made)");
