import { NextRequest, NextResponse } from "next/server";

export function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function parseJsonBody(
  request: NextRequest
): Promise<{ data: unknown } | { error: NextResponse }> {
  try {
    const data = await request.json();
    return { data };
  } catch {
    return {
      error: NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 }),
    };
  }
}
