import { PropertyCard } from "@/components/property-card";
import { PageShell, SectionHeader, TextField } from "@/components/ui";
import { createPropertyAction, logSearchAction } from "@/lib/actions";
import { searchProperties } from "@/lib/data";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const properties = await searchProperties(q);

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Property search"
        title="Search a rental property"
        body="Look up an address or postcode. If it is not listed yet, create the profile so future renters can add structured history."
      />

      <form action={logSearchAction} className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input className="field flex-1" name="q" defaultValue={q} placeholder="Enter address or postcode" />
        <button className="button-primary" type="submit">Search</button>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>

      {properties.length === 0 ? (
        <div className="panel mt-8">
          <h2 className="text-xl font-semibold text-ink">No matching property yet</h2>
          <p className="mt-2 text-sm text-moss">Create a lightweight profile. Reviews, issues, and claims can attach to it immediately.</p>
          <form action={createPropertyAction} className="mt-5 grid gap-4 md:grid-cols-2">
            <TextField label="Address line 1" name="address_line_1" />
            <TextField label="Address line 2" name="address_line_2" required={false} />
            <TextField label="City" name="city" required={false} />
            <TextField label="Postcode" name="postcode" placeholder={q} />
            <TextField label="Property type" name="property_type" required={false} placeholder="Flat, house, HMO" />
            <div className="md:col-span-2">
              <button className="button-primary" type="submit">Create property profile</button>
            </div>
          </form>
        </div>
      ) : null}
    </PageShell>
  );
}
