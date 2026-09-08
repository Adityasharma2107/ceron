
import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

// Shared content container for consistent page spacing.
export function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <section
      className={`mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 ${className}`}
    >
      {children}
    </section>
  );
}