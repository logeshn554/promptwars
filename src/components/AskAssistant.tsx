"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import type { AskQuestionResponse } from "@/lib/types";

interface AskAssistantProps {
  location: string;
  aqi?: number;
}

const SAMPLE_QUESTIONS = [
  "Which mask works best for winter PM2.5 smog?",
  "When should I open windows for ventilation?",
  "Do houseplants clean winter smog indoors?",
];

export function AskAssistant({ location, aqi }: AskAssistantProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskQuestionResponse | null>(null);

  async function handleAsk(textToAsk: string) {
    const trimmed = textToAsk.trim();
    if (trimmed.length < 5) {
      setError("Please enter a question of at least 5 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, question: trimmed, aqi }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to answer right now.");
        return;
      }
      setResult(data as AskQuestionResponse);
    } catch {
      setError("Network error while contacting the assistant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-labelledby="ask-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-sky-700" aria-hidden="true" />
        <h2 id="ask-heading" className="text-lg font-bold text-slate-900">
          Ask ClearAir About Winter Smog
        </h2>
      </div>
      <p id="ask-helper" className="mt-1 text-sm text-slate-600">
        Get quick, evidence-based answers tailored to {location}.
      </p>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Suggested smog questions">
        {SAMPLE_QUESTIONS.map((sample) => (
          <button
            key={sample}
            type="button"
            disabled={loading}
            onClick={() => {
              setQuestion(sample);
              void handleAsk(sample);
            }}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            {sample}
          </button>
        ))}
      </div>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void handleAsk(question);
        }}
      >
        <label htmlFor="smog-question" className="sr-only">
          Ask a question about winter smog
        </label>
        <input
          id="smog-question"
          aria-describedby="ask-helper"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., How do I build a DIY air purifier?"
          maxLength={300}
          className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {result && (
        <div
          aria-live="polite"
          className="mt-4 rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-sm text-slate-900"
        >
          <p className="font-semibold text-sky-950">{result.keyTakeaway}</p>
          <p className="mt-1.5 leading-relaxed text-slate-800">{result.answer}</p>
        </div>
      )}
    </section>
  );
}
