import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, MessageSquare, Star } from "lucide-react";
import { EmptyState, PageShell, Stat } from "@/components/ui";
import { getPropertyDetail } from "@/lib/data";
import { CompletionScore, ContributionPrompt, TrustBadges } from "@/components/growth";
import { logAnalyticsEvent } from "@/lib/events";

function average(rows: Record<string, unknown>[], key: string) {
  const values = rows.map((row) => Number(row[key])).filter(Boolean);
  if (!values.length) return "New";
  return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await logAnalyticsEvent("property_view", { property_id: id });
  const { property, reviews, issues, claims, events } = await getPropertyDetail(id);
  if (!property) notFound();

  const timeline = [
    ...reviews.map((review) => ({ type: "Review", icon: MessageSquare, date: review.created_at, title: `${review.overall_rating}/5 overall`, body: review.review_text })),
    ...issues.map((issue) => ({ type: "Issue", icon: AlertTriangle, date: issue.created_at, title: `${issue.issue_type} - ${issue.severity}`, body: issue.description })),
    ...claims.map((claim) => ({ type: "Claim", icon: Star, date: claim.created_at, title: `${claim.role} claim ${claim.claim_status}`, body: "A landlord or property operator submitted a profile claim." })),
    ...events.map((event) => ({ type: "Housing Event", icon: Star, date: event.created_at, title: String(event.event_type).replaceAll("_", " "), body: event.is_verified ? "Verified housing event" : "Housing graph event" }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const issueCounts = issues.reduce<Record<string, number>>((acc, issue) => {
    acc[issue.issue_type] = (acc[issue.issue_type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <PageShell>
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase text-clay">Property profile</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{property.address_line_1}</h1>
          <p className="mt-2 text-moss">{[property.address_line_2, property.city, property.postcode].filter(Boolean).join(", ")}</p>
          <div className="mt-4">
            <TrustBadges
              verifiedReviews={reviews.filter((review) => review.verification_level === "verified").length}
              verifiedIssues={issues.filter((issue) => issue.verification_level === "verified").length}
              claims={claims.length}
              approvedClaim={claims.some((claim) => claim.claim_status === "approved")}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/property/${id}/review`} className="button-primary">Leave a review</Link>
          <Link href={`/property/${id}/issue`} className="button-secondary">Report an issue</Link>
          <Link href={`/property/${id}/claim`} className="button-secondary">Claim this property</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Stat label="Overall rating" value={average(reviews, "overall_rating")} />
        <Stat label="Maintenance" value={average(reviews, "maintenance_rating")} />
        <Stat label="Communication" value={average(reviews, "communication_rating")} />
        <Stat label="Condition" value={average(reviews, "condition_rating")} />
        <Stat label="Deposit fairness" value={average(reviews, "deposit_fairness_rating")} />
        <Stat label="Safety" value={average(reviews, "safety_rating")} />
      </div>

      <div className="mt-8">
        <CompletionScore property={property} />
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="panel">
          <h2 className="text-xl font-semibold text-ink">Reported issues summary</h2>
          {Object.keys(issueCounts).length ? (
            <div className="mt-4 grid gap-2">
              {Object.entries(issueCounts).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between rounded bg-mist px-3 py-2 text-sm">
                  <span>{type}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-moss">No maintenance issues have been reported yet.</p>
          )}
        </div>

        <div className="panel">
          <h2 className="text-xl font-semibold text-ink">Timeline</h2>
          {timeline.length ? (
            <div className="mt-5 grid gap-4">
              {timeline.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article key={`${item.type}-${index}`} className="border-l-2 border-moss/20 pl-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-clay">
                      <Icon className="h-4 w-4" />
                      {item.type} · {new Date(item.date).toLocaleDateString("en-GB")}
                    </div>
                    <h3 className="mt-1 font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 line-clamp-3 text-sm leading-6 text-moss">{item.body}</p>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Help future renters by being the first to share what you know." body="A first review or maintenance report turns this page from a listing into living housing intelligence." />
          )}
        </div>
      </section>

      <section className="mt-8 rounded border border-moss/15 bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-moss">
          <Star className="h-4 w-4 text-clay" />
          Useful with little data
        </div>
        <p className="mt-2 text-sm leading-6 text-moss">
          DomusGraph separates structured ratings, maintenance events, response time, and claim signals so sparse early data can still help renters ask better questions before signing.
        </p>
      </section>
      <div className="mt-8">
        <ContributionPrompt propertyId={id} source="property_profile" />
      </div>
    </PageShell>
  );
}
