import { NextRequest, NextResponse } from "next/server";
import { getAirQualityForCity } from "@/lib/airQualityData";
import { getClientIp, parseJsonBody } from "@/lib/apiHelpers";
import { generateTailoredPlan } from "@/lib/geminiPlanner";
import { checkRateLimit } from "@/lib/rateLimit";
import { lifestyleProfileSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(`plan:${getClientIp(request)}`, 20, 60_000);

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute before trying again." },
      { status: 429 }
    );
  }

  const bodyResult = await parseJsonBody(request);
  if ("error" in bodyResult) return bodyResult.error;

  const parsed = lifestyleProfileSchema.safeParse(bodyResult.data);
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
