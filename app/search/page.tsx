import { Search as SearchIcon } from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import { PageShell, SelectField, TextField } from "@/components/ui";
import { createPropertyAction, logSearchAction } from "@/lib/actions";
import { getPlatformStats, getSearchDiscovery, searchProperties } from "@/lib/data";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const [properties, discovery, stats] = await Promise.all([searchProperties(q), getSearchDiscovery(), getPlatformStats()]);

  return (
    <PageShell>
      <div className="mb-8 max-w-3xl">
        <p className="mb-2 text-sm font-semibold uppercase text-signal">Property search</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Search Cambridge. See what a listing won&apos;t show you.</h1>
        <p className="mt-3 text-base leading-7 text-slate">
          Look up an address or postcode for its public record and tenant history. Not listed yet? Create the profile — it takes seconds, and it starts the history for whoever searches it next.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3 sm:max-w-md">
        <div className="rounded-md bg-mist px-3 py-2.5">
          <div className="font-mono text-lg font-bold tabular-nums text-ink">{stats.properties}</div>
          <div className="text-xs text-slate">Properties</div>
        </div>
        <div className="rounded-md bg-mist px-3 py-2.5">
          <div className="font-mono text-lg font-bold tabular-nums text-ink">{stats.observations}</div>
          <div className="text-xs text-slate">Public records</div>
        </div>
        <div className="rounded-md bg-mist px-3 py-2.5">
          <div className="font-mono text-lg font-bold tabular-nums text-ink">{stats.reviews}</div>
          <div className="text-xs text-slate">Reviews</div>
        </div>
      </div>

      <form action={logSearchAction} className="panel mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" aria-hidden="true" />
          <input
            className="field"
            style={{ paddingLeft: "2.25rem" }}
            name="q"
            defaultValue={q}
            placeholder="Enter address, postcode, or partial match"
            aria-label="Search address or postcode"
          />
        </div>
        <button className="button-primary sm:w-fit" type="submit">Search</button>
      </form>

      {!q && (discovery.recentSearches.length || discovery.popularProperties.length) ? (
        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <section className="panel">
            <h2 className="font-semibold text-ink">Recent searches</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {discovery.recentSearches.map((term) => (
                <a
                  key={term}
                  className="rounded-full bg-mist px-3 py-1 text-sm text-ink transition-colors duration-150 ease-out hover:bg-signal/10 hover:text-signal"
                  href={`/search?q=${encodeURIComponent(term)}`}
                >
                  {term}
                </a>
              ))}
            </div>
          </section>
          <section className="panel">
            <h2 className="font-semibold text-ink">Popular properties</h2>
            <div className="mt-3 grid gap-2">
              {discovery.popularProperties.slice(0, 3).map((property) => <a key={property.id} className="text-sm font-medium text-ink hover:text-signal" href={`/property/${property.id}`}>{property.address_line_1}, {property.postcode}</a>)}
            </div>
          </section>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>

      {properties.length === 0 ? (
        <div className="panel mt-8">
          <h2 className="text-xl font-semibold text-ink">{q ? `Nothing at "${q}" yet` : "No matching property yet"}</h2>
          <p className="mt-2 text-sm text-slate">
            {q
              ? "That's not a gap in our search — it's a gap in the record. Create the profile below and it's there the next time someone looks."
              : "Create a lightweight profile. Reviews, issues, and claims can attach to it immediately."}
          </p>
          <form action={createPropertyAction} className="mt-5 grid gap-4 md:grid-cols-2">
            <TextField label="Address line 1" name="address_line_1" />
            <TextField label="Address line 2" name="address_line_2" required={false} />
            <TextField label="City" name="city" required={false} />
            <TextField label="Postcode" name="postcode" placeholder={q} />
            <SelectField label="Property type" name="property_type" required={false} options={["Flat", "House", "HMO", "Studio", "Maisonette", "Other"]} />
            <div className="md:col-span-2">
              <button className="button-primary" type="submit">Create property profile</button>
            </div>
          </form>
        </div>
      ) : null}
    </PageShell>
  );
}
