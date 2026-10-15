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
import { getRiskSummary, RiskSummary } from "@/lib/api";

const severities = ["high", "medium", "low", "none"];

function formatSeverity(severity: string) {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function severityClassName(severity: string) {
  if (severity === "high") {
    return "text-destructive";
  }

  if (severity === "medium") {
    return "text-amber-500";
  }

  if (severity === "low") {
    return "text-cyan-500";
  }

  return "text-emerald-500";
}

export default function RiskPage() {
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRiskSummary() {
      try {
        setSummary(await getRiskSummary());
      } catch {
        setError("Unable to load the current risk posture.");
      } finally {
        setLoading(false);
      }
    }

    void loadRiskSummary();
  }, []);

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title="Risk"
          description="Understand the current posture derived from Ceron's recorded security analyses."
        />

        {loading && (
          <p className="text-sm text-muted-foreground">
            Calculating current risk posture...
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {summary && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card glow="blue">
                <CardHeader>
                  <CardDescription>Current posture</CardDescription>
                  <CardTitle
                    className={`ceron-technical text-3xl ${severityClassName(summary.overall_severity)}`}
                  >
                    {formatSeverity(summary.overall_severity)}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Assets tracked</CardDescription>
                  <CardTitle className="ceron-technical text-3xl">
                    {summary.total_assets}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Analyses recorded</CardDescription>
                  <CardTitle className="ceron-technical text-3xl">
                    {summary.total_analyses}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card glow="danger">
                <CardHeader>
                  <CardDescription>Threats detected</CardDescription>
                  <CardTitle className="ceron-technical text-3xl text-destructive">
                    {summary.detected_analyses}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card className="mt-8" glow="cyan">
              <CardHeader className="border-b border-border/60">
                <CardTitle>Analysis severity distribution</CardTitle>
                <CardDescription>
                  This posture is calculated from persisted AI analysis results. Asset vulnerability scanning is not included yet.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {severities.map((severity) => (
                    <div
                      key={severity}
                      className="rounded-xl border border-border/70 bg-background/40 p-4"
                    >
                      <p className="text-sm text-muted-foreground">
                        {formatSeverity(severity)}
                      </p>
                      <p
                        className={`ceron-technical mt-2 text-3xl font-semibold ${severityClassName(severity)}`}
                      >
                        {summary.severity_counts[severity] ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
