import { EmptyState, PageShell, SectionHeader, SelectField, TextAreaField, TextField } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { submitReviewAction } from "@/lib/actions";
import { getCurrentUser, getProperty } from "@/lib/data";
import { logAnalyticsEvent } from "@/lib/events";

const ratingOptions = ["1", "2", "3", "4", "5"];
const issueFlags = [
  ["experienced_damp", "Damp"],
  ["experienced_mould", "Mould"],
  ["experienced_heating", "Heating issues"],
  ["experienced_plumbing", "Plumbing issues"],
  ["experienced_noise", "Noise problems"],
  ["experienced_pests", "Pest issues"],
  ["experienced_electrical", "Electrical issues"]
] as const;

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return (
      <PageShell>
        <SectionHeader eyebrow="Tenant review" title="Leave a property review" />
        <EmptyState
          title="Sign in to leave a review"
          body="Reviews are tied to your account so we can moderate content and follow up if there's a dispute. It only takes a magic link, no password."
          href={`/auth/sign-in?next=${encodeURIComponent(`/property/${id}/review`)}`}
          action="Sign in"
        />
      </PageShell>
    );
  }
  await logAnalyticsEvent("review_started", { property_id: id });
  const property = await getProperty(id);
  const action = submitReviewAction.bind(null, id);

  return (
    <PageShell>
      <SectionHeader eyebrow="Tenant review" title="Leave a property review" body={property ? `Share structured feedback for ${property.address_line_1}.` : "Share structured feedback for this property."} />
      <form action={action} className="panel grid gap-5 md:grid-cols-2">
        <SelectField label="Overall rating" name="overall_rating" options={ratingOptions} />
        <SelectField label="Maintenance rating" name="maintenance_rating" options={ratingOptions} />
        <SelectField label="Communication rating" name="communication_rating" options={ratingOptions} />
        <SelectField label="Property condition rating" name="condition_rating" options={ratingOptions} />
        <SelectField label="Deposit fairness rating" name="deposit_fairness_rating" options={ratingOptions} />
        <SelectField label="Safety rating" name="safety_rating" options={ratingOptions} />
        <div className="md:col-span-2">
          <TextAreaField
            label="What should the next tenant know?"
            name="review_text"
            minLength={20}
            hint="At least 20 characters — specifics help future renters most."
          />
        </div>
        <fieldset className="md:col-span-2">
          <legend className="label mb-3">Did you experience any of these?</legend>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {issueFlags.map(([name, label]) => (
              <label key={name} className="flex min-h-10 items-center gap-2 rounded-md border border-slate/15 bg-mist px-3 py-2.5 text-sm transition-colors duration-150 ease-out has-[:checked]:border-signal has-[:checked]:bg-signal/5">
                <input type="checkbox" name={name} className="h-4 w-4 accent-signal" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <SelectField label="Would you have rented this property if you had known these issues beforehand?" name="would_rent_again" options={["Yes", "No", "Not sure"]} />
        <TextField label="Move-in month/year" name="move_in_month" required={false} placeholder="MM/YYYY" pattern="\d{2}/\d{4}" autoComplete="off" />
        <TextField label="Move-out month/year" name="move_out_month" required={false} placeholder="MM/YYYY" pattern="\d{2}/\d{4}" autoComplete="off" />
        <div className="md:col-span-2">
          <SubmitButton pendingText="Submitting review…">Submit review</SubmitButton>
        </div>
      </form>
    </PageShell>
  );
}
