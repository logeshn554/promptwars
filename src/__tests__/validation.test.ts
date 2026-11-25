import { describe, expect, it } from "vitest";
import {
  askQuestionSchema,
  lifestyleProfileSchema,
  locationQuerySchema,
} from "@/lib/validation";

describe("validation schemas", () => {
  it("sanitizes angle brackets from city names", () => {
    const res = locationQuerySchema.safeParse({ city: "  <Delhi>  " });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.city).toBe("Delhi");
    }
  });

  it("rejects too-short location", () => {
    const res = lifestyleProfileSchema.safeParse({
      location: "A",
      householdType: "family_kids",
      commuteMode: "car",
      heatingSource: "gas_wood",
      homeType: "apartment",
    });
    expect(res.success).toBe(false);
  });

  it("validates askQuestionSchema bounds", () => {
    const bad = askQuestionSchema.safeParse({
      location: "Delhi",
      question: "Hi",
    });
    expect(bad.success).toBe(false);

    const good = askQuestionSchema.safeParse({
      location: "Delhi",
      question: "Which mask filters PM2.5 best?",
      aqi: 250,
    });
    expect(good.success).toBe(true);
  });
});
