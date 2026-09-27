import { PageShell, SectionHeader, SelectField, TextAreaField, TextField } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { DraftAwareForm } from "@/components/draft-aware-form";
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

export default async function ReviewPage({
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

  await logAnalyticsEvent("review_started", { property_id: id });
  const property = await getProperty(id);
  const action = submitReviewAction.bind(null, id);

  return (
    <PageShell>
      <SectionHeader eyebrow="Tenant review" title="Leave a property review" body={property ? `Share structured feedback for ${property.address_line_1}.` : "Share structured feedback for this property."} />
      {!isSignedIn ? (
        <div className="panel mb-5 border-signal/20 bg-signal/5 text-sm text-ink">
          Fill this in, then sign in to submit. We&apos;ll bring you right back here with your answers, no password needed.
        </div>
      ) : null}
      <DraftAwareForm action={action} isSignedIn={isSignedIn} className="panel grid gap-5 md:grid-cols-2">
        <SelectField label="Overall rating" name="overall_rating" options={ratingOptions} defaultValue={field("overall_rating")} />
        <SelectField label="Maintenance rating" name="maintenance_rating" options={ratingOptions} required={false} defaultValue={field("maintenance_rating")} />
        <SelectField label="Communication rating" name="communication_rating" options={ratingOptions} required={false} defaultValue={field("communication_rating")} />
        <SelectField label="Property condition rating" name="condition_rating" options={ratingOptions} required={false} defaultValue={field("condition_rating")} />
        <SelectField label="Deposit fairness rating" name="deposit_fairness_rating" options={ratingOptions} required={false} defaultValue={field("deposit_fairness_rating")} />
        <SelectField label="Safety rating" name="safety_rating" options={ratingOptions} required={false} defaultValue={field("safety_rating")} />
        <div className="md:col-span-2">
          <TextAreaField
            label="What should the next tenant know?"
            name="review_text"
            minLength={20}
            hint="At least 20 characters. Specifics help future renters most."
            defaultValue={field("review_text")}
          />
        </div>
        <fieldset className="md:col-span-2">
          <legend className="label mb-3">Did you experience any of these?</legend>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {issueFlags.map(([name, label]) => (
              <label key={name} className="flex min-h-10 items-center gap-2 rounded-md border border-slate/15 bg-mist px-3 py-2.5 text-sm transition-colors duration-150 ease-out has-[:checked]:border-signal has-[:checked]:bg-signal/5">
                <input type="checkbox" name={name} className="h-4 w-4 accent-signal" defaultChecked={Boolean(field(name))} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <SelectField
          label="Would you have rented this property if you had known these issues beforehand?"
          name="would_rent_again"
          options={["Yes", "No", "Not sure"]}
          required={false}
          defaultValue={field("would_rent_again")}
        />
        <TextField label="Move-in month/year" name="move_in_month" required={false} placeholder="MM/YYYY" pattern="\d{2}/\d{4}" autoComplete="off" defaultValue={field("move_in_month")} />
        <TextField label="Move-out month/year" name="move_out_month" required={false} placeholder="MM/YYYY" pattern="\d{2}/\d{4}" autoComplete="off" defaultValue={field("move_out_month")} />
        <div className="md:col-span-2">
          <SubmitButton pendingText="Submitting review…">{isSignedIn ? "Submit review" : "Sign in and submit"}</SubmitButton>
        </div>
      </DraftAwareForm>
    </PageShell>
  );
}
