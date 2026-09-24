import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, SectionHeader } from "@/components/ui";
import { slugToLabel } from "@/lib/growth";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const label = slugToLabel(slug);
  return { title: `${label} housing transparency | DomusGraph`, description: `Neighbourhood-level housing signals and rental transparency for ${label}.` };
}

export default async function NeighbourhoodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const label = slugToLabel(slug);
  return (
    <PageShell>
      <SectionHeader eyebrow="Neighbourhood housing graph" title={`${label} rental transparency`} body="Neighbourhood pages aggregate user-submitted housing events and public information as the graph grows." />
      <div className="panel">
        <p className="text-slate">This neighbourhood page is ready for property, review, maintenance, licensing, and public-data aggregation once enough local profiles exist.</p>
        <Link href="/search" className="button-primary mt-5">Add a local property</Link>
      </div>
    </PageShell>
  );
}
