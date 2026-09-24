import { EmptyState, PageShell, SectionHeader, SelectField, TextAreaField, TextField } from "@/components/ui";
import { submitClaimAction } from "@/lib/actions";
import { getCurrentUser, getProperty } from "@/lib/data";
import { logAnalyticsEvent } from "@/lib/events";

export default async function ClaimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return (
      <PageShell>
        <SectionHeader eyebrow="Landlord claim" title="Claim this property profile" />
        <EmptyState
          title="Sign in to claim this property"
          body="Ownership claims are tied to your account so we can verify and follow up. It only takes a magic link, no password."
          href={`/auth/sign-in?next=${encodeURIComponent(`/property/${id}/claim`)}`}
          action="Sign in"
        />
      </PageShell>
    );
  }
  await logAnalyticsEvent("claim_started", { property_id: id });
  const property = await getProperty(id);
  const action = submitClaimAction.bind(null, id);

  return (
    <PageShell>
      <SectionHeader eyebrow="Landlord claim" title="Claim this property profile" body={property ? `Submit a pending claim for ${property.address_line_1}.` : "Submit a pending claim for this property."} />
      <form action={action} className="panel grid gap-5 md:grid-cols-2">
        <TextField label="Name" name="name" />
        <TextField label="Email" name="email" type="email" />
        <SelectField label="Role" name="role" options={["Landlord", "Letting agent", "Property manager", "Other"]} />
        <SelectField label="Portfolio size" name="portfolio_size" options={["1 property", "2-5", "6-20", "20+"]} />
        <SelectField label="What takes the most time?" name="biggest_time_sink" options={["Maintenance", "Tenant communication", "Compliance", "Finding tenants", "Rent collection"]} />
        <SelectField label="How are maintenance requests handled today?" name="maintenance_workflow" options={["Email", "WhatsApp", "Phone calls", "Property software", "Other"]} />
        <div className="md:col-span-2">
          <TextAreaField label="What would save you the most time?" name="time_saving_answer" />
        </div>
        <div className="md:col-span-2">
          <button className="button-primary" type="submit">Submit claim</button>
        </div>
      </form>
    </PageShell>
  );
}
