"use client";

import Link from "next/link";
import {
  Bot,
  FileText,
  Gauge,
  LayoutDashboard,
  Network,
  ScanSearch,
  Settings,
  ShieldAlert,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// Main navigation for the Ceron security platform.
const navigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Assets",
    icon: Network,
    href: "/assets",
  },
  {
    label: "Scans",
    icon: ScanSearch,
    href: "/scans",
  },
  {
    label: "Vulnerabilities",
    icon: ShieldAlert,
    href: "/vulnerabilities",
  },
  {
    label: "Risk",
    icon: Gauge,
    href: "/risk",
  },
  {
    label: "AI Analysis",
    icon: Bot,
    href: "/ai-analysis",
  },
  {
    label: "Remediation",
    icon: Wrench,
    href: "/remediation",
  },
  {
    label: "Reports",
    icon: FileText,
    href: "/reports",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 border-r bg-background transition-all duration-200 md:flex md:flex-col",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Ceron branding */}
      <div
        className={cn(
          "flex h-16 items-center",
          collapsed ? "justify-center" : "px-4",
        )}
      >
        <div className="flex items-center gap-3">
          {/* Ceron logo placeholder */}
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
            C
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold tracking-tight">Ceron</p>

              <p className="truncate text-xs text-muted-foreground">
                Security Intelligence
              </p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex h-9 w-full items-center rounded-md px-3 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  collapsed && "justify-center px-0",
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="size-4 shrink-0" />

                {!collapsed && (
                  <span className="ml-3 truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <Separator />

      {/* Sidebar collapse control */}
      <div className="p-3">
        <Button
          variant="outline"
          className={cn(
            "w-full",
            collapsed && "px-0",
          )}
          onClick={onToggle}
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          <span aria-hidden="true">
            {collapsed ? "→" : "←"}
          </span>

          {!collapsed && (
            <span className="ml-2">
              Collapse
            </span>
          )}
        </Button>
      </div>
    </aside>
  );
}