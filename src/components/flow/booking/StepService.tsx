import { Home, Sparkles, Building, Repeat, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CleaningType } from "@/hooks/useBooking";

export interface ServiceOption {
  id: CleaningType | "recurring" | "special";
  cleaningType: CleaningType;
  name: string;
  description: string;
  bestFor: string;
  estimate: string;
  icon: typeof Home;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: "basic",
    cleaningType: "basic",
    name: "Standard Cleaning",
    description: "Regular maintenance for a tidy, fresh home.",
    bestFor: "Best for weekly or bi-weekly upkeep",
    estimate: "From $35/hr · ~2–4 hrs",
    icon: Home,
  },
  {
    id: "deep",
    cleaningType: "deep",
    name: "Deep Cleaning",
    description: "Thorough top-to-bottom clean — baseboards, grout, hidden spots.",
    bestFor: "Best for first-time bookings or seasonal resets",
    estimate: "From $55/hr · ~3–6 hrs",
    icon: Sparkles,
  },
  {
    id: "move_out",
    cleaningType: "move_out",
    name: "Move-In / Move-Out",
    description: "Complete end-of-lease deep clean — every surface, inside cabinets and appliances.",
    bestFor: "Best for moving days and turnovers",
    estimate: "From $75/hr · ~4–8 hrs",
    icon: Building,
  },
];

interface StepServiceProps {
  value: CleaningType | null;
  onChange: (type: CleaningType) => void;
}

export function StepService({ value, onChange }: StepServiceProps) {
  return (
    <div className="space-y-3">
      {SERVICE_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const selected = value === opt.cleaningType;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.cleaningType)}
            className={cn(
              "w-full text-left rounded-2xl border p-5 transition-all",
              "flex items-start gap-4",
              selected
                ? "border-aero-cyan bg-aero-bg shadow-aero ring-2 ring-aero-cyan/20"
                : "border-aero bg-aero-card hover:border-aero-cyan/40 hover:shadow-sm"
            )}
          >
            <div
              className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                selected ? "bg-gradient-aero text-white" : "bg-aero-bg text-aero-trust"
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-poppins font-semibold text-base text-foreground">
                {opt.name}
              </h3>
              <p className="text-sm text-aero-soft mt-0.5 leading-relaxed">
                {opt.description}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="text-aero-trust font-medium">{opt.estimate}</span>
                <span className="text-aero-soft">·</span>
                <span className="text-aero-soft">{opt.bestFor}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
