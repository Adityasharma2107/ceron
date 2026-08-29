"use client";

import { FormEvent, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { analyzeText, AnalyzeResponse } from "@/lib/api";

function formatDetectorName(type: string | null) {
  if (!type) {
    return "Security Detector";
  }

  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function severityLabel(severity: string) {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

export default function AIAnalysisPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!text.trim()) {
      setError("Please enter text to analyze.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const analysis = await analyzeText(text);
      setResult(analysis);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze the text.",
      );
    } finally {
      setLoading(false);
    }
  }

  const security = result?.security_analysis;

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            AI Analysis
          </h1>

          <p className="mt-2 text-muted-foreground">
            Analyze text for security threats using Ceron&apos;s
            detection engine.
          </p>
        </div>

        <form onSubmit={handleAnalyze} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="analysis-text"
              className="text-sm font-medium"
            >
              Text to analyze
            </label>

            <textarea
              id="analysis-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Enter text for Ceron to analyze..."
              maxLength={10000}
              rows={8}
              className="mt-2 w-full rounded-lg border bg-background p-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <p className="mt-1 text-xs text-muted-foreground">
              {text.length}/10,000 characters
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
  <button
    type="submit"
    disabled={loading}
    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
  >
    {loading ? "Analyzing..." : "Analyze"}
  </button>

  <button
    type="button"
    disabled={loading || (!text && !result && !error)}
    onClick={() => {
      setText("");
      setResult(null);
      setError("");
    }}
    className="rounded-lg border px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
  >
    Clear
  </button>
</div>
        </form>

        {error && (
          <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {security && (
          <div className="mt-8 rounded-xl border p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Security Analysis
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Analysis completed successfully.
                </p>
              </div>

              <div
                className={`rounded-full border px-3 py-1 text-sm font-medium ${
                  security.detected
                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                    : "border-border bg-muted text-foreground"
                }`}
              >
                {security.detected
                  ? "Threat Detected"
                  : "No Threat Detected"}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Threat detected
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {security.detected ? "Yes" : "No"}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Overall severity
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {severityLabel(security.severity)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium">Detector Results</h3>

              <div className="mt-3 space-y-3">
                {security.results.map((detector, index) => (
                  <div
                    key={`${detector.type ?? "detector"}-${index}`}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">
                          {formatDetectorName(detector.type)}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {detector.detected
                            ? "Security threat detected"
                            : "No threat detected"}
                        </p>
                      </div>

                      <span className="rounded-full border px-3 py-1 text-sm font-medium">
                        {severityLabel(detector.severity)}
                      </span>
                    </div>

                    {detector.categories &&
                      detector.categories.length > 0 && (
                        <div className="mt-3 border-t pt-3">
                          <p className="text-sm text-muted-foreground">
                            Categories
                          </p>

                          <p className="mt-1 text-sm">
                            {detector.categories.join(", ")}
                          </p>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
