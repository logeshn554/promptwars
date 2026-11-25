import { NextRequest, NextResponse } from "next/server";
import { answerSmogQuestion } from "@/lib/geminiPlanner";
import { checkRateLimit } from "@/lib/rateLimit";
import { askQuestionSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const rate = checkRateLimit(`ask:${clientIp}`, 25, 60_000);

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

  const parsed = askQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid question input." },
      { status: 400 }
    );
  }

  const result = await answerSmogQuestion(
    parsed.data.location,
    parsed.data.question,
    parsed.data.aqi
  );

  return NextResponse.json(result, { status: 200 });
}
