import { PageShell, SectionHeader, SelectField, TextAreaField, TextField } from "@/components/ui";
import { submitReviewAction } from "@/lib/actions";
import { getProperty } from "@/lib/data";

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
          <TextAreaField label="What should the next tenant know?" name="review_text" />
        </div>
        <fieldset className="md:col-span-2">
          <legend className="label mb-3">Did you experience any of these?</legend>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {issueFlags.map(([name, label]) => (
              <label key={name} className="flex items-center gap-2 rounded border border-moss/15 bg-mist px-3 py-2 text-sm">
                <input type="checkbox" name={name} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <SelectField label="Would you have rented this property if you had known these issues beforehand?" name="would_rent_again" options={["Yes", "No", "Not sure"]} />
        <TextField label="Move-in month/year" name="move_in_month" required={false} placeholder="MM/YYYY" />
        <TextField label="Move-out month/year" name="move_out_month" required={false} placeholder="MM/YYYY" />
        <div className="md:col-span-2">
          <button className="button-primary" type="submit">Submit review</button>
        </div>
      </form>
    </PageShell>
  );
}
