import type { Metadata } from "next";
import { PropertyCard } from "@/components/property-card";
import { EmptyState, PageShell } from "@/components/ui";
import { getPropertiesByCity } from "@/lib/data";
import { slugToLabel } from "@/lib/growth";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const label = slugToLabel(city);
  return { title: `${label} rental property reviews | DomusGraph`, description: `Housing events, reviews, and maintenance intelligence for rental properties in ${label}.` };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const label = slugToLabel(city);
  const properties = await getPropertiesByCity(label);
  const observationCount = properties.reduce((total, property) => total + (property.observation_count ?? 0), 0);
  const reviewCount = properties.reduce((total, property) => total + property.review_count, 0);

  return (
    <PageShell>
      <div className="mb-8 max-w-3xl">
        <p className="mb-2 text-sm font-semibold uppercase text-signal">City housing graph</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{label} rental intelligence</h1>
        <p className="mt-3 text-base leading-7 text-slate">Every profile below is a permanent record for that address — public data and tenant history in one place, not a listing that disappears once it&apos;s let.</p>
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
      {!properties.length ? <EmptyState title="No properties indexed yet" body="Create the first profile in this city to start growing the local Housing Graph." href="/search" action="Add a property" /> : null}
    </PageShell>
  );
}
