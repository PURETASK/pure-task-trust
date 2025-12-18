import { ReactNode } from "react";
import { CleanerHeader } from "./CleanerHeader";

interface CleanerLayoutProps {
  children: ReactNode;
}

export function CleanerLayout({ children }: CleanerLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <CleanerHeader />
      <main className="container py-6">{children}</main>
    </div>
  );
}
