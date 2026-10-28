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
import { CeronAtmosphere } from "@/components/visuals/ceron-atmosphere";
import { BlackHoleVisual } from "@/components/visuals/black-hole-visual";
import { DashboardSummary, getDashboardSummary } from "@/lib/api";

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function severityClassName(severity: string) {
  if (severity === "high" || severity === "critical") {
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        setSummary(await getDashboardSummary());
      } catch {
        setError("Unable to load the current operational overview.");
      } finally {
        setLoading(false);
      }
    }

    void loadSummary();
  }, []);

  return (
    <AppShell>
      <div className="relative isolate min-h-[calc(100dvh-3.5rem)] overflow-hidden">
        <CeronAtmosphere />

        <PageContainer>
          <PageHeader
            title="Dashboard"
            description="Your Ceron security overview and current platform status."
          />

          {loading && (
            <p className="relative text-sm text-muted-foreground">
              Loading operational overview...
            </p>
          )}

          {error && (
            <p className="relative text-sm text-destructive">{error}</p>
          )}

          {summary && (
            <div className="relative space-y-8">
              <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/50 p-6 backdrop-blur-xl sm:p-8">
                <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.8fr]">
                  <div className="max-w-xl">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                      Security Intelligence
                    </p>

                    <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                      Current posture: {" "}
                      <span
                        className={`ceron-technical ${severityClassName(summary.overall_severity)}`}
                      >
                        {formatLabel(summary.overall_severity)}
                      </span>
                    </h2>

                    <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                      Ceron combines recorded asset, analysis, risk, scan-plan, and vulnerability activity into one operational view.
                    </p>
                  </div>

                  <div className="flex justify-center lg:justify-end">
                    <BlackHoleVisual />
                  </div>
                </div>
              </section>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card glow="blue">
                  <CardHeader>
                    <CardDescription>Tracked assets</CardDescription>
                    <CardTitle className="ceron-technical text-3xl">
                      {summary.total_assets}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardDescription>Queued scan plans</CardDescription>
                    <CardTitle className="ceron-technical text-3xl">
                      {summary.queued_scans}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card glow="danger">
                  <CardHeader>
                    <CardDescription>Open vulnerabilities</CardDescription>
                    <CardTitle className="ceron-technical text-3xl text-destructive">
                      {summary.open_vulnerabilities}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardDescription>Detected analyses</CardDescription>
                    <CardTitle className="ceron-technical text-3xl">
                      {summary.detected_analyses}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card glow="danger">
                  <CardHeader className="border-b border-border/60">
                    <CardTitle>Recent open findings</CardTitle>
                    <CardDescription>
                      {summary.critical_vulnerabilities} critical open finding{summary.critical_vulnerabilities === 1 ? "" : "s"} currently recorded.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {summary.recent_vulnerabilities.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No open vulnerability findings are recorded.
                      </p>
                    )}

                    {summary.recent_vulnerabilities.length > 0 && (
                      <div className="space-y-3">
                        {summary.recent_vulnerabilities.map((vulnerability) => (
                          <article
                            key={vulnerability.id}
                            className="rounded-lg border border-border/70 bg-background/40 p-4"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="ceron-technical text-xs text-muted-foreground">
                                {vulnerability.identifier}
                              </span>
                              <span
                                className={`ceron-technical text-xs font-medium ${severityClassName(vulnerability.severity)}`}
                              >
                                {formatLabel(vulnerability.severity)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm font-medium">
                              {vulnerability.title}
                            </p>
                            <p className="ceron-technical mt-1 truncate text-xs text-muted-foreground">
                              {vulnerability.asset_name} — {vulnerability.asset_target}
                            </p>
                          </article>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card glow="cyan">
                  <CardHeader className="border-b border-border/60">
                    <CardTitle>Recent scan plans</CardTitle>
                    <CardDescription>
                      Planned scans remain queued until the controlled scanner service is introduced.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {summary.recent_scans.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No scan plans have been queued yet.
                      </p>
                    )}

                    {summary.recent_scans.length > 0 && (
                      <div className="space-y-3">
                        {summary.recent_scans.map((scan) => (
                          <article
                            key={scan.id}
                            className="flex flex-col gap-3 rounded-lg border border-border/70 bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{scan.asset_name}</p>
                              <p className="ceron-technical mt-1 truncate text-xs text-muted-foreground">
                                {scan.asset_target}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                              <span className="ceron-technical rounded-md border border-border/70 px-2 py-1 text-xs text-muted-foreground">
                                {formatLabel(scan.profile)}
                              </span>
                              <span className="ceron-technical rounded-md border border-cyan-500/50 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-500">
                                {scan.status}
                              </span>
                              <span className="ceron-technical text-xs text-muted-foreground">
                                {formatDate(scan.created_at)}
                              </span>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </PageContainer>
      </div>
    </AppShell>
  );
}
