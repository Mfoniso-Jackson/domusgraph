import Link from "next/link";
import { EmptyState, PageShell, SectionHeader, Stat } from "@/components/ui";
import { getDashboardData } from "@/lib/data";
import { ContributorReputation, ContributionPrompt } from "@/components/growth";

export default async function DashboardPage() {
  const { user, reviews, issues, claims, propertyIds, housingEvents, referrals } = await getDashboardData();

  if (!user) {
    return (
      <PageShell>
        <EmptyState title="Sign in to see your dashboard" body="Sign in with a magic link to track your reviews, issues, claims, and contributor reputation." href="/auth/sign-in?next=/dashboard" action="Sign in" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionHeader eyebrow="Dashboard" title="Your DomusGraph contributions" body={`Signed in as ${user.email}.`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Reviews submitted" value={reviews.length} />
        <Stat label="Issues reported" value={issues.length} />
        <Stat label="Properties contributed to" value={propertyIds.size} />
        <Stat label="Claimed properties" value={claims.length} />
      </div>
      <div className="mt-8">
        <ContributorReputation
          reviews={reviews.length}
          issues={issues.length}
          claims={claims.length}
          events={housingEvents.length}
          referrals={referrals.length}
          verifiedReviews={reviews.filter((item) => item.verification_level === "verified").length}
          verifiedIssues={issues.filter((item) => item.verification_level === "verified").length}
        />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Activity title="Recent reviews" rows={reviews.map((item) => ({ id: item.id, label: `${item.overall_rating}/5 review`, href: `/property/${item.property_id}` }))} />
        <Activity title="Recent issues" rows={issues.map((item) => ({ id: item.id, label: `${item.issue_type} - ${item.status}`, href: `/property/${item.property_id}` }))} />
        <Activity title="Claims" rows={claims.map((item) => ({ id: item.id, label: `Claim ${item.claim_status}`, href: `/property/${item.property_id}` }))} />
      </div>
      <div className="mt-8">
        <ContributionPrompt source="dashboard" />
      </div>
    </PageShell>
  );
}

function Activity({ title, rows }: { title: string; rows: { id: string; label: string; href: string }[] }) {
  return (
    <section className="panel">
      <h2 className="font-semibold text-ink">{title}</h2>
      <div className="mt-4 grid gap-2">
        {rows.length ? rows.map((row) => <Link key={row.id} href={row.href} className="rounded bg-mist px-3 py-2 text-sm text-ink hover:text-clay">{row.label}</Link>) : <p className="text-sm text-moss">No activity yet.</p>}
      </div>
    </section>
  );
}
