import { describe, expect, it } from "vitest";
import { findMatchingEpcRecord, epcCertificateUrl, type EpcRecord } from "./epc";

function record(overrides: Partial<EpcRecord>): EpcRecord {
  return {
    certificateNumber: "0000-0000-0000-0000-0000",
    addressLine1: "Flat 1",
    addressLine2: "231 Baker St",
    postcode: "NW1 6XE",
    currentEnergyEfficiencyBand: "D",
    registrationDate: "2025-08-28",
    uprn: null,
    ...overrides
  };
}

describe("findMatchingEpcRecord", () => {
  it("matches when the address tokens are identical regardless of line splitting", () => {
    const records = [record({ certificateNumber: "match", addressLine1: "Flat 1", addressLine2: "231 Baker St" })];
    const match = findMatchingEpcRecord(records, "Flat 1, 231 Baker St");
    expect(match?.certificateNumber).toBe("match");
  });

  it("matches ignoring case and punctuation", () => {
    const records = [record({ certificateNumber: "match", addressLine1: "flat 1", addressLine2: "231 baker st" })];
    const match = findMatchingEpcRecord(records, "FLAT 1", "231, Baker St.");
    expect(match?.certificateNumber).toBe("match");
  });

  it("returns null when no record matches", () => {
    const records = [record({ addressLine1: "Flat 2", addressLine2: "235 Baker Street" })];
    expect(findMatchingEpcRecord(records, "Flat 1", "231 Baker St")).toBeNull();
  });

  it("picks the most recent certificate when a property has been re-assessed over time", () => {
    const records = [
      record({ certificateNumber: "old", registrationDate: "2009-01-01" }),
      record({ certificateNumber: "new", registrationDate: "2025-08-25" }),
      record({ certificateNumber: "middle", registrationDate: "2015-06-01" })
    ];
    const match = findMatchingEpcRecord(records, "Flat 1", "231 Baker St");
    expect(match?.certificateNumber).toBe("new");
  });
});

describe("epcCertificateUrl", () => {
  it("builds the public certificate viewer URL", () => {
    expect(epcCertificateUrl("1735-3228-9100-0476-0226")).toBe("https://find-energy-certificate.service.gov.uk/energy-certificate/1735-3228-9100-0476-0226");
  });
});
