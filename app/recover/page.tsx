import type { Metadata } from "next";
import { PropertyCard } from "@/components/property-card";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { PageShell, SelectField, TextField } from "@/components/ui";
import { createPropertyAction, logRecoverSearchAction } from "@/lib/actions";
import { searchProperties } from "@/lib/data";

export const metadata: Metadata = {
  title: "Recover your housing history | DomusGraph",
  description: "Search an old Cambridge address, current or former. See what's already on record, and help complete what's missing."
};

export default async function RecoverPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const properties = q ? await searchProperties(q) : [];

  return (
    <PageShell>
      <div className="mb-8 max-w-3xl">
        <p className="mb-2 text-sm font-semibold uppercase text-signal">Recover your housing history</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Where have you lived?</h1>
        <p className="mt-3 text-base leading-7 text-slate">
          Search a current or former Cambridge address. If DomusGraph already has something on record, you can help complete it. If it doesn&apos;t exist yet, you can start its history.
        </p>
      </div>

      <form action={logRecoverSearchAction} className="panel mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <AddressAutocomplete defaultValue={q} />
        <button className="button-primary sm:w-fit" type="submit">Search</button>
      </form>

      {!q ? (
        <div className="panel">
          <p className="text-sm text-slate">Enter an address above to see what DomusGraph already knows, or to start its history if it isn&apos;t here yet.</p>
        </div>
      ) : properties.length ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <div className="panel mt-6">
            <p className="text-sm text-slate">
              Lived somewhere else too? Search another address above, one visit can help complete more than one home&apos;s history.
            </p>
          </div>
        </>
      ) : (
        <div className="panel">
          <h2 className="text-xl font-semibold text-ink">Nothing at &quot;{q}&quot; yet</h2>
          <p className="mt-2 text-sm text-slate">
            That&apos;s not a dead end, it just means you&apos;d be starting its history. Create the profile below, then add what you remember.
          </p>
          <form action={createPropertyAction} className="mt-5 grid gap-4 md:grid-cols-2">
            <TextField label="Address line 1" name="address_line_1" />
            <TextField label="Address line 2" name="address_line_2" required={false} />
            <TextField label="City" name="city" required={false} />
            <TextField label="Postcode" name="postcode" placeholder={q} />
            <SelectField label="Property type" name="property_type" required={false} options={["Flat", "House", "HMO", "Studio", "Maisonette", "Other"]} />
            <div className="md:col-span-2">
              <button className="button-primary" type="submit">Start this home&apos;s history</button>
            </div>
          </form>
        </div>
      )}
    </PageShell>
  );
}
