"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AnalysisHistoryItem,
  getAnalyses,
} from "@/lib/api";

function formatDetectorName(type: string | null) {
  if (!type) {
    return "Security detector";
  }

  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatSeverity(severity: string) {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ReportsPage() {
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalyses() {
      try {
        setAnalyses(await getAnalyses());
      } catch {
        setError("Unable to load security analysis history.");
      } finally {
        setLoading(false);
      }
    }

    void loadAnalyses();
  }, []);

  const detectedCount = analyses.filter((analysis) =>
    analysis.results.some((result) => result.detected),
  ).length;

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title="Reports"
          description="Review persisted security analysis activity and detector findings."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Total analyses</CardDescription>
              <CardTitle className="ceron-technical text-3xl">
                {analyses.length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Threats detected</CardDescription>
              <CardTitle className="ceron-technical text-3xl text-destructive">
                {detectedCount}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Latest severity</CardDescription>
              <CardTitle className="ceron-technical text-3xl">
                {analyses[0] ? formatSeverity(analyses[0].severity) : "—"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="mt-8" glow="blue">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Analysis history</CardTitle>
            <CardDescription>
              The 25 most recent analysis results persisted by Ceron.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {loading && (
              <p className="text-sm text-muted-foreground">
                Loading security analysis history...
              </p>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {!loading && !error && analyses.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No analyses have been recorded yet. Run an AI analysis to begin building a report history.
              </p>
            )}

            {!loading && !error && analyses.length > 0 && (
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <article
                    key={analysis.id}
                    className="rounded-xl border border-border/70 bg-background/40 p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="ceron-technical text-xs text-muted-foreground">
                          ANALYSIS-{analysis.id}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm leading-6">
                          {analysis.text}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span className="ceron-technical text-xs text-muted-foreground">
                          {formatDate(analysis.created_at)}
                        </span>
                        <span className="ceron-technical rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium">
                          {formatSeverity(analysis.severity)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
                      {analysis.results.map((result) => (
                        <span
                          key={`${analysis.id}-${result.type ?? "detector"}`}
                          className="ceron-technical rounded-md border border-border/70 px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {formatDetectorName(result.type)}: {formatSeverity(result.severity)}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </AppShell>
  );
}
