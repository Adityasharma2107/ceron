import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: "none" | "blue" | "cyan" | "violet" | "danger";
}

function Card({
  className,
  glow = "none",
  ...props
}: CardProps) {
  const glowClasses = {
    none: "",
    blue: "hover:border-primary/40 hover:shadow-[0_0_30px_-12px_var(--primary)]",
    cyan: "hover:border-cyan-400/40 hover:shadow-[0_0_30px_-12px_rgb(34_211_238)]",
    violet:
      "hover:border-violet-400/40 hover:shadow-[0_0_30px_-12px_rgb(167_139_250)]",
    danger:
      "hover:border-destructive/40 hover:shadow-[0_0_30px_-12px_var(--destructive)]",
  };

  return (
    <div
      data-slot="card"
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10",
        "bg-card/80 backdrop-blur-xl",
        "shadow-[0_8px_32px_-20px_rgba(0,0,0,0.8)]",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5",
        glowClasses[glow],
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1.5 p-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "text-base font-semibold tracking-tight text-card-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="card-description"
      className={cn(
        "text-sm leading-relaxed text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-6 pb-6",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};