"use client";

import { Loader2, Sparkles } from "lucide-react";
import type {
  CommuteMode,
  HeatingSource,
  HomeType,
  HouseholdType,
  LifestyleProfile,
} from "@/lib/types";

const QUICK_CITIES = ["Delhi", "Lahore", "Beijing", "London", "Los Angeles"];

interface ProfileFormProps {
  profile: LifestyleProfile;
  onChange: <K extends keyof LifestyleProfile>(key: K, value: LifestyleProfile[K]) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProfileForm({
  profile,
  onChange,
  loading,
  error,
  onSubmit,
}: ProfileFormProps) {
  return (
    <section
      aria-labelledby="profile-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <h2 id="profile-heading" className="text-xl font-bold text-slate-900">
        Tailor Your Winter Clean-Air Plan
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Enter your city and household profile to get low-emission routines, indoor air
        quality hacks, and clear impact estimates.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="location-input" className="block text-sm font-semibold text-slate-800">
              City or Neighborhood
            </label>
            <input
              id="location-input"
              type="text"
              required
              value={profile.location}
              onChange={(e) => onChange("location", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-label="Quick city presets">
              {QUICK_CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  aria-pressed={profile.location === city}
                  onClick={() => onChange("location", city)}
                  className={`rounded-md px-2 py-0.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    profile.location === city
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="household-select" className="block text-sm font-semibold text-slate-800">
              Household Profile
            </label>
            <select
              id="household-select"
              value={profile.householdType}
              onChange={(e) => onChange("householdType", e.target.value as HouseholdType)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="family_kids">Family with children</option>
              <option value="seniors_sensitive">Seniors / Asthma-sensitive</option>
              <option value="young_professionals">Young professionals</option>
              <option value="community_organizer">Community organizer</option>
            </select>
          </div>

          <div>
            <label htmlFor="commute-select" className="block text-sm font-semibold text-slate-800">
              Primary Commute
            </label>
            <select
              id="commute-select"
              value={profile.commuteMode}
              onChange={(e) => onChange("commuteMode", e.target.value as CommuteMode)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="car">Private Car</option>
              <option value="public_transit">Public Transit / Metro</option>
              <option value="bike_walk">Bike / Walk</option>
              <option value="remote">Work / Study from Home</option>
            </select>
          </div>

          <div>
            <label htmlFor="heating-select" className="block text-sm font-semibold text-slate-800">
              Winter Heating / Cooking
            </label>
            <select
              id="heating-select"
              value={profile.heatingSource}
              onChange={(e) => onChange("heatingSource", e.target.value as HeatingSource)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="gas_wood">Gas / Wood / Solid Fuel</option>
              <option value="electric_heatpump">Electric / Heat Pump</option>
              <option value="district_mixed">District / Mixed Heating</option>
            </select>
          </div>

          <div>
            <label htmlFor="home-select" className="block text-sm font-semibold text-slate-800">
              Home Type
            </label>
            <select
              id="home-select"
              value={profile.homeType}
              onChange={(e) => onChange("homeType", e.target.value as HomeType)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="apartment">Apartment</option>
              <option value="house">Detached / Townhouse</option>
            </select>
          </div>

          <div>
            <label htmlFor="goal-input" className="block text-sm font-semibold text-slate-800">
              Optional Focus Goal
            </label>
            <input
              id="goal-input"
              type="text"
              value={profile.focusGoal ?? ""}
              onChange={(e) => onChange("focusGoal", e.target.value)}
              placeholder="e.g., safer school runs"
              maxLength={160}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? "Generating Plan..." : "Generate Clean-Air Plan"}
          </button>
          {error && (
            <p role="alert" className="text-sm font-medium text-red-700">
              {error}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
