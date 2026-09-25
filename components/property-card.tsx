import Link from "next/link";
import { Zap } from "lucide-react";
import type { PropertySummary } from "@/lib/data";

export function PropertyCard({ property }: { property: PropertySummary }) {
  const hasReviews = Boolean(property.average_rating);
  const observationCount = property.observation_count ?? 0;

  return (
    <Link
      href={`/property/${property.id}`}
      className="block rounded-lg border border-slate/15 bg-surface p-5 shadow-soft transition-[border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-0.5 hover:border-signal/40 hover:shadow-lg"
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
          <div className="shrink-0 rounded-md bg-mist px-3 py-1 text-sm font-semibold text-slate">New</div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
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
    </Link>
  );
}
