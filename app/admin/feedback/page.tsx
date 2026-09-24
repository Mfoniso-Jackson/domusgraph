import { EmptyState, PageShell, SectionHeader } from "@/components/ui";
import { getFeedbackAdminData } from "@/lib/data";

export default async function AdminFeedbackPage() {
  const data = await getFeedbackAdminData();
  if (!data.allowed) {
    return (
      <PageShell>
        <EmptyState title="Admin access required" body="Feedback browsing is protected by the ADMIN_EMAILS allowlist and Supabase Auth." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionHeader eyebrow="Feedback engine" title="Housing problems users want solved" body="Browse post-action answers and customer discovery signals." />
      <div className="grid gap-4">
        {data.responses.length ? data.responses.map((response) => (
          <article key={response.id} className="panel">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate">
              <span>{response.source}</span>
              <span>{new Date(response.created_at).toLocaleDateString("en-GB")}</span>
            </div>
            <p className="mt-3 text-ink">{response.answer}</p>
          </article>
        )) : <EmptyState title="No feedback yet" body="Feedback will appear here after users answer the post-action housing problem prompt." />}
      </div>
    </PageShell>
  );
}
