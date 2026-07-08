import Link from "next/link";
import { ContributionPrompt } from "@/components/growth";
import { PageShell, SectionHeader } from "@/components/ui";

const labels: Record<string, string> = {
  review: "Your review is now part of the Housing Graph.",
  issue: "Your maintenance report is now part of the Housing Graph.",
  claim: "Your claim has been submitted for review.",
  manager: "Your property manager signal has been recorded.",
  onboarding: "Your onboarding answers have been recorded.",
  feedback: "Your feedback helps shape the next housing problem we solve."
};

export default async function NextContributionPage({ searchParams }: { searchParams: Promise<{ propertyId?: string; event?: string }> }) {
  const { propertyId, event = "contribution" } = await searchParams;
  return (
    <PageShell>
      <SectionHeader eyebrow="Contribution saved" title={labels[event] ?? "Your contribution has been saved."} body="DomusGraph grows when one housing signal leads to the next useful signal." />
      <ContributionPrompt propertyId={propertyId} source={`post_${event}`} />
      <div className="mt-6 flex flex-wrap gap-3">
        {propertyId ? <Link className="button-primary" href={`/property/${propertyId}`}>Return to property</Link> : null}
        <Link className="button-secondary" href="/search">Search another property</Link>
      </div>
    </PageShell>
  );
}
