import type { Metadata } from "next";
import { PropertyCard } from "@/components/property-card";
import { EmptyState, PageShell, SectionHeader } from "@/components/ui";
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
  return (
    <PageShell>
      <SectionHeader eyebrow="Postcode housing graph" title={`${label} property intelligence`} body="Search profile activity, reviews, and maintenance events in this postcode area." />
      <div className="grid gap-4 lg:grid-cols-2">
        {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>
      {!properties.length ? <EmptyState title="No postcode profiles yet" body="Add a property profile to start collecting structured housing signals here." href="/search" action="Add a property" /> : null}
    </PageShell>
  );
}
