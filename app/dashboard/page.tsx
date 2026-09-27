import Link from "next/link";
import { EmptyState, PageShell, SectionHeader, Stat } from "@/components/ui";
import { getDashboardData } from "@/lib/data";
import { withdrawClaimAction, withdrawIssueAction, withdrawPhotoAction, withdrawReviewAction } from "@/lib/actions";
import { ContributorReputation, ContributionPrompt } from "@/components/growth";

const STATUS_LABEL: Record<string, string> = { pending: "Awaiting moderation", approved: "Published", rejected: "Not published" };

export default async function DashboardPage() {
  const { user, reviews, issues, claims, photos, propertyIds, housingEvents, referrals } = await getDashboardData();

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Reviews submitted" value={reviews.length} />
        <Stat label="Issues reported" value={issues.length} />
        <Stat label="Properties contributed to" value={propertyIds.size} />
        <Stat label="Claimed properties" value={claims.length} />
        <Stat label="Photos submitted" value={photos.length} />
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
      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <Activity
          title="Recent reviews"
          rows={reviews.map((item) => ({
            id: item.id,
            label: `${item.overall_rating}/5 review`,
            status: STATUS_LABEL[item.moderation_status] ?? item.moderation_status,
            href: `/property/${item.property_id}`,
            withdrawAction: item.moderation_status === "pending" ? withdrawReviewAction : undefined
          }))}
        />
        <Activity
          title="Recent issues"
          rows={issues.map((item) => ({
            id: item.id,
            label: `${item.issue_type} - ${item.status}`,
            status: STATUS_LABEL[item.moderation_status] ?? item.moderation_status,
            href: `/property/${item.property_id}`,
            withdrawAction: item.moderation_status === "pending" ? withdrawIssueAction : undefined
          }))}
        />
        <Activity
          title="Claims"
          rows={claims.map((item) => ({
            id: item.id,
            label: "Property claim",
            status: STATUS_LABEL[item.claim_status] ?? item.claim_status,
            href: `/property/${item.property_id}`,
            withdrawAction: item.claim_status === "pending" ? withdrawClaimAction : undefined
          }))}
        />
        <Activity
          title="Photos"
          rows={photos.map((item) => ({
            id: item.id,
            label: "Photo",
            status: STATUS_LABEL[item.moderation_status] ?? item.moderation_status,
            href: `/property/${item.property_id}`,
            withdrawAction: item.moderation_status === "pending" ? withdrawPhotoAction : undefined
          }))}
        />
        <Activity
          title="Your invites"
          rows={referrals.map((item) => ({
            id: item.id,
            label: `${item.invite_type} - ${item.accepted_at ? "contributed" : "pending"}`,
            href: `/invite/${item.referral_code}`
          }))}
        />
      </div>
      <div className="mt-8">
        <ContributionPrompt source="dashboard" />
      </div>
    </PageShell>
  );
}

type ActivityRow = {
  id: string;
  label: string;
  status?: string;
  href: string;
  withdrawAction?: (formData: FormData) => Promise<void>;
};

function Activity({ title, rows }: { title: string; rows: ActivityRow[] }) {
  return (
    <section className="panel">
      <h2 className="font-semibold text-ink">{title}</h2>
      <div className="mt-4 grid gap-2">
        {rows.length ? (
          rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-2 rounded-md bg-mist px-3 py-2 text-sm">
              <Link href={row.href} className="min-w-0 flex-1 text-ink transition-colors duration-150 ease-out hover:text-signal">
                <div className="truncate">{row.label}</div>
                {row.status ? <div className="text-xs text-slate">{row.status}</div> : null}
              </Link>
              {row.withdrawAction ? (
                <form action={row.withdrawAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <button type="submit" className="shrink-0 text-xs font-semibold text-slate transition-colors duration-150 ease-out hover:text-signal">
                    Withdraw
                  </button>
                </form>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate">No activity yet.</p>
        )}
      </div>
    </section>
  );
}
