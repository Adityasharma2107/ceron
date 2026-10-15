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
  getRemediationRecommendations,
  RemediationRecommendation,
} from "@/lib/api";

function formatPriority(priority: string) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function priorityClassName(priority: string) {
  if (priority === "high") {
    return "border-destructive/50 bg-destructive/10 text-destructive";
  }

  if (priority === "medium") {
    return "border-amber-500/50 bg-amber-500/10 text-amber-500";
  }

  return "border-cyan-500/50 bg-cyan-500/10 text-cyan-500";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function RemediationPage() {
  const [recommendations, setRecommendations] = useState<
    RemediationRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setRecommendations(await getRemediationRecommendations());
      } catch {
        setError("Unable to load remediation recommendations.");
      } finally {
        setLoading(false);
      }
    }

    void loadRecommendations();
  }, []);

  const highPriorityCount = recommendations.filter(
    (recommendation) => recommendation.priority === "high",
  ).length;

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title="Remediation"
          description="Prioritize concrete safeguards from Ceron's recorded security findings."
        />

        {loading && (
          <p className="text-sm text-muted-foreground">
            Building remediation recommendations...
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {!loading && !error && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card glow="blue">
                <CardHeader>
                  <CardDescription>Open recommendation types</CardDescription>
                  <CardTitle className="ceron-technical text-3xl">
                    {recommendations.length}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card glow="danger">
                <CardHeader>
                  <CardDescription>High-priority actions</CardDescription>
                  <CardTitle className="ceron-technical text-3xl text-destructive">
                    {highPriorityCount}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card className="mt-8" glow="cyan">
              <CardHeader className="border-b border-border/60">
                <CardTitle>Recommended safeguards</CardTitle>
                <CardDescription>
                  Recommendations are generated from detected prompt-injection and PII findings. Resolution tracking will be added with the future workflow system.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                {recommendations.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No detected findings require remediation at this time.
                  </p>
                )}

                {recommendations.length > 0 && (
                  <div className="space-y-5">
                    {recommendations.map((recommendation) => (
                      <article
                        key={recommendation.id}
                        className="rounded-xl border border-border/70 bg-background/40 p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold">
                                {recommendation.title}
                              </h3>
                              <span
                                className={`ceron-technical rounded-full border px-2.5 py-1 text-xs font-medium ${priorityClassName(recommendation.priority)}`}
                              >
                                {formatPriority(recommendation.priority)}
                              </span>
                            </div>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                              {recommendation.description}
                            </p>
                          </div>

                          <p className="ceron-technical shrink-0 text-xs text-muted-foreground">
                            Last detected {formatDate(recommendation.last_detected_at)}
                          </p>
                        </div>

                        <div className="mt-5 grid gap-5 border-t border-border/60 pt-5 lg:grid-cols-[1fr_auto]">
                          <ol className="space-y-3 text-sm leading-6">
                            {recommendation.actions.map((action, index) => (
                              <li
                                key={action}
                                className="flex gap-3"
                              >
                                <span className="ceron-technical flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                                  {index + 1}
                                </span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ol>

                          <div className="flex flex-wrap content-start gap-2 lg:max-w-52">
                            <span className="ceron-technical rounded-md border border-border/70 px-2.5 py-1 text-xs text-muted-foreground">
                              {recommendation.affected_analyses} affected analyses
                            </span>
                            {recommendation.categories.map((category) => (
                              <span
                                key={category}
                                className="ceron-technical rounded-md border border-border/70 px-2.5 py-1 text-xs text-muted-foreground"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
