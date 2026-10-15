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
  createScan,
  getAssets,
  getScans,
  ScanPlan,
} from "@/lib/api";

function formatProfile(profile: ScanPlan["profile"]) {
  return profile.charAt(0).toUpperCase() + profile.slice(1);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ScansPage() {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [scans, setScans] = useState<ScanPlan[]>([]);
  const [assetId, setAssetId] = useState("");
  const [profile, setProfile] = useState<ScanPlan["profile"]>("baseline");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadScanData() {
      try {
        const [loadedAssets, loadedScans] = await Promise.all([
          getAssets(),
          getScans(),
        ]);
        setAssets(loadedAssets);
        setScans(loadedScans);
      } catch {
        setError("Unable to load scan plans and available assets.");
      } finally {
        setLoading(false);
      }
    }

    void loadScanData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!assetId) {
      setError("Select an asset before queuing a scan plan.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const scan = await createScan(Number(assetId), profile);
      setScans((currentScans) => [scan, ...currentScans]);
    } catch {
      setError("Unable to queue the scan plan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title="Scans"
          description="Plan asset scans now; execution will be enabled when the controlled scanner service is introduced."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Card glow="blue">
            <CardHeader>
              <CardDescription>Tracked assets</CardDescription>
              <CardTitle className="ceron-technical text-3xl">
                {assets.length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Queued scan plans</CardDescription>
              <CardTitle className="ceron-technical text-3xl">
                {scans.length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Execution status</CardDescription>
              <CardTitle className="ceron-technical text-3xl text-muted-foreground">
                Planned
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="mt-8" glow="cyan">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Queue a scan plan</CardTitle>
            <CardDescription>
              Scan plans are stored against known assets. They do not execute network scanning in the current release.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form
              onSubmit={handleSubmit}
              className="grid gap-5 sm:grid-cols-2"
            >
              <label className="space-y-2">
                <span className="text-sm font-medium">Asset</span>
                <select
                  value={assetId}
                  onChange={(event) => setAssetId(event.target.value)}
                  disabled={loading || assets.length === 0 || submitting}
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
                <span className="text-sm font-medium">Profile</span>
                <select
                  value={profile}
                  onChange={(event) =>
                    setProfile(event.target.value as ScanPlan["profile"])
                  }
                  disabled={loading || submitting}
                  className="w-full rounded-lg border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="baseline">Baseline</option>
                  <option value="deep">Deep</option>
                </select>
              </label>

              {assets.length === 0 && !loading && (
                <p className="sm:col-span-2 text-sm text-muted-foreground">
                  Add an asset before creating a scan plan.
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
                  disabled={loading || assets.length === 0 || submitting}
                >
                  {submitting ? "Queuing..." : "Queue scan plan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Planned scans</CardTitle>
            <CardDescription>
              Persisted plans remain queued until the scanner service is available.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {loading && (
              <p className="text-sm text-muted-foreground">
                Loading scan plans...
              </p>
            )}

            {!loading && scans.length === 0 && !error && (
              <p className="text-sm text-muted-foreground">
                No scan plans have been queued yet.
              </p>
            )}

            {!loading && scans.length > 0 && (
              <div className="space-y-3">
                {scans.map((scan) => (
                  <article
                    key={scan.id}
                    className="flex flex-col gap-3 rounded-xl border border-border/70 bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{scan.asset_name}</p>
                      <p className="ceron-technical mt-1 truncate text-xs text-muted-foreground">
                        {scan.asset_target}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span className="ceron-technical rounded-md border border-border/70 px-2.5 py-1 text-xs text-muted-foreground">
                        {formatProfile(scan.profile)}
                      </span>
                      <span className="ceron-technical rounded-md border border-cyan-500/50 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-500">
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
      </PageContainer>
    </AppShell>
  );
}
