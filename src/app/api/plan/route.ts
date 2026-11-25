import { NextRequest, NextResponse } from "next/server";
import { getAirQualityForCity } from "@/lib/airQualityData";
import { generateTailoredPlan } from "@/lib/geminiPlanner";
import { checkRateLimit } from "@/lib/rateLimit";
import { lifestyleProfileSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const rate = checkRateLimit(`plan:${clientIp}`, 20, 60_000);

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute before trying again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = lifestyleProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid profile input.",
      },
      { status: 400 }
    );
  }

  const airQuality = getAirQualityForCity(parsed.data.location);
  const plan = await generateTailoredPlan(parsed.data, airQuality);

  return NextResponse.json(plan, { status: 200 });
}
