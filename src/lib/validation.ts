import { z } from "zod";

const sanitizeText = (val: string) =>
  val.replace(/[<>\r\n\t`]/g, " ").replace(/\s+/g, " ").trim();

export const locationQuerySchema = z.object({
  city: z
    .string()
    .min(2, "City name must be at least 2 characters.")
    .max(80, "City name must be under 80 characters.")
    .transform(sanitizeText),
});

export const lifestyleProfileSchema = z.object({
  location: z
    .string()
    .min(2, "Please enter a city or neighborhood.")
    .max(80, "Location must be under 80 characters.")
    .transform(sanitizeText),
  householdType: z.enum([
    "family_kids",
    "seniors_sensitive",
    "young_professionals",
    "community_organizer",
  ]),
  commuteMode: z.enum(["car", "public_transit", "bike_walk", "remote"]),
  heatingSource: z.enum(["gas_wood", "electric_heatpump", "district_mixed"]),
  homeType: z.enum(["apartment", "house"]),
  focusGoal: z
    .string()
    .max(160, "Focus goal must be under 160 characters.")
    .transform(sanitizeText)
    .optional(),
});

export const askQuestionSchema = z.object({
  location: z
    .string()
    .min(2, "Location is required.")
    .max(80, "Location must be under 80 characters.")
    .transform(sanitizeText),
  question: z
    .string()
    .min(5, "Question must be at least 5 characters.")
    .max(300, "Question must be under 300 characters.")
    .transform(sanitizeText),
  aqi: z.number().min(0).max(500).optional(),
});

export const actionRecommendationSchema = z.object({
  id: z.string().min(1).max(60),
  category: z.enum(["routine", "indoor_air", "sustainable_alt"]),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(400),
  directImpact: z.string().min(10).max(300),
  co2SavedKgPerWeek: z.number().min(0).max(200),
  pm25ReductionPercent: z.number().min(0).max(95),
  difficulty: z.enum(["Easy", "Medium", "High"]),
  communityBenefit: z.string().min(5).max(250),
});

export const aiPlanOutputSchema = z.object({
  summary: z.string().min(15).max(500),
  recommendations: z.array(actionRecommendationSchema).min(4).max(9),
});
