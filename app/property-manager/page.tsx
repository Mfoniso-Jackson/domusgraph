import { PageShell, SectionHeader, SelectField, TextAreaField, TextField } from "@/components/ui";
import { submitManagerIntakeAction } from "@/lib/actions";

export default async function PropertyManagerPage({ searchParams }: { searchParams: Promise<{ submitted?: string }> }) {
  const { submitted } = await searchParams;

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Property manager intake"
        title="Tell us how your portfolio runs today"
        body="DomusGraph is validating maintenance intelligence and operational reporting for professional property teams."
      />
      {submitted ? (
        <div className="mb-6 rounded border border-leaf/20 bg-mist p-4 text-sm font-medium text-ink">Thanks. Your response has been recorded.</div>
      ) : null}
      <form action={submitManagerIntakeAction} className="panel grid gap-5 md:grid-cols-2">
        <TextField label="Company name" name="company_name" />
        <TextField label="Contact name" name="contact_name" />
        <TextField label="Email" name="email" type="email" />
        <SelectField label="Units managed" name="units_managed" options={["Under 50", "50-250", "250-1,000", "1,000+"]} />
        <TextField label="Average maintenance tickets per month" name="maintenance_tickets_per_month" />
        <SelectField label="Biggest operational challenge" name="biggest_operational_challenge" options={["Maintenance", "Compliance", "Communication", "Reporting", "Contractor coordination"]} />
        <SelectField label="Would predictive maintenance be useful?" name="predictive_maintenance_interest" options={["Very useful", "Somewhat useful", "Not useful"]} />
        <div className="md:col-span-2">
          <TextAreaField label="If DomusGraph could solve one problem for you tomorrow, what would it be?" name="one_problem_answer" />
        </div>
        <div className="md:col-span-2">
          <button className="button-primary" type="submit">Submit response</button>
        </div>
      </form>
    </PageShell>
  );
}
