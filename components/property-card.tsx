import Link from "next/link";
import type { PropertySummary } from "@/lib/data";

export function PropertyCard({ property }: { property: PropertySummary }) {
  return (
    <Link href={`/property/${property.id}`} className="block rounded border border-moss/15 bg-white p-5 shadow-soft transition hover:border-clay">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">{property.address_line_1}</h2>
          <p className="mt-1 text-sm text-moss">
            {[property.address_line_2, property.city, property.postcode].filter(Boolean).join(", ")}
          </p>
        </div>
        <div className="rounded bg-mist px-3 py-1 text-sm font-semibold text-ink">
          {property.average_rating ? property.average_rating.toFixed(1) : "New"}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="font-semibold text-ink">{property.review_count}</div>
          <div className="text-moss">Reviews</div>
        </div>
        <div>
          <div className="font-semibold text-ink">{property.issue_count}</div>
          <div className="text-moss">Issues</div>
        </div>
        <div>
          <div className="font-semibold text-ink">{property.last_activity ? new Date(property.last_activity).toLocaleDateString("en-GB") : "No activity"}</div>
          <div className="text-moss">Last activity</div>
        </div>
      </div>
    </Link>
  );
}
