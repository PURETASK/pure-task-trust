import { ReactNode } from "react";

interface CleanerLayoutProps {
  children: ReactNode;
}

/**
 * CleanerLayout is a lightweight content wrapper used inside cleaner pages.
 * The global header/sidebar/footer is provided by MainLayout (App.tsx).
 * This component just applies consistent container padding for cleaner pages.
 */
export function CleanerLayout({ children }: CleanerLayoutProps) {
  return (
    <div className="container px-3 sm:px-4 lg:px-6 py-3 sm:py-6 max-w-5xl">
      {children}
    </div>
  );
}
