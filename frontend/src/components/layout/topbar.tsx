"use client";

import {
  Bell,
  Menu,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TopbarProps {
  onMobileMenu: () => void;
  onSidebarToggle: () => void;
  sidebarCollapsed: boolean;
}

export function Topbar({
  onMobileMenu,
  onSidebarToggle,
  sidebarCollapsed,
}: TopbarProps) {
  return (
    <header className="flex h-16 w-full min-w-0 items-center border-b bg-background">
      <div className="flex min-w-0 flex-1 items-center gap-2 px-4">
        {/* Mobile navigation trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMobileMenu}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </Button>

        {/* Desktop sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          onClick={onSidebarToggle}
          aria-label={
            sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          <Menu className="size-5" />
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6" />

        {/* Search */}
        <div className="flex min-w-0 max-w-md flex-1 items-center">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-muted-foreground"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">Search Ceron...</span>
          </Button>
        </div>
      </div>

      {/* Important actions only */}
      <div className="flex shrink-0 items-center gap-1 px-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </Button>

        {/* Temporary profile control */}
        <Button
          variant="outline"
          size="sm"
          className="ml-2 hidden sm:inline-flex"
        >
          Profile
        </Button>
      </div>
    </header>
  );
}