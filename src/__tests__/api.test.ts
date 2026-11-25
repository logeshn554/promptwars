import { describe, expect, it, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as healthGet } from "@/app/api/health/route";
import { GET as airQualityGet } from "@/app/api/air-quality/route";
import { POST as planPost } from "@/app/api/plan/route";
import { POST as askPost } from "@/app/api/ask/route";
import { clearRateLimitStore } from "@/lib/rateLimit";

describe("API route handlers", () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it("GET /api/health returns ok", async () => {
    const res = await healthGet();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  it("GET /api/air-quality validates city and returns AQI data", async () => {
    const badReq = new NextRequest("http://localhost/api/air-quality?city=A");
    const badRes = await airQualityGet(badReq);
    expect(badRes.status).toBe(400);

    const goodReq = new NextRequest("http://localhost/api/air-quality?city=Delhi");
    const goodRes = await airQualityGet(goodReq);
    expect(goodRes.status).toBe(200);
    const data = await goodRes.json();
    expect(data.city).toBe("Delhi");
  });

  it("POST /api/plan returns tailored recommendations", async () => {
    const req = new NextRequest("http://localhost/api/plan", {
      method: "POST",
      body: JSON.stringify({
        location: "Lahore",
        householdType: "family_kids",
        commuteMode: "car",
        heatingSource: "gas_wood",
        homeType: "apartment",
      }),
    });
    const res = await planPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.recommendations).toHaveLength(6);
  });

  it("POST /api/ask rejects invalid JSON and answers valid questions", async () => {
    const badReq = new NextRequest("http://localhost/api/ask", {
      method: "POST",
      body: "{bad",
    });
    const badRes = await askPost(badReq);
    expect(badRes.status).toBe(400);

    const goodReq = new NextRequest("http://localhost/api/ask", {
      method: "POST",
      body: JSON.stringify({
        location: "Delhi",
        question: "When should I open windows?",
        aqi: 280,
      }),
    });
    const goodRes = await askPost(goodReq);
    expect(goodRes.status).toBe(200);
    const data = await goodRes.json();
    expect(data.answer).toContain("1:00–3:00 PM");
  });
});
