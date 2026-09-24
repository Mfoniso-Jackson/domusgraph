import { EmptyState, PageShell, SectionHeader, SelectField, TextAreaField, TextField } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { submitIssueAction } from "@/lib/actions";
import { getCurrentUser, getProperty } from "@/lib/data";
import { logAnalyticsEvent } from "@/lib/events";

export default async function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return (
      <PageShell>
        <SectionHeader eyebrow="Maintenance event" title="Report a maintenance issue" />
        <EmptyState
          title="Sign in to report an issue"
          body="Maintenance reports are tied to your account so we can moderate content and follow up if there's a dispute. It only takes a magic link, no password."
          href={`/auth/sign-in?next=${encodeURIComponent(`/property/${id}/issue`)}`}
          action="Sign in"
        />
      </PageShell>
    );
  }
  await logAnalyticsEvent("issue_started", { property_id: id });
  const property = await getProperty(id);
  const action = submitIssueAction.bind(null, id);

  return (
    <PageShell>
      <SectionHeader eyebrow="Maintenance event" title="Report a maintenance issue" body={property ? `Add a structured maintenance event for ${property.address_line_1}.` : "Add a structured maintenance event."} />
      <form action={action} className="panel grid gap-5 md:grid-cols-2">
        <SelectField label="Issue type" name="issue_type" options={["Damp", "Mould", "Heating", "Plumbing", "Electrical", "Pest", "Noise", "Safety", "Other"]} />
        <SelectField label="Severity" name="severity" options={["Low", "Medium", "High", "Urgent"]} />
        <div className="md:col-span-2">
          <TextAreaField label="Description" name="description" minLength={10} hint="At least 10 characters." />
        </div>
        <TextField label="Date discovered" name="date_discovered" type="date" required={false} />
        <SelectField label="Was landlord/property manager notified?" name="landlord_notified" options={["Yes", "No"]} />
        <SelectField label="Response time" name="response_time" options={["Same day", "1-3 days", "4-7 days", "More than 1 week", "No response yet"]} />
        <SelectField label="Status" name="status" options={["Unresolved", "In progress", "Resolved"]} />
        <TextField label="Resolution date" name="resolution_date" type="date" required={false} />
        <SelectField label="Was the issue actually fixed?" name="actually_fixed" options={["Yes", "Partially", "No", "Not applicable yet"]} />
        <div className="md:col-span-2">
          <SubmitButton pendingText="Submitting report…">Submit issue report</SubmitButton>
        </div>
      </form>
    </PageShell>
  );
}
