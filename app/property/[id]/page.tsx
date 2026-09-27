import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Banknote, MessageSquare, Star, Zap } from "lucide-react";
import { EmptyState, PageShell, Stat } from "@/components/ui";
import { getOwnPendingSubmissions, getPropertyDetail } from "@/lib/data";
import { CompletionScore, ContributionPrompt, TrustBadges } from "@/components/growth";
import { ShareButton } from "@/components/share-button";
import { logAnalyticsEvent } from "@/lib/events";
import { epcCertificateUrl } from "@/lib/epc";
import { getOrFetchEpcRecords, getOrFetchLandRegistrySales } from "@/lib/observations";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { property, reviews } = await getPropertyDetail(id);
  if (!property) return {};

  const addressLabel = [property.address_line_1, property.city, property.postcode].filter(Boolean).join(", ");
  const title = `${property.address_line_1}: Housing History | DomusGraph`;
  const description = property.observation_count
    ? `${property.observation_count} public record${property.observation_count === 1 ? "" : "s"} and ${reviews.length} tenant review${reviews.length === 1 ? "" : "s"} for ${addressLabel}. See the history before you rent.`
    : `Housing history for ${addressLabel}. See what's known before you rent, and add what you know.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://domusgraph.com";
  const url = `${siteUrl}/property/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "DomusGraph", type: "website" },
    twitter: { card: "summary", title, description }
  };
}

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

type TimelineTag = "Public record" | "Verified" | "Reported" | "Disputed" | "Pending";

const tagStyles: Record<TimelineTag, string> = {
  "Public record": "bg-mist text-slate",
  Verified: "bg-leaf/10 text-leaf",
  Reported: "bg-mist text-slate",
  Disputed: "border border-slate/30 text-slate",
  Pending: "border border-signal/30 text-signal"
};

const confidenceForTag: Record<TimelineTag, string> = {
  "Public record": "High. Sourced directly from a government register.",
  Verified: "High. Corroborated by an admin or a second independent source.",
  Reported: "Medium. A single contributor's account, not yet independently verified.",
  Disputed: "Low. This was reviewed and rejected, or is actively contested.",
  Pending: "Awaiting moderation. Only visible to you until an admin reviews it."
};

// housing_events already logs review/issue/claim submissions as their own
// entries. These get a richer dedicated timeline item instead, so the
// generic feed only contributes events with no dedicated representation.
const DEDICATED_EVENT_TYPES = new Set(["review_submitted", "maintenance_issue_reported", "maintenance_issue_resolved", "property_claimed"]);

