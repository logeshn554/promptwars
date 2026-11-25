"use client";

import { useMemo, useState } from "react";
import { Leaf, Wind } from "lucide-react";
import { ActionCard } from "@/components/ActionCard";
import { AirQualityCard } from "@/components/AirQualityCard";
import { AskAssistant } from "@/components/AskAssistant";
import { ProfileForm } from "@/components/ProfileForm";
import type {
  ActionCategory,
  AssistantPlanResponse,
  CommuteMode,
  HeatingSource,
  HomeType,
  HouseholdType,
} from "@/lib/types";

export default function HomePage() {
  const [location, setLocation] = useState("Delhi");
  const [householdType, setHouseholdType] = useState<HouseholdType>("family_kids");
  const [commuteMode, setCommuteMode] = useState<CommuteMode>("car");
  const [heatingSource, setHeatingSource] = useState<HeatingSource>("gas_wood");
  const [homeType, setHomeType] = useState<HomeType>("apartment");
  const [focusGoal, setFocusGoal] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActionCategory | "all">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<AssistantPlanResponse | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          householdType,
          commuteMode,
          heatingSource,
          homeType,
          focusGoal: focusGoal.trim() || undefined,
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
  }

  function toggleCommitment(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  const filteredRecommendations = useMemo(() => {
    if (!plan) return [];
    if (activeFilter === "all") return plan.recommendations;
    return plan.recommendations.filter((r) => r.category === activeFilter);
  }, [plan, activeFilter]);

  const impactTotals = useMemo(() => {
    if (!plan) return { co2: 0, pm25: 0 };
    const chosen = plan.recommendations.filter((r) => selectedIds.includes(r.id));
    const co2 = chosen.reduce((sum, item) => sum + item.co2SavedKgPerWeek, 0);
    const pm25 = Math.min(
      85,
      chosen.reduce((sum, item) => sum + Math.round(item.pm25ReductionPercent * 0.45), 0)
    );
    return { co2: Number(co2.toFixed(1)), pm25 };
  }, [plan, selectedIds]);

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
          location={location}
          setLocation={setLocation}
          householdType={householdType}
          setHouseholdType={setHouseholdType}
          commuteMode={commuteMode}
          setCommuteMode={setCommuteMode}
          heatingSource={heatingSource}
          setHeatingSource={setHeatingSource}
          homeType={homeType}
          setHomeType={setHomeType}
          focusGoal={focusGoal}
          setFocusGoal={setFocusGoal}
          loading={loading}
          error={error}
          onSubmit={handleGenerate}
        />

        {plan && (
          <div aria-live="polite" className="space-y-6">
            <AirQualityCard data={plan.airQuality} />

            <section
              aria-labelledby="impact-heading"
              className="rounded-2xl border border-emerald-200 bg-emerald-900 p-5 text-white shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 id="impact-heading" className="flex items-center gap-2 text-lg font-bold">
                    <Leaf className="h-5 w-5 text-emerald-300" aria-hidden="true" />
                    Your Committed Weekly Impact
                  </h2>
                  <p className="mt-1 text-sm text-emerald-100">{plan.summary}</p>
                </div>
                <div className="flex shrink-0 gap-4">
                  <div className="rounded-xl bg-emerald-800/80 px-4 py-2.5 text-center">
                    <p className="text-xs text-emerald-200">CO₂e Avoided</p>
                    <p className="text-xl font-bold">{impactTotals.co2} kg/wk</p>
                  </div>
                  <div className="rounded-xl bg-emerald-800/80 px-4 py-2.5 text-center">
                    <p className="text-xs text-emerald-200">Indoor PM2.5 Cut</p>
                    <p className="text-xl font-bold">~{impactTotals.pm25}%</p>
                  </div>
                </div>
              </div>
            </section>

            <section aria-labelledby="actions-heading" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="actions-heading" className="text-lg font-bold text-slate-900">
                  Tailored Recommendations ({filteredRecommendations.length})
                </h2>
                <div role="tablist" aria-label="Filter recommendations" className="flex flex-wrap gap-2">
                  {(
                    [
                      ["all", "All"],
                      ["routine", "Daily Routines"],
                      ["indoor_air", "Indoor Air Hacks"],
                      ["sustainable_alt", "Sustainable Alternatives"],
                    ] as const
                  ).map(([key, label]) => (
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

        <AskAssistant location={location} aqi={plan?.airQuality.aqi} />
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-600">
        ClearAir · Empowering families &amp; communities against winter smog.
      </footer>
    </div>
  );
}
