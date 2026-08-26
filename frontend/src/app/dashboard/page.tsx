import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default function DashboardPage() {
  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title="Dashboard"
          description="Your Ceron security overview and current platform status."
        />

        {/* Dashboard content will be implemented in the dashboard phase. */}
        <p className="text-muted-foreground">
          Security overview will appear here.
        </p>
      </PageContainer>
    </AppShell>
  );
}