import { PageShell, SectionHeader, SelectField, TextAreaField, TextField } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { DraftAwareForm } from "@/components/draft-aware-form";
import { submitIssueAction } from "@/lib/actions";
import { getCurrentUser, getProperty } from "@/lib/data";
import { logAnalyticsEvent } from "@/lib/events";

export default async function IssuePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const draft = await searchParams;
  const field = (name: string) => {
    const value = draft[name];
    return typeof value === "string" ? value : undefined;
  };
  const user = await getCurrentUser();
  const isSignedIn = Boolean(user);

  await logAnalyticsEvent("issue_started", { property_id: id });
  const property = await getProperty(id);
  const action = submitIssueAction.bind(null, id);

  return (
    <PageShell>
      <SectionHeader eyebrow="Maintenance event" title="Report a maintenance issue" body={property ? `Add a structured maintenance event for ${property.address_line_1}.` : "Add a structured maintenance event."} />
      {!isSignedIn ? (
        <div className="panel mb-5 border-signal/20 bg-signal/5 text-sm text-ink">
          Fill this in, then sign in to submit. We&apos;ll bring you right back here with your answers, no password needed.
        </div>
      ) : null}
      <DraftAwareForm action={action} isSignedIn={isSignedIn} className="panel grid gap-5 md:grid-cols-2">
        <SelectField label="Issue type" name="issue_type" options={["Damp", "Mould", "Heating", "Plumbing", "Electrical", "Pest", "Noise", "Safety", "Other"]} defaultValue={field("issue_type")} />
        <SelectField label="Severity" name="severity" options={["Low", "Medium", "High", "Urgent"]} defaultValue={field("severity")} />
        <div className="md:col-span-2">
          <TextAreaField label="Description" name="description" minLength={10} hint="At least 10 characters." defaultValue={field("description")} />
        </div>
        <TextField label="Date discovered" name="date_discovered" type="date" required={false} defaultValue={field("date_discovered")} />
        <SelectField label="Was landlord/property manager notified?" name="landlord_notified" options={["Yes", "No"]} defaultValue={field("landlord_notified")} />
        <SelectField
          label="Response time"
          name="response_time"
          options={["Same day", "1-3 days", "4-7 days", "More than 1 week", "No response yet"]}
          defaultValue={field("response_time")}
        />
        <SelectField label="Status" name="status" options={["Unresolved", "In progress", "Resolved"]} defaultValue={field("status")} />
        <TextField label="Resolution date" name="resolution_date" type="date" required={false} defaultValue={field("resolution_date")} />
        <SelectField label="Was the issue actually fixed?" name="actually_fixed" options={["Yes", "Partially", "No", "Not applicable yet"]} defaultValue={field("actually_fixed")} />
        <div className="md:col-span-2">
          <SubmitButton pendingText="Submitting report…">{isSignedIn ? "Submit issue report" : "Sign in and submit"}</SubmitButton>
        </div>
      </DraftAwareForm>
    </PageShell>
  );
}
