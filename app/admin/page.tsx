import Link from "next/link";
import { EmptyState, PageShell, SectionHeader, Stat } from "@/components/ui";
import { getAdminData } from "@/lib/data";
import { moderateClaimAction, moderateIssueAction, moderatePhotoAction, moderateReviewAction } from "@/lib/actions";

const exports = [
  ["Properties", "properties"],
  ["Reviews", "reviews"],
  ["Issues", "maintenance_issues"],
  ["Claims", "property_claims"],
  ["Property manager intake responses", "property_manager_intake"],
  ["Housing events", "housing_events"],
  ["Onboarding responses", "onboarding_responses"],
  ["Feedback responses", "feedback_responses"],
  ["Referrals", "referrals"]
] as const;

export default async function AdminPage() {
  const data = await getAdminData();

  if (!data.allowed) {
    return (
      <PageShell>
        <EmptyState title="Admin access required" body="This dashboard is protected by the ADMIN_EMAILS allowlist and an authenticated Supabase session." href="/auth/sign-in?next=/admin" action="Sign in" />
      </PageShell>
    );
  }
  const adminData = data as {
    allowed: true;
    counts: {
      properties: number;
      reviews: number;
      issues: number;
      claims: number;
      intakes: number;
      housingEvents: number;
      verifiedEvents: number;
      feedback: number;
      averageReviewsPerProperty: number;
      averageEventsPerProperty: number;
    };
    recentReviews: Record<string, string | number | null>[];
    recentIssues: Record<string, string | number | null>[];
    pendingReviews: Record<string, string | number | null>[];
    pendingIssues: Record<string, string | number | null>[];
    pendingClaims: Record<string, string | number | null>[];
    pendingPhotos: Record<string, string | number | null>[];
    recentHousingEvents: Record<string, string | number | boolean | null>[];
    recentFeedback: Record<string, string | number | null>[];
    dailyGrowth: Record<string, string | number | null>[];
    topUsers: Record<string, string | number | null>[];
    topCities: Record<string, string | number | null>[];
  };

  return (
    <PageShell>
      <SectionHeader eyebrow="Graph growth" title="Verified Housing Events dashboard" body="Monitor Housing Graph growth, trust signals, and contribution momentum." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total properties" value={adminData.counts.properties} />
        <Stat label="Total reviews" value={adminData.counts.reviews} />
        <Stat label="Total housing events" value={adminData.counts.housingEvents} />
        <Stat label="Verified events" value={adminData.counts.verifiedEvents} />
        <Stat label="Maintenance issues" value={adminData.counts.issues} />
        <Stat label="Landlord claims" value={adminData.counts.claims} />
        <Stat label="Manager submissions" value={adminData.counts.intakes} />
        <Stat label="Feedback answers" value={adminData.counts.feedback} />
        <Stat label="Avg reviews/property" value={adminData.counts.averageReviewsPerProperty} />
        <Stat label="Avg events/property" value={adminData.counts.averageEventsPerProperty} />
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-ink">Moderation queue</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <ModerationList
            title={`Pending reviews (${adminData.pendingReviews.length})`}
            rows={adminData.pendingReviews.map((item) => ({ id: String(item.id), label: `${item.overall_rating}/5 · ${String(item.review_text ?? "").slice(0, 60)}` }))}
            action={moderateReviewAction}
          />
          <ModerationList
            title={`Pending issues (${adminData.pendingIssues.length})`}
            rows={adminData.pendingIssues.map((item) => ({ id: String(item.id), label: `${item.issue_type} · ${item.severity}` }))}
            action={moderateIssueAction}
          />
          <ModerationList
            title={`Pending claims (${adminData.pendingClaims.length})`}
            rows={adminData.pendingClaims.map((item) => ({ id: String(item.id), label: `${item.name} · ${item.role}` }))}
            action={moderateClaimAction}
          />
          <ModerationList
            title={`Pending photos (${adminData.pendingPhotos.length})`}
            rows={adminData.pendingPhotos.map((item) => ({ id: String(item.id), label: "Photo evidence", imageUrl: String(item.image_url) }))}
            action={moderatePhotoAction}
          />
        </div>
      </section>

      <section className="mt-8 panel">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-xl font-semibold text-ink">Exports and discovery</h2>
          <Link href="/admin/feedback" className="button-secondary">Browse feedback</Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {exports.map(([label, table]) => (
            <Link key={table} href={`/admin/export?table=${table}`} className="button-secondary">{label} CSV</Link>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <AdminList title="Recent housing events" rows={adminData.recentHousingEvents.map((item) => `${item.event_type} · ${item.actor_type} · ${item.is_verified ? "verified" : "unverified"}`)} />
        <AdminList title="Daily growth" rows={adminData.dailyGrowth.map((item) => `${item.event_day} · ${item.total_events} events · ${item.verified_events} verified`)} />
        <AdminList title="Top growing cities" rows={adminData.topCities.map((item) => `${item.city} · ${item.event_count} events · ${item.property_count} properties`)} />
        <AdminList title="Top contributing users" rows={adminData.topUsers.map((item) => `${item.actor_type} · ${item.contribution_count} contributions · ${item.verified_count} verified`)} />
        <AdminList title="Recent reviews" rows={adminData.recentReviews.map((item) => `${item.overall_rating}/5 · ${item.moderation_status} · ${new Date(String(item.created_at ?? "")).toLocaleDateString("en-GB")}`)} />
        <AdminList title="Recent issues" rows={adminData.recentIssues.map((item) => `${item.issue_type} · ${item.severity} · ${item.moderation_status}`)} />
        <AdminList title="Recent feedback" rows={adminData.recentFeedback.map((item) => `${item.source} · ${String(item.answer ?? "").slice(0, 80)}`)} />
      </div>
    </PageShell>
  );
}

function AdminList({ title, rows }: { title: string; rows: string[] }) {
  return (
    <section className="panel">
      <h2 className="font-semibold text-ink">{title}</h2>
      <div className="mt-4 grid gap-2">
        {rows.length ? rows.map((row, index) => <div key={`${row}-${index}`} className="rounded-md bg-mist px-3 py-2 text-sm text-ink">{row}</div>) : <p className="text-sm text-slate">No records yet.</p>}
      </div>
    </section>
  );
}

const compactButtonBase =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2.5 text-xs font-semibold transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-mist active:scale-95";

function ModerationList({
  title,
  rows,
  action
}: {
  title: string;
  rows: { id: string; label: string; imageUrl?: string }[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <section className="panel">
      <h2 className="font-semibold text-ink">{title}</h2>
      <div className="mt-4 grid gap-2">
        {rows.length ? (
          rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-3 rounded-md bg-mist px-3 py-2 text-sm text-ink">
              <span className="flex min-w-0 items-center gap-2 truncate">
                {row.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
                ) : null}
                <span className="truncate">{row.label}</span>
              </span>
              <div className="flex shrink-0 gap-2">
                <form action={action}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button type="submit" className={`${compactButtonBase} border border-leaf/30 bg-surface text-leaf hover:bg-leaf/10`}>
                    Approve
                  </button>
                </form>
                <form action={action}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <button type="submit" className={`${compactButtonBase} border border-slate/25 bg-surface text-slate hover:border-signal/40 hover:text-signal`}>
                    Reject
                  </button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate">Nothing pending.</p>
        )}
      </div>
    </section>
  );
}
