import { PropertyCard } from "@/components/property-card";
import { PageShell, SectionHeader, SelectField, TextField } from "@/components/ui";
import { createPropertyAction, logSearchAction } from "@/lib/actions";
import { getSearchDiscovery, searchProperties } from "@/lib/data";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const properties = await searchProperties(q);
  const discovery = await getSearchDiscovery();

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Property search"
        title="Search a rental property"
        body="Look up an address or postcode. If it is not listed yet, create the profile so future renters can add structured history."
      />

      <form action={logSearchAction} className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input className="field flex-1" name="q" defaultValue={q} placeholder="Enter address, postcode, or partial match" aria-label="Search address or postcode" />
        <button className="button-primary" type="submit">Search</button>
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
          <h2 className="text-xl font-semibold text-ink">No matching property yet</h2>
          <p className="mt-2 text-sm text-slate">Create a lightweight profile. Reviews, issues, and claims can attach to it immediately.</p>
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
