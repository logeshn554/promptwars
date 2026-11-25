import { GoogleGenAI } from "@google/genai";
import { buildFallbackAnswer, buildFallbackPlan } from "./fallbackPlanner";
import type {
  AirQualityData,
  AskQuestionResponse,
  AssistantPlanResponse,
  LifestyleProfile,
} from "./types";
import { aiPlanOutputSchema } from "./validation";

let cachedClient: GoogleGenAI | null = null;
let cachedKey: string | undefined;

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  if (!cachedClient || cachedKey !== apiKey) {
    cachedClient = new GoogleGenAI({ apiKey });
    cachedKey = apiKey;
  }
  return cachedClient;
}

export async function generateTailoredPlan(
  profile: LifestyleProfile,
  airQuality: AirQualityData
): Promise<AssistantPlanResponse> {
  const client = getClient();

  if (client) {
    try {
      const prompt = [
        "You are ClearAir, a winter smog and urban air pollution assistant for families and communities.",
        `Location: ${airQuality.city} (AQI: ${airQuality.aqi}, Category: ${airQuality.category}, PM2.5: ${airQuality.pm25} ug/m3, Inversion Risk: ${airQuality.inversionRisk}).`,
        `Household: ${profile.householdType}, Commute: ${profile.commuteMode}, Heating: ${profile.heatingSource}, Home: ${profile.homeType}.`,
        profile.focusGoal ? `User Goal: ${profile.focusGoal}` : "",
        "Return ONLY valid JSON matching: { summary: string, recommendations: Array<{ id, category ('routine'|'indoor_air'|'sustainable_alt'), title, description, directImpact, co2SavedKgPerWeek (number), pm25ReductionPercent (number), difficulty ('Easy'|'Medium'|'High'), communityBenefit }> }.",
        "Provide 6 practical, science-backed recommendations (2 routine, 2 indoor_air, 2 sustainable_alt) with clear direct impact explanations.",
      ]
        .filter(Boolean)
        .join("\n");

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const rawText = response.text?.trim();
      if (rawText) {
        const parsed = aiPlanOutputSchema.safeParse(JSON.parse(rawText));
        if (parsed.success) {
          return {
            airQuality,
            summary: parsed.data.summary,
            recommendations: parsed.data.recommendations,
            source: "gemini",
            generatedAt: new Date().toISOString(),
          };
        }
      }
    } catch {
      // Fall back to deterministic engine on API or parse errors.
    }
  }

  const fallback = buildFallbackPlan(profile, airQuality);
  return {
    airQuality,
    summary: fallback.summary,
    recommendations: fallback.recommendations,
    source: "deterministic",
    generatedAt: new Date().toISOString(),
  };
}

export async function answerSmogQuestion(
  location: string,
  question: string,
  aqi?: number
): Promise<AskQuestionResponse> {
  const client = getClient();

  if (client) {
    try {
      const prompt = [
        "You are ClearAir, a concise, evidence-based winter smog assistant.",
        `Location: ${location}${aqi ? `, AQI: ${aqi}` : ""}.`,
        `Question: ${question}`,
        "Respond in 2-3 clear sentences with practical, safe advice.",
      ].join("\n");

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { temperature: 0.4 },
      });

      const answer = response.text?.trim();
      if (answer && answer.length >= 15) {
        return {
          answer,
          keyTakeaway: answer.split(".")[0]?.trim() + ".",
          source: "gemini",
        };
      }
    } catch {
      // Fall back gracefully.
    }
  }

  return buildFallbackAnswer(location, question, aqi);
}
