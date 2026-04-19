import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FlowCardProps {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Adds a subtle aero glow ring (use for emphasis screens like Welcome). */
  glow?: boolean;
}

/**
 * The central white Aero card every onboarding/booking step lives in.
 */
export function FlowCard({ title, description, children, className, glow }: FlowCardProps) {
  return (
    <section
      className={cn(
        "bg-aero-card border border-aero rounded-3xl shadow-aero",
        "p-6 sm:p-8 md:p-10",
        glow && "ring-aero-glow",
        className
      )}
    >
      {(title || description) && (
        <header className="mb-6 sm:mb-8 space-y-2">
          {title && (
            <h1 className="font-poppins text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-sm sm:text-base text-aero-soft leading-relaxed">{description}</p>
          )}
        </header>
      )}
      <div className="space-y-5 sm:space-y-6">{children}</div>
    </section>
  );
}
