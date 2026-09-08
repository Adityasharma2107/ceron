"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  FileText,
  Gauge,
  LayoutDashboard,
  Menu,
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
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex md:flex-col",
        collapsed ? "w-[68px]" : "w-60",
      )}
    >
      {/* Ceron branding */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center",
          collapsed ? "justify-center" : "px-4",
        )}
      >
        <div className="flex items-center gap-3">
          {/* Ceron logo placeholder */}
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary font-bold text-sidebar-primary-foreground shadow-sm">
            C
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold tracking-tight">
                Ceron
              </p>

              <p className="truncate text-xs text-muted-foreground">
                Security Intelligence
              </p>
            </div>
          )}
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex h-10 w-full items-center rounded-lg px-3 text-sm font-medium transition-colors duration-200",
                  "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive &&
                    "bg-sidebar-primary/10 text-sidebar-primary hover:bg-sidebar-primary/10 hover:text-sidebar-primary",
                  collapsed && "justify-center px-0",
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className="size-4 shrink-0"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

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

      <Separator className="bg-sidebar-border" />

      {/* Sidebar collapse control */}
      <div className="p-3">
        <Button
          variant="outline"
          className={cn(
            "w-full border-sidebar-border bg-sidebar/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "px-0",
          )}
          onClick={onToggle}
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          <Menu
            className="size-4"
            strokeWidth={1.8}
            aria-hidden="true"
          />

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