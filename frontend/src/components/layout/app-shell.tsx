"use client";

import { useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full min-w-0 overflow-hidden bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />

      <Sheet
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      >
        <SheetContent
          side="left"
          className="w-64 p-0"
        >
          <SheetTitle className="sr-only">
            Ceron navigation
          </SheetTitle>

          <div className="h-full">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          onMobileMenu={() => setMobileMenuOpen(true)}
          onSidebarToggle={() =>
            setSidebarCollapsed((value) => !value)
          }
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="relative min-h-full motion-safe:transition-opacity motion-safe:duration-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}