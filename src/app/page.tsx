"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Wind } from "lucide-react";
import { ActionCard } from "@/components/ActionCard";
import { AirQualityCard } from "@/components/AirQualityCard";
import { AskAssistant } from "@/components/AskAssistant";
import { ImpactBanner } from "@/components/ImpactBanner";
import { ProfileForm } from "@/components/ProfileForm";
import type {
  ActionCategory,
  AssistantPlanResponse,
  LifestyleProfile,
} from "@/lib/types";

const INITIAL_PROFILE: LifestyleProfile = {
  location: "Delhi",
  householdType: "family_kids",
  commuteMode: "car",
  heatingSource: "gas_wood",
  homeType: "apartment",
  focusGoal: "",
};

const FILTER_TABS: ReadonlyArray<readonly [ActionCategory | "all", string]> = [
  ["all", "All"],
  ["routine", "Daily Routines"],
  ["indoor_air", "Indoor Air Hacks"],
  ["sustainable_alt", "Sustainable Alternatives"],
];

export default function HomePage() {
  const [profile, setProfile] = useState<LifestyleProfile>(INITIAL_PROFILE);
  const [activeFilter, setActiveFilter] = useState<ActionCategory | "all">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<AssistantPlanResponse | null>(null);

  const fetchPlan = useCallback(async (targetProfile: LifestyleProfile) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...targetProfile,
          focusGoal: targetProfile.focusGoal?.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate tailored plan.");
        return;
      }
      const typed = data as AssistantPlanResponse;
      setPlan(typed);
      setSelectedIds(typed.recommendations.slice(0, 2).map((r) => r.id));
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPlan(INITIAL_PROFILE);
  }, [fetchPlan]);

  const handleProfileChange = useCallback(
    <K extends keyof LifestyleProfile>(key: K, value: LifestyleProfile[K]) => {
      setProfile((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    void fetchPlan(profile);
  }

  const toggleCommitment = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const filteredRecommendations = useMemo(() => {
    if (!plan) return [];
    if (activeFilter === "all") return plan.recommendations;
    return plan.recommendations.filter((r) => r.category === activeFilter);
  }, [plan, activeFilter]);

  const selectedActions = useMemo(() => {
    if (!plan) return [];
    return plan.recommendations.filter((r) => selectedIds.includes(r.id));
  }, [plan, selectedIds]);

  const impactTotals = useMemo(() => {
    const co2 = selectedActions.reduce((sum, item) => sum + item.co2SavedKgPerWeek, 0);
    const pm25 = Math.min(
      85,
      selectedActions.reduce(
        (sum, item) => sum + Math.round(item.pm25ReductionPercent * 0.45),
        0
      )
    );
    return { co2: Number(co2.toFixed(1)), pm25 };
  }, [selectedActions]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white">
              <Wind className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-900">ClearAir</h1>
              <p className="text-xs text-slate-600">
                Winter Smog &amp; Urban Air Quality Assistant
              </p>
            </div>
          </div>
          <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 sm:inline-block">
            GenAI Family &amp; Community Guide
          </span>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <ProfileForm
          profile={profile}
          onChange={handleProfileChange}
          loading={loading}
          error={error}
          onSubmit={handleGenerate}
        />

        {plan && (
          <div aria-live="polite" className="space-y-6">
            <AirQualityCard data={plan.airQuality} />

            <ImpactBanner
              plan={plan}
              selectedActions={selectedActions}
              co2Saved={impactTotals.co2}
              pm25Cut={impactTotals.pm25}
            />

            <section aria-labelledby="actions-heading" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="actions-heading" className="text-lg font-bold text-slate-900">
                  Tailored Recommendations ({filteredRecommendations.length})
                </h2>
                <div role="tablist" aria-label="Filter recommendations" className="flex flex-wrap gap-2">
                  {FILTER_TABS.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={activeFilter === key}
                      onClick={() => setActiveFilter(key)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                        activeFilter === key
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {filteredRecommendations.map((item) => (
                  <ActionCard
                    key={item.id}
                    item={item}
                    selected={selectedIds.includes(item.id)}
                    onToggle={toggleCommitment}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        <AskAssistant location={profile.location} aqi={plan?.airQuality.aqi} />
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-600">
        ClearAir · Empowering families &amp; communities against winter smog.
      </footer>
    </div>
  );
}
