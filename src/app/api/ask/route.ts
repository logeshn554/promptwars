import { NextRequest, NextResponse } from "next/server";
import { getClientIp, parseJsonBody } from "@/lib/apiHelpers";
import { answerSmogQuestion } from "@/lib/geminiPlanner";
import { checkRateLimit } from "@/lib/rateLimit";
import { askQuestionSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(`ask:${getClientIp(request)}`, 25, 60_000);

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute before trying again." },
      { status: 429 }
    );
  }

  const bodyResult = await parseJsonBody(request);
  if ("error" in bodyResult) return bodyResult.error;

  const parsed = askQuestionSchema.safeParse(bodyResult.data);
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
