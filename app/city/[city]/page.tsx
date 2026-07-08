import type { Metadata } from "next";
import { PropertyCard } from "@/components/property-card";
import { EmptyState, PageShell, SectionHeader } from "@/components/ui";
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
  return (
    <PageShell>
      <SectionHeader eyebrow="City housing graph" title={`${label} rental intelligence`} body="Property profiles, reviews, maintenance events, and trust signals for this city." />
      <div className="grid gap-4 lg:grid-cols-2">
        {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>
      {!properties.length ? <EmptyState title="No properties indexed yet" body="Create the first profile in this city to start growing the local Housing Graph." href="/search" action="Add a property" /> : null}
    </PageShell>
  );
}
