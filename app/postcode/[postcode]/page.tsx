import type { Metadata } from "next";
import { PropertyCard } from "@/components/property-card";
import { EmptyState, PageShell } from "@/components/ui";
import { getPropertiesByPostcode } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ postcode: string }> }): Promise<Metadata> {
  const { postcode } = await params;
  const label = decodeURIComponent(postcode).toUpperCase();
  return { title: `${label} rental reviews | DomusGraph`, description: `Rental property reviews and housing events for postcode ${label}.` };
}

export default async function PostcodePage({ params }: { params: Promise<{ postcode: string }> }) {
  const { postcode } = await params;
  const label = decodeURIComponent(postcode).toUpperCase();
  const properties = await getPropertiesByPostcode(label);
  const observationCount = properties.reduce((total, property) => total + (property.observation_count ?? 0), 0);
  const reviewCount = properties.reduce((total, property) => total + property.review_count, 0);

  return (
    <PageShell>
      <div className="mb-8 max-w-3xl">
        <p className="mb-2 text-sm font-semibold uppercase text-signal">Postcode housing graph</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{label} property intelligence</h1>
        <p className="mt-3 text-base leading-7 text-slate">Public record and tenant history for every tracked address in this postcode.</p>
      </div>

      {properties.length ? (
        <div className="mb-8 grid grid-cols-3 gap-3 sm:max-w-md">
          <div className="rounded-md bg-mist px-3 py-2.5">
            <div className="font-mono text-lg font-bold tabular-nums text-ink">{properties.length}</div>
            <div className="text-xs text-slate">Properties</div>
          </div>
          <div className="rounded-md bg-mist px-3 py-2.5">
            <div className="font-mono text-lg font-bold tabular-nums text-ink">{observationCount}</div>
            <div className="text-xs text-slate">Public records</div>
          </div>
          <div className="rounded-md bg-mist px-3 py-2.5">
            <div className="font-mono text-lg font-bold tabular-nums text-ink">{reviewCount}</div>
            <div className="text-xs text-slate">Reviews</div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>
      {!properties.length ? <EmptyState title="No postcode profiles yet" body="Add a property profile to start collecting structured housing signals here." href="/search" action="Add a property" /> : null}
    </PageShell>
  );
}
