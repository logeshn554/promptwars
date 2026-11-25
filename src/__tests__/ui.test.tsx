import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActionCard } from "@/components/ActionCard";
import { AirQualityCard } from "@/components/AirQualityCard";

describe("UI components", () => {
  it("renders AirQualityCard with accessible heading and metrics", () => {
    render(
      <AirQualityCard
        data={{
          city: "Delhi",
          aqi: 342,
          category: "Hazardous",
          pm25: 278,
          pm10: 410,
          no2: 74,
          inversionRisk: "Severe",
          bestOutdoorWindow: "1:30 PM – 3:30 PM",
          advisory: "Avoid outdoor exertion.",
        }}
      />
    );
    expect(screen.getByRole("heading", { name: "Delhi" })).toBeInTheDocument();
    expect(screen.getByText(/AQI 342/)).toBeInTheDocument();
    expect(screen.getByText(/1:30 PM – 3:30 PM/)).toBeInTheDocument();
  });

  it("toggles ActionCard commitment state", () => {
    const onToggle = vi.fn();
    render(
      <ActionCard
        item={{
          id: "test-1",
          category: "indoor_air",
          title: "Run HEPA filter",
          description: "Run HEPA in bedroom.",
          directImpact: "Cuts PM2.5 by 65%.",
          co2SavedKgPerWeek: 1.2,
          pm25ReductionPercent: 65,
          difficulty: "Easy",
          communityBenefit: "Protects kids.",
        }}
        selected={false}
        onToggle={onToggle}
      />
    );

    const btn = screen.getByRole("button", { name: /Commit to "Run HEPA filter"/i });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalledWith("test-1");
  });
});
