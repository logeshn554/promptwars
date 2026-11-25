import { NextRequest, NextResponse } from "next/server";
import { getAirQualityForCity } from "@/lib/airQualityData";
import { locationQuerySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city") ?? "";
  const parsed = locationQuerySchema.safeParse({ city });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid city parameter." },
      { status: 400 }
    );
  }

  const data = getAirQualityForCity(parsed.data.city);
  return NextResponse.json(data, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
