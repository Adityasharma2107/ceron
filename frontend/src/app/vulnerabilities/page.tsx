"use client";

import { FormEvent, useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AssetRecord,
  createVulnerability,
  getAssets,
  getVulnerabilities,
  updateVulnerabilityStatus,
  VulnerabilityRecord,
  VulnerabilitySeverity,
  VulnerabilityStatus,
} from "@/lib/api";

const statuses: Array<"all" | VulnerabilityStatus> = [
  "all",
  "open",
  "accepted_risk",
  "remediated",
];

function formatLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function severityClassName(severity: VulnerabilitySeverity) {
  if (severity === "critical") {
    return "border-destructive/50 bg-destructive/10 text-destructive";
  }

  if (severity === "high") {
    return "border-orange-500/50 bg-orange-500/10 text-orange-500";
  }

  if (severity === "medium") {
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

export default function VulnerabilitiesPage() {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<
    VulnerabilityRecord[]
  >([]);
  const [assetId, setAssetId] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<VulnerabilitySeverity>("medium");
  const [statusFilter, setStatusFilter] = useState<
    "all" | VulnerabilityStatus
  >("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVulnerabilityData() {
      try {
        const [loadedAssets, loadedVulnerabilities] = await Promise.all([
          getAssets(),
          getVulnerabilities(),
        ]);
        setAssets(loadedAssets);
        setVulnerabilities(loadedVulnerabilities);
      } catch {
        setError("Unable to load vulnerability data and tracked assets.");
      } finally {
        setLoading(false);
      }
    }

    void loadVulnerabilityData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!assetId) {
      setError("Select an affected asset before recording a finding.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const vulnerability = await createVulnerability({
        assetId: Number(assetId),
        identifier,
        title,
        description,
        severity,
      });
      setVulnerabilities((currentVulnerabilities) => [
        vulnerability,
        ...currentVulnerabilities,
      ]);
      setIdentifier("");
      setTitle("");
      setDescription("");
      setSeverity("medium");
    } catch {
      setError("Unable to record the vulnerability finding.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(
    vulnerabilityId: number,
    status: VulnerabilityStatus,
  ) {
    setUpdatingId(vulnerabilityId);
    setError(null);

    try {
      const vulnerability = await updateVulnerabilityStatus(
        vulnerabilityId,
        status,
      );
      setVulnerabilities((currentVulnerabilities) =>
        currentVulnerabilities.map((currentVulnerability) =>
          currentVulnerability.id === vulnerability.id
            ? vulnerability
            : currentVulnerability,
        ),
      );
    } catch {
      setError("Unable to update the vulnerability status.");
    } finally {
      setUpdatingId(null);
    }
  }

  const visibleVulnerabilities = vulnerabilities.filter(
    (vulnerability) =>
      statusFilter === "all" || vulnerability.status === statusFilter,
  );
  const openCount = vulnerabilities.filter(
    (vulnerability) => vulnerability.status === "open",
  ).length;
  const criticalCount = vulnerabilities.filter(
    (vulnerability) => vulnerability.severity === "critical",
  ).length;

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title="Vulnerabilities"
          description="Record, prioritize, and track manual or imported security findings against your assets."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Card glow="danger">
            <CardHeader>
              <CardDescription>Open findings</CardDescription>
              <CardTitle className="ceron-technical text-3xl text-destructive">
                {openCount}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Critical findings</CardDescription>
              <CardTitle className="ceron-technical text-3xl text-destructive">
                {criticalCount}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card glow="blue">
            <CardHeader>
              <CardDescription>Recorded findings</CardDescription>
              <CardTitle className="ceron-technical text-3xl">
                {vulnerabilities.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="mt-8" glow="cyan">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Record a finding</CardTitle>
            <CardDescription>
              Add verified manual or imported findings now. Automated scanner ingestion will be introduced separately.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form
              onSubmit={handleSubmit}
              className="grid gap-5 sm:grid-cols-2"
            >
              <label className="space-y-2">
                <span className="text-sm font-medium">Affected asset</span>
                <select
                  value={assetId}
                  onChange={(event) => setAssetId(event.target.value)}
                  disabled={loading || submitting || assets.length === 0}
                  className="w-full rounded-lg border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Select an asset</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} — {asset.target}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">Severity</span>
                <select
                  value={severity}
                  onChange={(event) =>
                    setSeverity(event.target.value as VulnerabilitySeverity)
                  }
                  disabled={loading || submitting}
                  className="w-full rounded-lg border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">Identifier</span>
                <input
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="CVE-2026-12345 or internal ID"
                  required
                  disabled={loading || submitting}
                  className="w-full rounded-lg border border-input bg-background/60 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">Title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Describe the vulnerability"
                  required
                  disabled={loading || submitting}
                  className="w-full rounded-lg border border-input bg-background/60 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium">Evidence and context</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add the affected version, observed evidence, or relevant context."
                  rows={3}
                  disabled={loading || submitting}
                  className="w-full resize-none rounded-lg border border-input bg-background/60 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </label>

              {assets.length === 0 && !loading && (
                <p className="sm:col-span-2 text-sm text-muted-foreground">
                  Add an asset before recording a vulnerability.
                </p>
              )}

              {error && (
                <p className="sm:col-span-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  disabled={loading || submitting || assets.length === 0}
                >
                  {submitting ? "Recording..." : "Record vulnerability"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader className="border-b border-border/60">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Finding inventory</CardTitle>
                <CardDescription>
                  Update lifecycle status as a finding is accepted or remediated.
                </CardDescription>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Status</span>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as "all" | VulnerabilityStatus,
                    )
                  }
                  className="rounded-lg border border-input bg-background/60 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {loading && (
              <p className="text-sm text-muted-foreground">
                Loading vulnerability findings...
              </p>
            )}

            {!loading && visibleVulnerabilities.length === 0 && !error && (
              <p className="text-sm text-muted-foreground">
                No vulnerability findings match this view.
              </p>
            )}

            {!loading && visibleVulnerabilities.length > 0 && (
              <div className="space-y-4">
                {visibleVulnerabilities.map((vulnerability) => (
                  <article
                    key={vulnerability.id}
                    className="rounded-xl border border-border/70 bg-background/40 p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="ceron-technical text-xs text-muted-foreground">
                            {vulnerability.identifier}
                          </span>
                          <span
                            className={`ceron-technical rounded-full border px-2.5 py-1 text-xs font-medium ${severityClassName(vulnerability.severity)}`}
                          >
                            {formatLabel(vulnerability.severity)}
                          </span>
                        </div>

                        <h3 className="mt-3 font-semibold">{vulnerability.title}</h3>
                        <p className="ceron-technical mt-1 text-xs text-muted-foreground">
                          {vulnerability.asset_name} — {vulnerability.asset_target}
                        </p>

                        {vulnerability.description && (
                          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                            {vulnerability.description}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
                        <span className="ceron-technical text-xs text-muted-foreground">
                          Updated {formatDate(vulnerability.updated_at)}
                        </span>
                        <select
                          value={vulnerability.status}
                          onChange={(event) =>
                            void handleStatusChange(
                              vulnerability.id,
                              event.target.value as VulnerabilityStatus,
                            )
                          }
                          disabled={updatingId === vulnerability.id}
                          className="ceron-technical rounded-lg border border-input bg-background/60 px-3 py-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <option value="open">Open</option>
                          <option value="accepted_risk">Accepted risk</option>
                          <option value="remediated">Remediated</option>
                        </select>
                      </div>
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
