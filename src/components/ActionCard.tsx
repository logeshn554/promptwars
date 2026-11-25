"use client";

import { CheckCircle2, Circle, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import type { ActionRecommendation } from "@/lib/types";

interface ActionCardProps {
  item: ActionRecommendation;
  selected: boolean;
  onToggle: (id: string) => void;
}

const CATEGORY_META: Record<
  ActionRecommendation["category"],
  { label: string; badgeClass: string }
> = {
  routine: {
    label: "Low-Emission Routine",
    badgeClass: "bg-sky-100 text-sky-900",
  },
  indoor_air: {
    label: "Indoor Air Hack",
    badgeClass: "bg-teal-100 text-teal-900",
  },
  sustainable_alt: {
    label: "Sustainable Alternative",
    badgeClass: "bg-emerald-100 text-emerald-900",
  },
};

export function ActionCard({ item, selected, onToggle }: ActionCardProps) {
  const meta = CATEGORY_META[item.category];
  const headingId = `action-title-${item.id}`;

  return (
    <article
      aria-labelledby={headingId}
      className={`rounded-2xl border p-5 transition-colors ${
        selected
          ? "border-emerald-500 bg-emerald-50/40 shadow-sm"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.badgeClass}`}
          >
            {meta.label}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            {item.difficulty}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onToggle(item.id)}
          aria-pressed={selected}
          aria-label={
            selected
              ? `Remove "${item.title}" from my weekly commitment`
              : `Commit to "${item.title}"`
          }
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          {selected ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              Committed
            </>
          ) : (
            <>
              <Circle className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Commit
            </>
          )}
        </button>
      </div>

      <h3 id={headingId} className="mt-3 text-base font-bold text-slate-900">
        {item.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
        {item.description}
      </p>

      <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-800">
        <p className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
          <span>
            <strong>Direct Impact:</strong> {item.directImpact}
          </span>
        </p>
        <p className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden="true" />
          <span>
            <strong>Community Benefit:</strong> {item.communityBenefit}
          </span>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
        <span className="inline-flex items-center gap-1 text-emerald-800">
          <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
          {item.co2SavedKgPerWeek} kg CO₂e/week saved
        </span>
        <span>Up to {item.pm25ReductionPercent}% PM2.5 reduction</span>
      </div>
    </article>
  );
}
