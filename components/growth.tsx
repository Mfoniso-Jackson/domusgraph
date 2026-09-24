import Link from "next/link";
import { CheckCircle2, Circle, ShieldCheck, TrendingUp } from "lucide-react";
import { completionParts, getPropertyCompletion, getReputationScore, getTrustBadges, type CompletionInput } from "@/lib/growth";
import { createReferralAction, submitFeedbackAction } from "@/lib/actions";

export function CompletionScore({ property }: { property: CompletionInput }) {
  const completion = getPropertyCompletion(property);
  return (
    <section className="panel">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">Housing Profile Completeness</h2>
          <p className="mt-1 text-sm text-slate">Complete profiles create stronger housing graph signals.</p>
        </div>
        <div className="font-mono text-3xl font-bold tabular-nums text-signal">{completion.score}%</div>
      </div>
      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-mist"
        role="progressbar"
        aria-valuenow={completion.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Housing profile completeness"
      >
        <div className="h-2 rounded-full bg-signal transition-[width] duration-500 ease-out" style={{ width: `${completion.score}%` }} />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {completionParts.map((part) => {
          const done = completion.checks[part.key];
          return (
            <div key={part.key} className="flex items-center gap-2 text-sm text-ink">
              {done ? <CheckCircle2 className="h-4 w-4 text-leaf" aria-hidden="true" /> : <Circle className="h-4 w-4 text-slate" aria-hidden="true" />}
              <span>{part.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function TrustBadges({ verifiedReviews = 0, verifiedIssues = 0, claims = 0, approvedClaim = false }) {
  const badges = getTrustBadges({ verifiedReviews, verifiedIssues, claims, approvedClaim });
  if (!badges.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span key={badge} className="inline-flex items-center gap-1 rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink">
          <ShieldCheck className="h-3.5 w-3.5 text-signal" aria-hidden="true" />
          {badge}
        </span>
      ))}
    </div>
  );
}

export function ContributorReputation({
  reviews,
  issues,
  claims,
  events,
  referrals,
  verifiedReviews = 0,
  verifiedIssues = 0
}: {
  reviews: number;
  issues: number;
  claims: number;
  events: number;
  referrals: number;
  verifiedReviews?: number;
  verifiedIssues?: number;
}) {
  const reputation = getReputationScore({ reviews, issues, claims, verifiedReviews, verifiedIssues }) + referrals * 5;
  return (
    <section className="panel">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-signal" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-ink">Housing Reputation</h2>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Metric label="Housing Contributions" value={events + reviews + issues + claims} />
        <Metric label="Verified Reviews" value={verifiedReviews} />
        <Metric label="Verified Issues" value={verifiedIssues} />
        <Metric label="Reputation Points" value={reputation} />
      </div>
      <p className="mt-4 text-sm text-slate">Reputation rewards useful, trustworthy housing contributions. No financial incentives, no noisy gamification.</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate/15 bg-mist p-3">
      <div className="font-mono text-xl font-bold tabular-nums text-ink">{value}</div>
      <div className="text-sm text-slate">{label}</div>
    </div>
  );
}

export function ContributionPrompt({ propertyId, source = "post_action" }: { propertyId?: string; source?: string }) {
  return (
    <section className="panel">
      <h2 className="text-2xl font-bold text-ink">Help future renters.</h2>
      <p className="mt-2 text-sm text-slate">One more signal can make this property profile dramatically more useful.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {propertyId ? <Link className="button-secondary" href={`/property/${propertyId}/review`}>Leave another review</Link> : <Link className="button-secondary" href="/search">Leave a review</Link>}
        {propertyId ? <Link className="button-secondary" href={`/property/${propertyId}/issue`}>Report another issue</Link> : <Link className="button-secondary" href="/search">Report an issue</Link>}
      </div>
      <form action={createReferralAction} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input type="hidden" name="property_id" value={propertyId ?? ""} />
        <label className="grid gap-2">
          <span className="label">Invite someone</span>
          <select name="invite_type" className="field" required>
            <option>Previous tenant</option>
            <option>Neighbour</option>
            <option>Landlord</option>
            <option>Property manager</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="label">Email, optional</span>
          <input className="field" type="email" name="recipient_email" placeholder="name@example.com" />
        </label>
        <button className="button-primary self-end" type="submit">Generate invite</button>
      </form>
      <form action={submitFeedbackAction} className="mt-5 grid gap-3">
        <input type="hidden" name="property_id" value={propertyId ?? ""} />
        <input type="hidden" name="source" value={source} />
        <label className="grid gap-2">
          <span className="label">If DomusGraph could solve one housing problem for you tomorrow, what would it be?</span>
          <textarea className="field min-h-24" name="answer" required />
        </label>
        <button className="button-secondary w-fit" type="submit">Send feedback</button>
      </form>
    </section>
  );
}
