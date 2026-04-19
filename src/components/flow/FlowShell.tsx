import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import puretaskMark from "@/assets/brand/puretask-mark.png";

interface FlowShellProps {
  children: ReactNode;
  /** Optional sticky right summary panel (desktop). On mobile renders below content. */
  summary?: ReactNode;
  className?: string;
}

/**
 * Aero Glow page shell for all onboarding & booking steps.
 * Soft ice-blue background with radial glow, centered single-card layout,
 * optional sticky summary on desktop.
 */
export function FlowShell({ children, summary, className }: FlowShellProps) {
  return (
    <div className={cn("min-h-[100dvh] bg-aero pb-24 md:pb-16", className)}>
      <header className="pt-safe pt-6 pb-2 flex items-center justify-center">
        <a href="/" className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
          <img
            src={puretaskMark}
            alt="PureTask"
            className="h-9 w-9 drop-shadow-[0_2px_8px_hsl(var(--aero-cyan)/0.45)]"
          />
          <span className="font-poppins font-semibold tracking-tight text-aero-trust">
            PureTask
          </span>
        </a>
      </header>

      <main className="container max-w-6xl px-4 sm:px-6">
        {summary ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
            <div className="min-w-0">{children}</div>
            <aside className="lg:sticky lg:top-6 lg:self-start">{summary}</aside>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">{children}</div>
        )}
      </main>
    </div>
  );
}
