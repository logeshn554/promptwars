"use client";

import { useState } from "react";
import { Check, Copy, Leaf } from "lucide-react";
import type { ActionRecommendation, AssistantPlanResponse } from "@/lib/types";

interface ImpactBannerProps {
  plan: AssistantPlanResponse;
  selectedActions: ActionRecommendation[];
  co2Saved: number;
  pm25Cut: number;
}

export function ImpactBanner({
  plan,
  selectedActions,
  co2Saved,
  pm25Cut,
}: ImpactBannerProps) {
  const [copied, setCopied] = useState(false);
  const equivalentKmAvoided = Math.round(co2Saved * 4.5);

  async function handleCopyPlan() {
    const lines = [
      `ClearAir Winter Plan for ${plan.airQuality.city} (AQI ${plan.airQuality.aqi})`,
      plan.summary,
      `Committed Weekly Impact: ${co2Saved} kg CO2e saved (~${equivalentKmAvoided} car km avoided), ~${pm25Cut}% indoor PM2.5 cut.`,
      "Selected Actions:",
      ...selectedActions.map((a) => `- ${a.title}: ${a.directImpact}`),
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      aria-labelledby="impact-heading"
      className="rounded-2xl border border-emerald-200 bg-emerald-900 p-5 text-white shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="impact-heading" className="flex items-center gap-2 text-lg font-bold">
              <Leaf className="h-5 w-5 text-emerald-300" aria-hidden="true" />
              Your Committed Weekly Impact
            </h2>
            <span className="rounded-full bg-emerald-800 px-2.5 py-0.5 text-xs font-medium text-emerald-100">
              {plan.source === "gemini" ? "Gemini GenAI" : "Offline Guided Engine"}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-emerald-100">{plan.summary}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="status"
            aria-live="polite"
            className="flex shrink-0 gap-3"
          >
            <div className="rounded-xl bg-emerald-800/80 px-4 py-2.5 text-center">
              <p className="text-xs text-emerald-200">CO₂e Avoided</p>
              <p className="text-xl font-bold">{co2Saved} kg/wk</p>
              <p className="text-[11px] text-emerald-200">
                ~{equivalentKmAvoided} car km
              </p>
            </div>
            <div className="rounded-xl bg-emerald-800/80 px-4 py-2.5 text-center">
              <p className="text-xs text-emerald-200">Indoor PM2.5 Cut</p>
              <p className="text-xl font-bold">~{pm25Cut}%</p>
              <p className="text-[11px] text-emerald-200">
                {selectedActions.length} actions active
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleCopyPlan()}
            aria-label="Copy family and community clean-air plan"
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-800 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                Copied Plan
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                Share Plan
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
