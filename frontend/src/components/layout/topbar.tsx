"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <header className="flex h-14 w-full shrink-0 items-center border-b border-border/70 bg-background/95 backdrop-blur-xl">
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3 sm:px-4">
        {/* Mobile navigation trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMobileMenu}
          aria-label="Open navigation"
        >
          <Menu
            className="size-5"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </Button>

        {/* Desktop sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          onClick={onSidebarToggle}
          aria-label={
            sidebarCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          <Menu
            className="size-5"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </Button>

        <Separator
          orientation="vertical"
          className="mx-1 h-6"
        />

        {/* Search */}
        <div className="flex min-w-0 max-w-lg flex-1 items-center">
          <Button
            variant="outline"
            className="h-9 w-full justify-start gap-2 rounded-lg border-border/70 bg-background/60 text-muted-foreground shadow-none transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <Search
              className="size-4 shrink-0"
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span className="truncate text-sm">
              Search Ceron...
            </span>
          </Button>
        </div>
      </div>

      {/* Important actions only */}
      <div className="flex shrink-0 items-center gap-1 px-3 sm:px-4">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="transition-colors hover:bg-muted/60"
          onClick={toggleTheme}
          aria-label={
            mounted && theme === "dark"
              ? "Switch to light theme"
              : "Switch to dark theme"
          }
        >
          {mounted && theme === "dark" ? (
            <Sun
              className="size-5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          ) : (
            <Moon
              className="size-5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          )}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="transition-colors hover:bg-muted/60"
          aria-label="Notifications"
        >
          <Bell
            className="size-5"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </Button>

        {/* Temporary profile control */}
        <Button
          variant="outline"
          size="sm"
          className="ml-1 hidden h-8 sm:inline-flex"
        >
          Profile
        </Button>
      </div>
    </header>
  );
}