function average(rows: Record<string, unknown>[], key: string) {
  const values = rows.map((row) => Number(row[key])).filter(Boolean);
  if (!values.length) return "New";
  return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await logAnalyticsEvent("property_view", { property_id: id });
  const { property, reviews, issues, claims, events, photos } = await getPropertyDetail(id);
  if (!property) notFound();

  const [epcRecords, saleRecords, ownPending] = await Promise.all([
    getOrFetchEpcRecords(id, property.postcode, property.address_line_1, property.address_line_2),
    getOrFetchLandRegistrySales(id, property.postcode, property.address_line_1, property.address_line_2),
    getOwnPendingSubmissions(id)
  ]);
  const epcMatch = epcRecords[0] ?? null;

  const timeline = [
    ...epcRecords.map((record) => ({
      type: "Energy rating",
      icon: Zap,
      date: record.registrationDate,
      title: `Rating ${record.currentEnergyEfficiencyBand}`,
      body: "EPC certificate registered for this address.",
      tag: "Public record" as TimelineTag,
      source: "EPC Register (gov.uk)",
      sourceUrl: epcCertificateUrl(record.certificateNumber)
    })),
    ...saleRecords.map((record) => ({
      type: "Sale (Land Registry)",
      icon: Banknote,
      date: record.transactionDate,
      title: `Sold for ${gbp.format(record.pricePaid)}`,
      body: "Recorded sale price, not a rental amount. HM Land Registry Price Paid Data.",
      tag: "Public record" as TimelineTag,
      source: "HM Land Registry Price Paid Data",
      sourceUrl: "https://landregistry.data.gov.uk/"
    })),
    ...reviews.map((review) => ({
      type: "Review",
      icon: MessageSquare,
      date: review.created_at,
      title: `${review.overall_rating}/5 overall`,
      body: review.review_text,
      tag: (review.verification_level === "verified" ? "Verified" : "Reported") as TimelineTag,
      source: "Former tenant contribution",
      sourceUrl: null as string | null
    })),
    ...issues.map((issue) => ({
      type: "Issue",
      icon: AlertTriangle,
      date: issue.created_at,
      title: `${issue.issue_type} - ${issue.severity}`,
      body: issue.description,
      tag: (issue.verification_level === "verified" ? "Verified" : "Reported") as TimelineTag,
      source: "Tenant-reported maintenance record",
      sourceUrl: null as string | null
    })),
    ...claims.map((claim) => ({
      type: "Claim",
      icon: Star,
      date: claim.created_at,
      title: `${claim.role} claim ${claim.claim_status}`,
      body: "A landlord or property operator submitted a profile claim.",
      tag: (claim.verification_level === "verified" ? "Verified" : claim.claim_status === "rejected" ? "Disputed" : "Reported") as TimelineTag,
      source: "Landlord or property operator submission",
      sourceUrl: null as string | null
    })),
    ...events
      .filter((event) => !DEDICATED_EVENT_TYPES.has(String(event.event_type)))
      .map((event) => ({
        type: "Housing Event",
        icon: Star,
        date: event.created_at,
        title: String(event.event_type).replaceAll("_", " "),
        body: "Housing graph event.",
        tag: (event.verification_status === "verified" ? "Verified" : event.verification_status === "disputed" ? "Disputed" : "Reported") as TimelineTag,
        source: "DomusGraph housing event log",
        sourceUrl: null as string | null
      })),
    ...ownPending.reviews.map((review) => ({
      type: "Review",
      icon: MessageSquare,
      date: review.created_at,
      title: `${review.overall_rating}/5 overall (your submission)`,
      body: review.review_text,
      tag: "Pending" as TimelineTag,
      source: "Your submission",
      sourceUrl: null as string | null
    })),
    ...ownPending.issues.map((issue) => ({
      type: "Issue",
      icon: AlertTriangle,
      date: issue.created_at,
      title: `${issue.issue_type} - ${issue.severity} (your submission)`,
      body: issue.description,
      tag: "Pending" as TimelineTag,
      source: "Your submission",
      sourceUrl: null as string | null
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const hasContributorContent = reviews.length + issues.length + claims.length > 0;

  const issueCounts = issues.reduce<Record<string, number>>((acc, issue) => {
    acc[issue.issue_type] = (acc[issue.issue_type] ?? 0) + 1;
    return acc;
  }, {});

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://domusgraph.com";
  const propertyUrl = `${siteUrl}/property/${id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: property.address_line_1,
    address: {
      "@type": "PostalAddress",
      streetAddress: [property.address_line_1, property.address_line_2].filter(Boolean).join(", "),
      addressLocality: property.city ?? "Cambridge",
      postalCode: property.postcode,
      addressCountry: "GB"
    },
    url: propertyUrl,
    ...(property.average_rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: property.average_rating,
            reviewCount: property.review_count,
            bestRating: 5,
            worstRating: 1
          }
        }
      : {})
  };

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase text-signal">Property profile</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{property.address_line_1}</h1>
          <p className="mt-2 text-slate">{[property.address_line_2, property.city, property.postcode].filter(Boolean).join(", ")}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <TrustBadges
              verifiedReviews={reviews.filter((review) => review.verification_level === "verified").length}
              verifiedIssues={issues.filter((issue) => issue.verification_level === "verified").length}
              claims={claims.length}
              approvedClaim={claims.some((claim) => claim.claim_status === "approved")}
            />
            {epcMatch ? (
              <a
                href={epcCertificateUrl(epcMatch.certificateNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink transition-colors duration-150 ease-out hover:bg-signal/10 hover:text-signal"
              >
                <Zap className="h-3.5 w-3.5 text-signal" aria-hidden="true" />
                Energy rating {epcMatch.currentEnergyEfficiencyBand}
              </a>
            ) : null}
            <ShareButton url={propertyUrl} title={`${property.address_line_1}: Housing History | DomusGraph`} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/property/${id}/review`} className="button-primary">Leave a review</Link>
          <Link href={`/property/${id}/issue`} className="button-secondary">Report an issue</Link>
          <Link href={`/property/${id}/claim`} className="button-secondary">Claim this property</Link>
          <Link href={`/property/${id}/photo`} className="button-secondary">Add a photo</Link>
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

      {photos.length ? (
        <section className="mt-8 panel">
          <h2 className="text-xl font-semibold text-ink">Photos</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <div key={String(photo.id)} className="group relative aspect-square w-full overflow-hidden rounded-lg">
                <Image
                  src={String(photo.image_url)}
                  alt="Property evidence"
                  fill
                  className="object-cover transition-transform duration-200 ease-out group-hover:scale-105"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="panel">
          <h2 className="text-xl font-semibold text-ink">Reported issues summary</h2>
          {Object.keys(issueCounts).length ? (
            <div className="mt-4 grid gap-2">
              {Object.entries(issueCounts).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between rounded-md bg-mist px-3 py-2 text-sm">
                  <span>{type}</span>
                  <span className="font-mono font-semibold tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate">No maintenance issues have been reported yet.</p>
          )}
        </div>

        <div className="panel">
          <h2 className="text-xl font-semibold text-ink">Timeline</h2>
          {timeline.length && !hasContributorContent ? (
            <p className="mt-3 text-sm text-slate">
              Public records only so far. No tenant reviews or maintenance reports yet.{" "}
              <Link href={`/property/${id}/review`} className="font-semibold text-signal hover:underline">
                Be the first to share what you know
              </Link>
              .
            </p>
          ) : null}
          {timeline.length ? (
            <div className="mt-5 grid gap-4">
              {timeline.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article key={`${item.type}-${index}`} className="border-l-2 border-slate/20 pl-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-signal">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.type} · {new Date(item.date).toLocaleDateString("en-GB")}
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold ${tagStyles[item.tag]}`}>{item.tag}</span>
                    </div>
                    <h3 className="mt-1 font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate">{item.body}</p>
                    <details className="group mt-2">
                      <summary className="cursor-pointer list-none text-xs font-semibold text-signal underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 focus-visible:rounded">
                        How do we know?
                      </summary>
                      <div className="mt-2 grid gap-1.5 rounded-md bg-mist p-3 text-xs">
                        <div>
                          <span className="font-semibold text-ink">Source: </span>
                          <span className="text-slate">
                            {item.sourceUrl ? (
                              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-signal hover:underline">
                                {item.source}
                              </a>
                            ) : (
                              item.source
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-ink">Confidence: </span>
                          <span className="text-slate">{confidenceForTag[item.tag]}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-ink">Date: </span>
                          <span className="text-slate">{new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                      </div>
                    </details>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Help future renters by being the first to share what you know." body="A first review or maintenance report turns this page from a listing into living housing intelligence." />
          )}
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-slate/15 bg-surface p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate">
          <Star className="h-4 w-4 text-signal" aria-hidden="true" />
          Useful with little data
        </div>
        <p className="mt-2 text-sm leading-6 text-slate">
          DomusGraph separates structured ratings, maintenance events, response time, and claim signals so sparse early data can still help renters ask better questions before signing.
        </p>
      </section>
      <div className="mt-8">
        <ContributionPrompt propertyId={id} source="property_profile" />
      </div>
    </PageShell>
  );
}
