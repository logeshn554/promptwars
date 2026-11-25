import type {
  ActionRecommendation,
  AirQualityData,
  AskQuestionResponse,
  LifestyleProfile,
} from "./types";

const HOUSEHOLD_NOTE: Record<LifestyleProfile["householdType"], string> = {
  family_kids: "Keep children's bedrooms sealed with continuous filtration and shift school-run walks to midday.",
  seniors_sensitive: "Prioritize N95/FFP2 protection, keep rescue inhalers accessible, and avoid morning cold-air exertion.",
  young_professionals: "Batch errands into midday breaks and use metro/carpool to cut rush-hour NO2 exposure.",
  community_organizer: "Share midday ventilation windows with neighbors and organize a school-zone no-idling pledge.",
};

export function buildFallbackPlan(
  profile: LifestyleProfile,
  airQuality: AirQualityData
): { summary: string; recommendations: ActionRecommendation[] } {
  const isSevere = airQuality.aqi >= 151;
  const householdTip = HOUSEHOLD_NOTE[profile.householdType];
  const recommendations: ActionRecommendation[] = [
    {
      id: "routine-midday-window",
      category: "routine",
      title: `Shift outdoor errands to ${airQuality.bestOutdoorWindow}`,
      description: `During winter in ${airQuality.city}, cold morning and evening air traps PM2.5 near street level. Schedule school runs, walks, and dog-walking during ${airQuality.bestOutdoorWindow} when sunlight breaks the inversion.`,
      directImpact:
        "Reduces peak inhaled PM2.5 dose by up to 42% compared to 7–9 AM rush hour.",
      co2SavedKgPerWeek: 1.5,
      pm25ReductionPercent: 38,
      difficulty: "Easy",
      communityBenefit:
        "Encourages staggered neighborhood errands and lowers peak-hour traffic idling.",
    },
    {
      id: "routine-commute-swap",
      category: "routine",
      title:
        profile.commuteMode === "car"
          ? "Swap 2 solo car trips for metro/carpool"
          : "Maintain zero-idling & N95/FFP2 commute",
      description:
        profile.commuteMode === "car"
          ? "Cold-start car engines emit 3–4x more particulates in winter. Combining errands or sharing a school/work carpool twice a week cuts tailpipe NO2."
          : "Keep wearing a snug N95/FFP2 mask on high-AQI days and avoid waiting near idling bus/car queues.",
      directImpact:
        profile.commuteMode === "car"
          ? "Cuts 14 kg CO2e/week and reduces street-level NO2 exposure for pedestrians."
          : "Blocks >95% of fine PM2.5 particles during transit.",
      co2SavedKgPerWeek: profile.commuteMode === "car" ? 14.0 : 4.5,
      pm25ReductionPercent: isSevere ? 45 : 25,
      difficulty: "Medium",
      communityBenefit:
        "Directly lowers neighborhood traffic congestion and school-zone exhaust.",
    },
    {
      id: "iaq-filtration",
      category: "indoor_air",
      title: "Run HEPA or DIY Corsi-Rosenthal box in main living area",
      description: `Place a HEPA purifier (or a MERV-13 box-fan filter) in the bedroom/living room, especially if you live in a ${profile.homeType}. Keep windows closed during evening smog peaks.`,
      directImpact:
        "Lowers indoor PM2.5 concentrations by 55–70% within 45 minutes of continuous operation.",
      co2SavedKgPerWeek: 0.8,
      pm25ReductionPercent: 65,
      difficulty: "Easy",
      communityBenefit:
        "DIY filter workshops can protect low-income neighbors and classrooms affordably.",
    },
    {
      id: "iaq-cooking-vent",
      category: "indoor_air",
      title: "Seal drafts & run range hood during winter cooking",
      description:
        "Gas stoves and frying release indoor NO2 and ultrafine particles. Always run an externally vented hood or crack a window briefly with a fan blowing outward while cooking.",
      directImpact:
        "Prevents indoor NO2 spikes from exceeding outdoor smog levels by 2–3x.",
      co2SavedKgPerWeek: 2.2,
      pm25ReductionPercent: 32,
      difficulty: "Easy",
      communityBenefit:
        "Protects children and seniors from indoor asthma triggers.",
    },
    {
      id: "alt-heating",
      category: "sustainable_alt",
      title:
        profile.heatingSource === "gas_wood"
          ? "Replace wood/coal heating with electric heat or draft-proofing"
          : "Optimize thermostat & weather-strip windows",
      description:
        profile.heatingSource === "gas_wood"
          ? "Residential wood and solid-fuel burning is a top driver of winter PM2.5. Use electric space heating in occupied rooms and seal window gaps with foam tape."
          : "Lower thermostat by 1°C overnight and seal door sweeps to cut heating energy demand without sacrificing comfort.",
      directImpact:
        profile.heatingSource === "gas_wood"
          ? "Eliminates localized smoke plumes and saves ~18 kg CO2e/week."
          : "Cuts household heating emissions by 8–10% (~9 kg CO2e/week).",
      co2SavedKgPerWeek: profile.heatingSource === "gas_wood" ? 18.0 : 9.0,
      pm25ReductionPercent: profile.heatingSource === "gas_wood" ? 50 : 12,
      difficulty: "Medium",
      communityBenefit:
        "Reduces block-level winter smoke that lingers in stagnant cold air.",
    },
    {
      id: "alt-community-action",
      category: "sustainable_alt",
      title: "Start a neighborhood no-idling & clean-air alert group",
      description:
        "Coordinate with parents or neighbors to turn off engines during school pickups and share daily midday ventilation alerts.",
      directImpact:
        "Eliminates concentrated exhaust hotspots around schools and apartment entrances.",
      co2SavedKgPerWeek: 6.5,
      pm25ReductionPercent: 20,
      difficulty: "Easy",
      communityBenefit:
        "Builds collective resilience for vulnerable seniors and children.",
    },
  ];

  const summary = `In ${airQuality.city} (AQI ${airQuality.aqi} — ${airQuality.category}), winter inversion is ${airQuality.inversionRisk.toLowerCase()}. ${householdTip} Prioritizing midday errands (${airQuality.bestOutdoorWindow}), indoor MERV-13/HEPA filtration, and cleaner ${profile.commuteMode.replace("_", " ")} habits cuts PM2.5 exposure and weekly emissions.`;

  return { summary, recommendations };
}

