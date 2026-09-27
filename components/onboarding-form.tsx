"use client";

import { useState } from "react";
import Link from "next/link";
import { SelectField, TextField } from "@/components/ui";
import { submitOnboardingAction } from "@/lib/actions";

export function OnboardingForm() {
  const [userType, setUserType] = useState("");

  return (
    <form action={submitOnboardingAction} className="panel grid gap-6">
      <label className="grid gap-2">
        <span className="label">Who are you?</span>
        <select name="user_type" required className="field" value={userType} onChange={(event) => setUserType(event.target.value)}>
          <option value="">Select</option>
          <option>Renter</option>
          <option>Landlord</option>
          <option>Letting Agent</option>
          <option>Property Manager</option>
        </select>
      </label>

      {userType === "Renter" ? (
        <section className="rounded border border-slate/15 bg-mist p-4">
          <h2 className="font-semibold text-ink">Renter</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <SelectField
              label="Biggest rental frustration"
              name="biggest_rental_frustration"
              required={false}
              options={["Maintenance delays", "Poor communication", "Deposit disputes", "Hidden issues", "Rent increases", "Safety concerns"]}
            />
            <SelectField
              label="Worst housing issue experienced"
              name="worst_housing_issue"
              required={false}
              options={["Damp", "Mould", "Heating", "Plumbing", "Electrical", "Pests", "Noise", "Safety"]}
            />
            <SelectField
              label="Would you recommend your previous property?"
              name="would_recommend_previous_property"
              required={false}
              options={["Yes", "No", "Not sure"]}
            />
          </div>
        </section>
      ) : null}

      {userType === "Landlord" || userType === "Letting Agent" ? (
        <section className="rounded border border-slate/15 bg-mist p-4">
          <h2 className="font-semibold text-ink">Landlord or Letting Agent</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <SelectField label="Number of properties" name="number_of_properties" required={false} options={["1 property", "2-5", "6-20", "20+"]} />
            <SelectField
              label="Biggest operational challenge"
              name="landlord_operational_challenge"
              required={false}
              options={["Maintenance", "Tenant communication", "Compliance", "Finding tenants", "Rent collection"]}
            />
            <SelectField
              label="Current maintenance workflow"
              name="landlord_maintenance_workflow"
              required={false}
              options={["Email", "WhatsApp", "Phone calls", "Property software", "Other"]}
            />
          </div>
        </section>
      ) : null}

      {userType === "Property Manager" ? (
        <section className="rounded border border-slate/15 bg-mist p-4">
          <h2 className="font-semibold text-ink">Property Manager</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <SelectField label="Units managed" name="units_managed" required={false} options={["Under 50", "50-250", "250-1,000", "1,000+"]} />
            <TextField label="Average maintenance tickets" name="average_maintenance_tickets" required={false} />
            <SelectField
              label="Current software"
              name="current_software"
              required={false}
              options={["Spreadsheet", "Email inbox", "WhatsApp", "Property software", "Custom system", "None"]}
            />
            <SelectField
              label="Biggest pain point"
              name="manager_biggest_pain_point"
              required={false}
              options={["Maintenance", "Compliance", "Communication", "Reporting", "Contractor coordination"]}
            />
          </div>
        </section>
      ) : null}

      <TextField label="Email" name="email" type="email" required={false} hint="Optional. So we can follow up on what you told us. Never shared or sold." />

      <p className="text-xs text-slate">
        By submitting, you agree to DomusGraph&apos;s{" "}
        <Link href="/terms" className="text-signal underline">Terms of Service</Link> and{" "}
        <Link href="/privacy" className="text-signal underline">Privacy Policy</Link>.
      </p>

      <button className="button-primary w-fit" type="submit" disabled={!userType}>Finish onboarding</button>
    </form>
  );
}
