"use client";

import { useSyncExternalStore } from "react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

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
import { getPlatformStatus, PlatformStatus } from "@/lib/api";

function subscribeToHydration() {
  return () => {};
}

function formatCapability(enabled: boolean) {
  return enabled ? "Enabled" : "Planned";
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const [status, setStatus] = useState<PlatformStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlatformStatus() {
      try {
        setStatus(await getPlatformStatus());
      } catch {
        setError("Unable to load platform readiness status.");
      } finally {
        setLoading(false);
      }
    }

    void loadPlatformStatus();
  }, []);

  const activeTheme = mounted && theme === "light" ? "light" : "dark";

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title="Settings"
          description="Manage your local workspace preferences and review Ceron's current platform readiness."
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <Card glow="blue">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                This preference is stored locally in your browser.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Color theme</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose the workspace contrast that fits your environment.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={activeTheme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    aria-pressed={activeTheme === "dark"}
                  >
                    Dark
                  </Button>
                  <Button
                    type="button"
                    variant={activeTheme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    aria-pressed={activeTheme === "light"}
                  >
                    Light
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glow="cyan">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Runtime readiness</CardTitle>
              <CardDescription>
                Safe status checks confirm service connectivity without exposing configuration values.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {loading && (
                <p className="text-sm text-muted-foreground">
                  Checking platform services...
                </p>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {status && (
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border/70 bg-background/40 p-4">
                    <dt className="text-sm text-muted-foreground">API</dt>
                    <dd className="ceron-technical mt-2 text-sm text-emerald-500">
                      {status.api_status}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background/40 p-4">
                    <dt className="text-sm text-muted-foreground">Database</dt>
                    <dd className="ceron-technical mt-2 text-sm text-emerald-500">
                      {status.database_status}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background/40 p-4">
                    <dt className="text-sm text-muted-foreground">Analysis engine</dt>
                    <dd className="ceron-technical mt-2 text-sm text-primary">
                      {status.analysis_engine}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background/40 p-4">
                    <dt className="text-sm text-muted-foreground">Authentication</dt>
                    <dd className="ceron-technical mt-2 text-sm text-muted-foreground">
                      {formatCapability(status.authentication_enabled)}
                    </dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Capability boundaries</CardTitle>
            <CardDescription>
              Ceron exposes current delivery status clearly so operators can distinguish implemented workflows from planned integrations.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-background/40 p-4">
                <p className="text-sm font-medium">Analysis</p>
                <p className="ceron-technical mt-2 text-xs text-primary">
                  Deterministic detectors enabled
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Prompt-injection and PII detection are available through the current analysis engine.
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/40 p-4">
                <p className="text-sm font-medium">Scanning</p>
                <p className="ceron-technical mt-2 text-xs text-muted-foreground">
                  {status ? formatCapability(status.scan_execution_enabled) : "Checking status"}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Asset-linked scan plans are persisted, but the controlled scanner execution service is not yet enabled.
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/40 p-4">
                <p className="text-sm font-medium">Access control</p>
                <p className="ceron-technical mt-2 text-xs text-muted-foreground">
                  {status ? formatCapability(status.authentication_enabled) : "Checking status"}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Authentication and RBAC remain a planned security milestone; do not expose this local build publicly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </AppShell>
  );
}
