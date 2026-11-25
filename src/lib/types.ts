export type HouseholdType =
  | "family_kids"
  | "seniors_sensitive"
  | "young_professionals"
  | "community_organizer";

export type CommuteMode = "car" | "public_transit" | "bike_walk" | "remote";

export type HeatingSource = "gas_wood" | "electric_heatpump" | "district_mixed";

export type HomeType = "apartment" | "house";

export type ActionCategory = "routine" | "indoor_air" | "sustainable_alt";

export interface LifestyleProfile {
  location: string;
  householdType: HouseholdType;
  commuteMode: CommuteMode;
  heatingSource: HeatingSource;
  homeType: HomeType;
  focusGoal?: string;
}

export interface AirQualityData {
  city: string;
  aqi: number;
  category: "Good" | "Moderate" | "Unhealthy for Sensitive Groups" | "Unhealthy" | "Very Unhealthy" | "Hazardous";
  pm25: number;
  pm10: number;
  no2: number;
  inversionRisk: "Low" | "Moderate" | "High" | "Severe";
  bestOutdoorWindow: string;
  advisory: string;
}

export interface ActionRecommendation {
  id: string;
  category: ActionCategory;
  title: string;
  description: string;
  directImpact: string;
  co2SavedKgPerWeek: number;
  pm25ReductionPercent: number;
  difficulty: "Easy" | "Medium" | "High";
  communityBenefit: string;
}

export interface AssistantPlanResponse {
  airQuality: AirQualityData;
  summary: string;
  recommendations: ActionRecommendation[];
  source: "gemini" | "deterministic";
  generatedAt: string;
}

export interface AskQuestionResponse {
  answer: string;
  keyTakeaway: string;
  source: "gemini" | "deterministic";
}
