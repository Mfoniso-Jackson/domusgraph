import Link from "next/link";
import type { PropertySummary } from "@/lib/data";

export function PropertyCard({ property }: { property: PropertySummary }) {
  return (
    <Link
      href={`/property/${property.id}`}
      className="block rounded-lg border border-slate/15 bg-white p-5 shadow-soft transition-[border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-0.5 hover:border-signal/40 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">{property.address_line_1}</h2>
          <p className="mt-1 text-sm text-slate">
            {[property.address_line_2, property.city, property.postcode].filter(Boolean).join(", ")}
          </p>
        </div>
        <div className="rounded-md bg-mist px-3 py-1 font-mono text-sm font-semibold tabular-nums text-ink">
          {property.average_rating ? property.average_rating.toFixed(1) : "New"}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="font-mono font-semibold tabular-nums text-ink">{property.review_count}</div>
          <div className="text-slate">Reviews</div>
        </div>
        <div>
          <div className="font-mono font-semibold tabular-nums text-ink">{property.issue_count}</div>
          <div className="text-slate">Issues</div>
        </div>
        <div>
          <div className="font-semibold text-ink">{property.last_activity ? new Date(property.last_activity).toLocaleDateString("en-GB") : "No activity"}</div>
          <div className="text-slate">Last activity</div>
        </div>
      </div>
    </Link>
  );
}