export function buildFallbackAnswer(
  location: string,
  question: string,
  aqi?: number
): AskQuestionResponse {
  const q = question.toLowerCase();
  const aqiNote = aqi ? ` (current AQI ${aqi})` : "";

  if (q.includes("mask") || q.includes("n95") || q.includes("ffp2")) {
    return {
      answer: `For winter smog in ${location}${aqiNote}, surgical or cloth masks do not filter fine PM2.5. Use a well-fitted N95, KN95, or FFP2 respirator with a tight nose-bridge seal whenever AQI exceeds 100.`,
      keyTakeaway: "Choose N95/FFP2 with a snug seal; cloth masks miss PM2.5.",
      source: "deterministic",
    };
  }

  if (q.includes("window") || q.includes("ventilat") || q.includes("open")) {
    return {
      answer: `In ${location}${aqiNote}, keep windows closed during morning and evening rush hours when cold air traps smog. Cross-ventilate for 10–15 minutes around 1:00–3:00 PM when atmospheric mixing is highest, then run indoor filtration.`,
      keyTakeaway: "Ventilate briefly at midday (1–3 PM), seal during rush hour.",
      source: "deterministic",
    };
  }

  if (q.includes("plant") || q.includes("purifier") || q.includes("hepa")) {
    return {
      answer: `Houseplants alone cannot meaningfully remove winter PM2.5 smog. A true HEPA purifier or a DIY Corsi-Rosenthal box (box fan + MERV-13 filters) removes >95% of fine particulates indoors.`,
      keyTakeaway: "Use HEPA or MERV-13 box-fan filters instead of relying on plants.",
      source: "deterministic",
    };
  }

  return {
    answer: `To navigate winter smog in ${location}${aqiNote}, combine three steps: (1) shift outdoor activity to midday, (2) run HEPA/MERV-13 filtration indoors and vent cooking fumes, and (3) reduce cold-start car trips and solid-fuel burning.`,
    keyTakeaway: "Time outdoor trips for midday, filter indoor air, and cut idling.",
    source: "deterministic",
  };
}
