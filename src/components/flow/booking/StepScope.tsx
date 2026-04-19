import { FlowField } from "@/components/flow/FlowField";
import { FlowChip } from "@/components/flow/FlowChip";
import { Clock, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export const ADD_ONS = [
  { id: "fridge", name: "Inside Fridge", credits: 15, icon: "🧊" },
  { id: "oven", name: "Inside Oven", credits: 20, icon: "🔥" },
  { id: "windows", name: "Interior Windows", credits: 25, icon: "🪟" },
  { id: "laundry", name: "Laundry (wash & fold)", credits: 20, icon: "👕" },
  { id: "dishes", name: "Dishes", credits: 10, icon: "🍽️" },
  { id: "pet_hair", name: "Pet Hair Treatment", credits: 15, icon: "🐾" },
  { id: "baseboards", name: "Baseboards", credits: 15, icon: "📏" },
  { id: "organizing", name: "Organizing add-on", credits: 25, icon: "🗂️" },
];

interface StepScopeProps {
  hours: number;
  onHoursChange: (h: number) => void;
  selectedAddOns: string[];
  onToggleAddOn: (id: string) => void;
}

export function StepScope({ hours, onHoursChange, selectedAddOns, onToggleAddOn }: StepScopeProps) {
  return (
    <div className="space-y-6">
      <FlowField label="How many hours?" helper="You only pay for time actually worked. Unused credits are returned.">
        <div className="rounded-2xl border border-aero bg-aero-card p-5">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onHoursChange(Math.max(1, hours - 1))}
              disabled={hours <= 1}
              className="h-12 w-12 rounded-full border border-aero bg-aero-bg flex items-center justify-center hover:border-aero-cyan disabled:opacity-40 transition-colors"
              aria-label="Decrease hours"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-aero-trust" />
              <span className="font-poppins text-3xl font-semibold tabular-nums text-foreground">
                {hours}
              </span>
              <span className="text-aero-soft text-sm">hrs</span>
            </div>
            <button
              type="button"
              onClick={() => onHoursChange(Math.min(12, hours + 1))}
              disabled={hours >= 12}
              className="h-12 w-12 rounded-full border border-aero bg-aero-bg flex items-center justify-center hover:border-aero-cyan disabled:opacity-40 transition-colors"
              aria-label="Increase hours"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {[2, 3, 4, 5, 6].map((h) => (
              <FlowChip key={h} selected={hours === h} onClick={() => onHoursChange(h)}>
                {h}h
              </FlowChip>
            ))}
          </div>
        </div>
      </FlowField>

      <FlowField label="Add-ons" helper="Tap to include extras. Each adds to the estimate." optional>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ADD_ONS.map((a) => {
            const selected = selectedAddOns.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onToggleAddOn(a.id)}
                className={cn(
                  "rounded-2xl border p-3 flex items-center gap-3 transition-all text-left",
                  selected
                    ? "border-aero-cyan bg-aero-bg shadow-sm"
                    : "border-aero bg-aero-card hover:border-aero-cyan/40"
                )}
              >
                <span className="text-2xl flex-shrink-0">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                  <p className="text-xs text-aero-soft">+${a.credits}</p>
                </div>
                <div
                  className={cn(
                    "h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                    selected ? "bg-aero-trust border-aero-trust" : "border-aero"
                  )}
                >
                  {selected && <span className="text-white text-xs leading-none">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </FlowField>
    </div>
  );
}
