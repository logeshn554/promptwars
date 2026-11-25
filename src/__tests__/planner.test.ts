import { beforeEach, describe, expect, it } from "vitest";
import { getAirQualityForCity } from "@/lib/airQualityData";
import { buildFallbackAnswer, buildFallbackPlan } from "@/lib/fallbackPlanner";
import { checkRateLimit, clearRateLimitStore } from "@/lib/rateLimit";

describe("airQualityData & fallbackPlanner", () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it("returns preset winter smog data for Delhi", () => {
    const aqi = getAirQualityForCity("Delhi");
    expect(aqi.city).toBe("Delhi");
    expect(aqi.aqi).toBeGreaterThan(200);
    expect(aqi.inversionRisk).toBe("Severe");
  });

  it("generates deterministic data for custom cities", () => {
    const first = getAirQualityForCity("Springfield");
    const second = getAirQualityForCity("Springfield");
    expect(first).toEqual(second);
    expect(first.pm25).toBeGreaterThan(0);
  });

  it("builds 6 tailored recommendations across all 3 categories", () => {
    const aq = getAirQualityForCity("Lahore");
    const plan = buildFallbackPlan(
      {
        location: "Lahore",
        householdType: "family_kids",
        commuteMode: "car",
        heatingSource: "gas_wood",
        homeType: "house",
      },
      aq
    );
    expect(plan.recommendations).toHaveLength(6);
    const categories = new Set(plan.recommendations.map((r) => r.category));
    expect(categories).toEqual(new Set(["routine", "indoor_air", "sustainable_alt"]));
  });

  it("answers mask questions with N95/FFP2 guidance", () => {
    const ans = buildFallbackAnswer("Delhi", "What mask should I wear?", 300);
    expect(ans.answer).toContain("N95");
    expect(ans.source).toBe("deterministic");
  });

  it("enforces rate limits", () => {
    expect(checkRateLimit("user-1", 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit("user-1", 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit("user-1", 2, 60_000).allowed).toBe(false);
  });
});
