import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { CeronAtmosphere } from "@/components/visuals/ceron-atmosphere";
import { BlackHoleVisual } from "@/components/visuals/black-hole-visual";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="relative isolate min-h-[calc(100dvh-3.5rem)] overflow-hidden">
        <CeronAtmosphere />

        <PageContainer>
          <PageHeader
            title="Dashboard"
            description="Your Ceron security overview and current platform status."
          />

          <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/50 p-6 backdrop-blur-xl sm:p-8">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.8fr]">
              <div className="max-w-xl">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                  Security Intelligence
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Understand your security surface.
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                  Ceron brings asset visibility, security analysis,
                  risk intelligence, and remediation into one
                  operational workspace.
                </p>
              </div>

              <div className="flex justify-center lg:justify-end">
                <BlackHoleVisual />
              </div>
            </div>
          </section>
        </PageContainer>
      </div>
    </AppShell>
  );
}