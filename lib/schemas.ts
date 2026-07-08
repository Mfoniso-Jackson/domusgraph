import { z } from "zod";

export const rating = z.coerce.number().int().min(1).max(5);
export const optionalText = z.string().trim().optional().nullable();
const optionalPropertyType = z.preprocess((value) => (value === "" ? null : value), z.enum(["Flat", "House", "HMO", "Studio", "Maisonette", "Other"]).optional().nullable());
export const actorTypeSchema = z.enum(["Renter", "Landlord", "Letting Agent", "Property Manager"]);

export const propertySchema = z.object({
  address_line_1: z.string().trim().min(3, "Address is required"),
  address_line_2: optionalText,
  city: optionalText,
  postcode: z.string().trim().min(3, "Postcode is required"),
  property_type: optionalPropertyType
});

export const reviewSchema = z.object({
  overall_rating: rating,
  maintenance_rating: rating,
  communication_rating: rating,
  condition_rating: rating,
  deposit_fairness_rating: rating,
  safety_rating: rating,
  review_text: z.string().trim().min(20, "Please share at least 20 characters"),
  experienced_damp: z.coerce.boolean().default(false),
  experienced_mould: z.coerce.boolean().default(false),
  experienced_heating: z.coerce.boolean().default(false),
  experienced_plumbing: z.coerce.boolean().default(false),
  experienced_noise: z.coerce.boolean().default(false),
  experienced_pests: z.coerce.boolean().default(false),
  experienced_electrical: z.coerce.boolean().default(false),
  would_rent_again: z.enum(["Yes", "No", "Not sure"]),
  move_in_month: optionalText,
  move_out_month: optionalText
});

export const issueSchema = z.object({
  issue_type: z.enum(["Damp", "Mould", "Heating", "Plumbing", "Electrical", "Pest", "Noise", "Safety", "Other"]),
  severity: z.enum(["Low", "Medium", "High", "Urgent"]),
  description: z.string().trim().min(10, "Description is required"),
  date_discovered: optionalText,
  landlord_notified: z.enum(["Yes", "No"]).transform((value) => value === "Yes"),
  response_time: z.enum(["Same day", "1-3 days", "4-7 days", "More than 1 week", "No response yet"]),
  status: z.enum(["Unresolved", "In progress", "Resolved"]),
  resolution_date: optionalText,
  actually_fixed: z.enum(["Yes", "Partially", "No", "Not applicable yet"])
});

export const claimSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Use a valid email"),
  role: z.enum(["Landlord", "Letting agent", "Property manager", "Other"]),
  portfolio_size: z.enum(["1 property", "2-5", "6-20", "20+"]),
  biggest_time_sink: z.enum(["Maintenance", "Tenant communication", "Compliance", "Finding tenants", "Rent collection"]),
  maintenance_workflow: z.enum(["Email", "WhatsApp", "Phone calls", "Property software", "Other"]),
  time_saving_answer: z.string().trim().min(5, "Please add a short answer")
});

export const managerIntakeSchema = z.object({
  company_name: z.string().trim().min(2),
  contact_name: z.string().trim().min(2),
  email: z.string().trim().email(),
  units_managed: z.enum(["Under 50", "50-250", "250-1,000", "1,000+"]),
  maintenance_tickets_per_month: z.string().trim().min(1),
  biggest_operational_challenge: z.enum(["Maintenance", "Compliance", "Communication", "Reporting", "Contractor coordination"]),
  predictive_maintenance_interest: z.enum(["Very useful", "Somewhat useful", "Not useful"]),
  one_problem_answer: z.string().trim().min(5)
});

export const onboardingSchema = z
  .object({
    user_type: actorTypeSchema,
    biggest_rental_frustration: optionalText,
    worst_housing_issue: optionalText,
    would_recommend_previous_property: z.enum(["Yes", "No", "Not sure"]).optional().nullable(),
    number_of_properties: optionalText,
    landlord_operational_challenge: optionalText,
    landlord_maintenance_workflow: optionalText,
    units_managed: optionalText,
    average_maintenance_tickets: optionalText,
    current_software: optionalText,
    manager_biggest_pain_point: optionalText
  })
  .superRefine((data, ctx) => {
    if (data.user_type === "Renter" && (!data.biggest_rental_frustration || !data.worst_housing_issue || !data.would_recommend_previous_property)) {
      ctx.addIssue({ code: "custom", message: "Renter onboarding answers are required." });
    }
    if ((data.user_type === "Landlord" || data.user_type === "Letting Agent") && (!data.number_of_properties || !data.landlord_operational_challenge || !data.landlord_maintenance_workflow)) {
      ctx.addIssue({ code: "custom", message: "Landlord onboarding answers are required." });
    }
    if (data.user_type === "Property Manager" && (!data.units_managed || !data.average_maintenance_tickets || !data.current_software || !data.manager_biggest_pain_point)) {
      ctx.addIssue({ code: "custom", message: "Property manager onboarding answers are required." });
    }
  });

export const feedbackSchema = z.object({
  property_id: optionalText,
  source: z.string().trim().min(2),
  answer: z.string().trim().min(5, "Please add a short answer")
});

export const referralSchema = z.object({
  property_id: optionalText,
  invite_type: z.enum(["Previous tenant", "Neighbour", "Landlord", "Property manager"]),
  recipient_email: z.string().trim().email().optional().or(z.literal("")).nullable()
});

export function formObject(formData: FormData) {
  const data: Record<string, FormDataEntryValue | boolean> = {};
  for (const [key, value] of formData.entries()) data[key] = value;
  for (const key of ["experienced_damp", "experienced_mould", "experienced_heating", "experienced_plumbing", "experienced_noise", "experienced_pests", "experienced_electrical"]) {
    data[key] = formData.has(key);
  }
  return data;
}
