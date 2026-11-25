import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ActionCard } from "@/components/ActionCard";
import { AirQualityCard } from "@/components/AirQualityCard";
import { AskAssistant } from "@/components/AskAssistant";
import { ImpactBanner } from "@/components/ImpactBanner";

describe("UI components", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

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

  it("renders ImpactBanner with quantified metrics and share button", () => {
    render(
      <ImpactBanner
        plan={{
          airQuality: {
            city: "Delhi",
            aqi: 342,
            category: "Hazardous",
            pm25: 278,
            pm10: 410,
            no2: 74,
            inversionRisk: "Severe",
            bestOutdoorWindow: "1:30 PM – 3:30 PM",
            advisory: "Avoid outdoor exertion.",
          },
          summary: "Midday errands and HEPA filtration reduce exposure.",
          recommendations: [],
          source: "deterministic",
          generatedAt: new Date().toISOString(),
        }}
        selectedActions={[]}
        co2Saved={15.5}
        pm25Cut={45}
      />
    );

    expect(screen.getByText("15.5 kg/wk")).toBeInTheDocument();
    expect(screen.getByText("~45%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copy family and community/i })).toBeInTheDocument();
  });

  it("submits question in AskAssistant and renders answer", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          answer: "Use a fitted N95 mask outdoors.",
          keyTakeaway: "Choose N95/FFP2.",
          source: "deterministic",
        }),
      })
    );

    render(<AskAssistant location="Delhi" aqi={300} />);
    const input = screen.getByLabelText(/Ask a question about winter smog/i);
    fireEvent.change(input, { target: { value: "Which mask should I wear?" } });
    fireEvent.click(screen.getByRole("button", { name: /^Ask$/i }));

    await waitFor(() => {
      expect(screen.getByText("Choose N95/FFP2.")).toBeInTheDocument();
    });
  });
});
