import Link from "next/link";
import { EmptyState, PageShell, SectionHeader, Stat } from "@/components/ui";
import { getAdminData } from "@/lib/data";

const exports = [
  ["Properties", "properties"],
  ["Reviews", "reviews"],
  ["Issues", "maintenance_issues"],
  ["Claims", "property_claims"],
  ["Property manager intake responses", "property_manager_intake"]
] as const;

export default async function AdminPage() {
  const data = await getAdminData();

  if (!data.allowed) {
    return (
      <PageShell>
        <EmptyState title="Admin access required" body="This dashboard is protected by the ADMIN_EMAILS allowlist and an authenticated Supabase session." />
      </PageShell>
    );
  }
  const adminData = data as {
    allowed: true;
    counts: { properties: number; reviews: number; issues: number; claims: number; intakes: number };
    recentReviews: Record<string, string | number | null>[];
    recentIssues: Record<string, string | number | null>[];
    pendingClaims: Record<string, string | number | null>[];
  };

  return (
    <PageShell>
      <SectionHeader eyebrow="Admin" title="DomusGraph research dashboard" body="Monitor traction, review pending submissions, and export structured MVP data." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Total properties" value={adminData.counts.properties} />
        <Stat label="Total reviews" value={adminData.counts.reviews} />
        <Stat label="Maintenance issues" value={adminData.counts.issues} />
        <Stat label="Landlord claims" value={adminData.counts.claims} />
        <Stat label="Manager submissions" value={adminData.counts.intakes} />
      </div>

      <section className="mt-8 panel">
        <h2 className="text-xl font-semibold text-ink">Exports</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {exports.map(([label, table]) => (
            <Link key={table} href={`/admin/export?table=${table}`} className="button-secondary">{label} CSV</Link>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <AdminList title="Recent reviews" rows={adminData.recentReviews.map((item) => `${item.overall_rating}/5 · ${item.moderation_status} · ${new Date(String(item.created_at ?? "")).toLocaleDateString("en-GB")}`)} />
        <AdminList title="Recent issues" rows={adminData.recentIssues.map((item) => `${item.issue_type} · ${item.severity} · ${item.moderation_status}`)} />
        <AdminList title="Pending claims" rows={adminData.pendingClaims.map((item) => `${item.name} · ${item.role} · ${item.portfolio_size}`)} />
      </div>
    </PageShell>
  );
}

function AdminList({ title, rows }: { title: string; rows: string[] }) {
  return (
    <section className="panel">
      <h2 className="font-semibold text-ink">{title}</h2>
      <div className="mt-4 grid gap-2">
        {rows.length ? rows.map((row, index) => <div key={`${row}-${index}`} className="rounded bg-mist px-3 py-2 text-sm text-ink">{row}</div>) : <p className="text-sm text-moss">No records yet.</p>}
      </div>
    </section>
  );
}
