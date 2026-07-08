import { PageShell, SectionHeader, SelectField, TextAreaField, TextField } from "@/components/ui";
import { submitIssueAction } from "@/lib/actions";
import { getProperty } from "@/lib/data";

export default async function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getProperty(id);
  const action = submitIssueAction.bind(null, id);

  return (
    <PageShell>
      <SectionHeader eyebrow="Maintenance event" title="Report a maintenance issue" body={property ? `Add a structured maintenance event for ${property.address_line_1}.` : "Add a structured maintenance event."} />
      <form action={action} className="panel grid gap-5 md:grid-cols-2">
        <SelectField label="Issue type" name="issue_type" options={["Damp", "Mould", "Heating", "Plumbing", "Electrical", "Pest", "Noise", "Safety", "Other"]} />
        <SelectField label="Severity" name="severity" options={["Low", "Medium", "High", "Urgent"]} />
        <div className="md:col-span-2">
          <TextAreaField label="Description" name="description" />
        </div>
        <TextField label="Date discovered" name="date_discovered" type="date" required={false} />
        <SelectField label="Was landlord/property manager notified?" name="landlord_notified" options={["Yes", "No"]} />
        <SelectField label="Response time" name="response_time" options={["Same day", "1-3 days", "4-7 days", "More than 1 week", "No response yet"]} />
        <SelectField label="Status" name="status" options={["Unresolved", "In progress", "Resolved"]} />
        <TextField label="Resolution date" name="resolution_date" type="date" required={false} />
        <SelectField label="Was the issue actually fixed?" name="actually_fixed" options={["Yes", "Partially", "No", "Not applicable yet"]} />
        <div className="md:col-span-2">
          <button className="button-primary" type="submit">Submit issue report</button>
        </div>
      </form>
    </PageShell>
  );
}
