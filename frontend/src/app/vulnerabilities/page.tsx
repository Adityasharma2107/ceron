import { AppShell } from "@/components/layout/app-shell";

export default function VulnerabilitiesPage() {
  return (
    <AppShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Vulnerabilities
        </h1>
        <p className="mt-2 text-muted-foreground">
          Vulnerability intelligence will appear here.
        </p>
      </section>
    </AppShell>
  );
}