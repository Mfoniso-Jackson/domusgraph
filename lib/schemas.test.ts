import { describe, expect, it } from "vitest";
import {
  claimSchema,
  formObject,
  issueSchema,
  magicLinkSchema,
  onboardingSchema,
  propertySchema,
  reviewSchema
} from "./schemas";

describe("propertySchema", () => {
  it("accepts a valid property", () => {
    const result = propertySchema.parse({
      address_line_1: "221B Baker Street",
      address_line_2: "",
      city: "London",
      postcode: "NW1 6XE",
      property_type: "Flat"
    });
    expect(result.address_line_1).toBe("221B Baker Street");
  });

  it("treats an empty property_type as absent rather than an invalid enum value", () => {
    const result = propertySchema.parse({
      address_line_1: "221B Baker Street",
      postcode: "NW1 6XE",
      property_type: ""
    });
    expect(result.property_type).toBeNull();
  });

  it("rejects a too-short address", () => {
    expect(() => propertySchema.parse({ address_line_1: "1", postcode: "NW1 6XE" })).toThrow();
  });
});

describe("reviewSchema", () => {
  const validReview = {
    overall_rating: "4",
    maintenance_rating: "4",
    communication_rating: "4",
    condition_rating: "4",
    deposit_fairness_rating: "4",
    safety_rating: "4",
    review_text: "This is a long enough review to pass validation easily.",
    would_rent_again: "Yes"
  };

  it("coerces string ratings from form data into numbers", () => {
    const result = reviewSchema.parse(validReview);
    expect(result.overall_rating).toBe(4);
  });

  it("rejects a rating out of range", () => {
    expect(() => reviewSchema.parse({ ...validReview, overall_rating: "6" })).toThrow();
  });

  it("rejects review text under the minimum length", () => {
    expect(() => reviewSchema.parse({ ...validReview, review_text: "too short" })).toThrow();
  });

  it("defaults issue flags to false when absent", () => {
    const result = reviewSchema.parse(validReview);
    expect(result.experienced_damp).toBe(false);
  });
});

describe("issueSchema", () => {
  const validIssue = {
    issue_type: "Heating",
    severity: "Medium",
    description: "The boiler stopped working.",
    landlord_notified: "Yes",
    response_time: "1-3 days",
    status: "Unresolved",
    actually_fixed: "Not applicable yet"
  };

  it("transforms landlord_notified Yes/No into a boolean", () => {
    expect(issueSchema.parse(validIssue).landlord_notified).toBe(true);
    expect(issueSchema.parse({ ...validIssue, landlord_notified: "No" }).landlord_notified).toBe(false);
  });

  it("rejects an unknown issue_type", () => {
    expect(() => issueSchema.parse({ ...validIssue, issue_type: "Flood" })).toThrow();
  });
});

describe("claimSchema", () => {
  it("rejects an invalid email", () => {
    expect(() =>
      claimSchema.parse({
        name: "Jane Landlord",
        email: "not-an-email",
        role: "Landlord",
        portfolio_size: "1 property",
        biggest_time_sink: "Maintenance",
        maintenance_workflow: "Email",
        time_saving_answer: "Automated reminders"
      })
    ).toThrow();
  });
});

describe("magicLinkSchema", () => {
  it("accepts an email with no next param", () => {
    const result = magicLinkSchema.parse({ email: "user@example.com", next: "" });
    expect(result.email).toBe("user@example.com");
  });

  it("rejects an invalid email", () => {
    expect(() => magicLinkSchema.parse({ email: "nope" })).toThrow();
  });
});

describe("onboardingSchema", () => {
  it("requires renter-specific answers when user_type is Renter", () => {
    expect(() => onboardingSchema.parse({ user_type: "Renter" })).toThrow();
  });

  it("accepts a complete renter submission", () => {
    const result = onboardingSchema.parse({
      user_type: "Renter",
      biggest_rental_frustration: "Slow repairs",
      worst_housing_issue: "Damp in the bathroom",
      would_recommend_previous_property: "No"
    });
    expect(result.user_type).toBe("Renter");
  });

  it("requires landlord-specific answers when user_type is Landlord", () => {
    expect(() => onboardingSchema.parse({ user_type: "Landlord" })).toThrow();
  });

  it("does not require renter answers when user_type is Landlord", () => {
    const result = onboardingSchema.parse({
      user_type: "Landlord",
      number_of_properties: "2-5",
      landlord_operational_challenge: "Maintenance",
      landlord_maintenance_workflow: "Email"
    });
    expect(result.user_type).toBe("Landlord");
  });
});

describe("formObject", () => {
  it("marks checkbox fields as false when the checkbox was not submitted", () => {
    const formData = new FormData();
    formData.set("review_text", "hello");
    const result = formObject(formData);
    expect(result.experienced_damp).toBe(false);
  });

  it("marks checkbox fields as true when the checkbox was submitted", () => {
    const formData = new FormData();
    formData.set("experienced_damp", "on");
    const result = formObject(formData);
    expect(result.experienced_damp).toBe(true);
  });
});
