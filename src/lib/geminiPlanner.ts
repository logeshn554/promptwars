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

function buildPlanPrompt(
  profile: LifestyleProfile,
  airQuality: AirQualityData
): string {
  return [
    "You are ClearAir, a winter smog and urban air pollution assistant for families and communities.",
    `Location: "${airQuality.city}" (AQI: ${airQuality.aqi}, Category: ${airQuality.category}, PM2.5: ${airQuality.pm25} ug/m3, Inversion Risk: ${airQuality.inversionRisk}).`,
    `Household: ${profile.householdType}, Commute: ${profile.commuteMode}, Heating: ${profile.heatingSource}, Home: ${profile.homeType}.`,
    profile.focusGoal ? `User Goal: "${profile.focusGoal}"` : "",
    "Return ONLY valid JSON matching: { summary: string, recommendations: Array<{ id, category ('routine'|'indoor_air'|'sustainable_alt'), title, description, directImpact, co2SavedKgPerWeek (number), pm25ReductionPercent (number), difficulty ('Easy'|'Medium'|'High'), communityBenefit }> }.",
    "Provide 6 practical, science-backed recommendations (2 routine, 2 indoor_air, 2 sustainable_alt) with clear direct impact explanations.",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Generates a tailored winter clean-air plan using Gemini when configured,
 * falling back cleanly to the deterministic engine otherwise.
 */
export async function generateTailoredPlan(
  profile: LifestyleProfile,
  airQuality: AirQualityData
): Promise<AssistantPlanResponse> {
  const client = getClient();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: buildPlanPrompt(profile, airQuality),
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
      // Gracefully fall back to deterministic recommendations.
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

/**
 * Answers a user's winter smog question using Gemini when configured,
 * or falls back to deterministic evidence-based guidance.
 */
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
        `Location: "${location}"${aqi ? `, AQI: ${aqi}` : ""}.`,
        `User Question: "${question}"`,
        "Respond in 2-3 clear sentences with practical, safe advice.",
      ].join("\n");

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { temperature: 0.4 },
      });

      const answer = response.text?.trim();
      if (answer && answer.length >= 15) {
        const firstSentence = answer.split(".")[0]?.trim();
        return {
          answer,
          keyTakeaway: firstSentence ? `${firstSentence}.` : answer,
          source: "gemini",
        };
      }
    } catch {
      // Gracefully fall back to deterministic Q&A.
    }
  }

  return buildFallbackAnswer(location, question, aqi);
}
