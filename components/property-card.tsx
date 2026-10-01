import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import type { PropertySummary } from "@/lib/data";

export function PropertyCard({ property }: { property: PropertySummary }) {
  const hasReviews = Boolean(property.average_rating);
  const observationCount = property.observation_count ?? 0;
  const timelineCount = property.timeline_count ?? 0;
  const historySince = new Date(property.created_at).getFullYear();
  const isJustBeginning = observationCount + timelineCount + property.review_count + property.issue_count <= 1;

  return (
    <Link
      href={`/property/${property.id}`}
      className="group flex h-full flex-col rounded-lg border border-slate/15 bg-surface p-5 shadow-soft transition-[border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-0.5 hover:border-signal/40 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">{property.address_line_1}</h2>
          <p className="mt-1 text-sm text-slate">
            {[property.address_line_2, property.city, property.postcode].filter(Boolean).join(", ")}
          </p>
        </div>
        {hasReviews ? (
          <div className="shrink-0 rounded-md bg-mist px-3 py-1 font-mono text-sm font-semibold tabular-nums text-ink">{property.average_rating!.toFixed(1)}</div>
        ) : property.epc_rating ? (
          <div className="flex shrink-0 items-center gap-1 rounded-md bg-mist px-3 py-1 text-sm font-semibold text-ink">
            <Zap className="h-3.5 w-3.5 text-signal" aria-hidden="true" />
            {property.epc_rating}
          </div>
        ) : (
          <div className="shrink-0 rounded-md bg-mist px-3 py-1 text-sm font-semibold text-slate">New profile</div>
        )}
      </div>

      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate/70">History since {historySince}</p>

      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="font-mono font-semibold tabular-nums text-ink">{observationCount}</div>
          <div className="text-slate">Public records</div>
        </div>
        <div>
          <div className="font-mono font-semibold tabular-nums text-ink">{property.review_count}</div>
          <div className="text-slate">Reviews</div>
        </div>
        <div>
          <div className="font-mono font-semibold tabular-nums text-ink">{property.issue_count}</div>
          <div className="text-slate">Issues</div>
        </div>
      </div>

      {isJustBeginning ? (
        <p className="mt-3 text-xs leading-5 text-slate/80">History just beginning. Be the first to add to it.</p>
      ) : null}

      <div className="mt-4 flex flex-1 items-end">
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-signal transition-transform duration-150 ease-out group-hover:translate-x-0.5">
          Explore history
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
