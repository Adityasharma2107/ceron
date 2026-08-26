import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <AppShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Temporary content used to verify the application shell */}
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-muted-foreground">
            SECURITY INTELLIGENCE
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome to Ceron
          </h1>

          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Your security intelligence platform for analysis, risk
            assessment, AI-powered insights, and remediation.
          </p>

          <div className="mt-6">
            <Button>
              Get Started
            </Button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}