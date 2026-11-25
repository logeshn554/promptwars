import type { AirQualityData } from "./types";

const PRESET_CITIES: Record<string, Omit<AirQualityData, "city">> = {
  delhi: {
    aqi: 342,
    category: "Hazardous",
    pm25: 278,
    pm10: 410,
    no2: 74,
    inversionRisk: "Severe",
    bestOutdoorWindow: "1:30 PM – 3:30 PM",
    advisory:
      "Severe winter temperature inversion traps PM2.5 near ground level. Avoid outdoor exertion and seal indoor drafts.",
  },
  lahore: {
    aqi: 318,
    category: "Hazardous",
    pm25: 254,
    pm10: 382,
    no2: 68,
    inversionRisk: "Severe",
    bestOutdoorWindow: "1:00 PM – 3:00 PM",
    advisory:
      "Dense winter smog episode. Keep children and seniors indoors with HEPA/Corsi-Rosenthal filtration.",
  },
  beijing: {
    aqi: 168,
    category: "Unhealthy",
    pm25: 88,
    pm10: 132,
    no2: 52,
    inversionRisk: "High",
    bestOutdoorWindow: "12:30 PM – 3:30 PM",
    advisory:
      "Elevated winter heating and traffic particulates. Use N95/FFP2 masks for commutes and ventilate briefly at midday.",
  },
  london: {
    aqi: 92,
    category: "Moderate",
    pm25: 31,
    pm10: 48,
    no2: 44,
    inversionRisk: "Moderate",
    bestOutdoorWindow: "11:00 AM – 4:00 PM",
    advisory:
      "Cold-weather wood-burning and traffic NO2 spike during morning/evening rush. Prefer rail or off-peak walking.",
  },
  "los angeles": {
    aqi: 128,
    category: "Unhealthy for Sensitive Groups",
    pm25: 46,
    pm10: 76,
    no2: 49,
    inversionRisk: "High",
    bestOutdoorWindow: "10:00 AM – 2:00 PM",
    advisory:
      "Basin inversion traps vehicle emissions. Sensitive groups should limit prolonged outdoor exercise.",
  },
  krakow: {
    aqi: 194,
    category: "Unhealthy",
    pm25: 118,
    pm10: 158,
    no2: 46,
    inversionRisk: "High",
    bestOutdoorWindow: "1:00 PM – 3:00 PM",
    advisory:
      "Solid-fuel heating smog peaks after sunset. Run indoor air filtration continuously overnight.",
  },
};

function getCategory(aqi: number): AirQualityData["category"] {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

function hashCity(city: string): number {
  let hash = 0;
  for (let i = 0; i < city.length; i += 1) {
    hash = (hash * 31 + city.charCodeAt(i)) % 10000;
  }
  return hash;
}

export function getAirQualityForCity(cityInput: string): AirQualityData {
  const normalized = cityInput.trim().toLowerCase();
  const preset = PRESET_CITIES[normalized];
  if (preset) {
    return { city: cityInput.trim(), ...preset };
  }

  const seed = hashCity(normalized);
  const aqi = 65 + (seed % 210);
  const pm25 = Math.round(aqi * 0.62);
  const pm10 = Math.round(pm25 * 1.45);
  const no2 = 22 + (seed % 48);
  const inversionRisk: AirQualityData["inversionRisk"] =
    aqi > 220 ? "Severe" : aqi > 150 ? "High" : aqi > 90 ? "Moderate" : "Low";

  return {
    city: cityInput.trim(),
    aqi,
    category: getCategory(aqi),
    pm25,
    pm10,
    no2,
    inversionRisk,
    bestOutdoorWindow: aqi > 150 ? "1:00 PM – 3:00 PM" : "11:00 AM – 4:00 PM",
    advisory:
      aqi > 150
        ? "Winter inversion layer is trapping urban particulates. Prioritize indoor filtration and low-emission transit."
        : "Moderate winter air quality. Time outdoor errands for midday when atmospheric mixing is highest.",
  };
}
