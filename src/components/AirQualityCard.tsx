"use client";

import { AlertTriangle, Clock, Wind } from "lucide-react";
import type { AirQualityData } from "@/lib/types";

interface AirQualityCardProps {
  data: AirQualityData;
}

function getBadgeStyle(aqi: number): string {
  if (aqi <= 50) return "bg-emerald-100 text-emerald-900 border-emerald-300";
  if (aqi <= 100) return "bg-amber-100 text-amber-900 border-amber-300";
  if (aqi <= 150) return "bg-orange-100 text-orange-900 border-orange-300";
  if (aqi <= 200) return "bg-red-100 text-red-900 border-red-300";
  return "bg-purple-100 text-purple-900 border-purple-300";
}

export function AirQualityCard({ data }: AirQualityCardProps) {
  return (
    <section
      aria-labelledby="aqi-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Local Winter Air Snapshot
          </p>
          <h2 id="aqi-heading" className="mt-1 text-xl font-bold text-slate-900">
            {data.city}
          </h2>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${getBadgeStyle(
            data.aqi
          )}`}
        >
          <Wind className="h-4 w-4" aria-hidden="true" />
          AQI {data.aqi} · {data.category}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs font-medium text-slate-600">PM2.5</dt>
          <dd className="mt-0.5 text-lg font-bold text-slate-900">
            {data.pm25} <span className="text-xs font-normal text-slate-600">µg/m³</span>
          </dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs font-medium text-slate-600">PM10</dt>
          <dd className="mt-0.5 text-lg font-bold text-slate-900">
            {data.pm10} <span className="text-xs font-normal text-slate-600">µg/m³</span>
          </dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs font-medium text-slate-600">NO₂</dt>
          <dd className="mt-0.5 text-lg font-bold text-slate-900">
            {data.no2} <span className="text-xs font-normal text-slate-600">ppb</span>
          </dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs font-medium text-slate-600">Inversion Risk</dt>
          <dd className="mt-0.5 text-lg font-bold text-slate-900">
            {data.inversionRisk}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-col gap-2 rounded-xl bg-sky-50 p-3.5 text-sm text-sky-950 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" />
          <span>{data.advisory}</span>
        </p>
        <p className="flex shrink-0 items-center gap-1.5 font-semibold text-sky-900">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Best window: {data.bestOutdoorWindow}
        </p>
      </div>
    </section>
  );
}
