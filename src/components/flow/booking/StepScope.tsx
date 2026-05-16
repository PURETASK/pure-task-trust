import { FlowField } from "@/components/flow/FlowField";
import { FlowChip } from "@/components/flow/FlowChip";
import { Clock, Plus, Minus, Home, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { WfInput } from "@/components/wf/WfInput";

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

export type DirtinessLevel = 'touch_up' | 'average' | 'heavy' | 'very_dirty';

export const DIRTINESS_OPTIONS: {
  id: DirtinessLevel;
  label: string;
  description: string;
  icon: string;
}[] = [
  { id: 'touch_up',   label: 'Just a touch-up',  description: 'Already pretty tidy', icon: '✨' },
  { id: 'average',    label: 'Average',          description: 'Normal weekly clean', icon: '🧽' },
  { id: 'heavy',      label: 'Heavy',            description: "Hasn't been cleaned in a while", icon: '🧹' },
  { id: 'very_dirty', label: 'Very dirty',       description: 'Needs serious attention', icon: '🪣' },
];

interface StepScopeProps {
  hours: number;
  onHoursChange: (h: number) => void;
  selectedAddOns: string[];
  onToggleAddOn: (id: string) => void;
  squareFootage: number | null;
  onSquareFootageChange: (n: number | null) => void;
  dirtinessLevel: DirtinessLevel | null;
  onDirtinessChange: (d: DirtinessLevel) => void;
}

export function StepScope({
  hours, onHoursChange, selectedAddOns, onToggleAddOn,
  squareFootage, onSquareFootageChange, dirtinessLevel, onDirtinessChange,
}: StepScopeProps) {
  return (
    <div className="space-y-6">
      <FlowField
        label={<span className="flex items-center gap-2"><Home className="h-4 w-4 text-aero-trust" /> Home size (sq ft) <span className="text-destructive">*</span></span>}
        helper="Helps your cleaner plan time and supplies."
      >
        <WfInput
          type="number"
          inputMode="numeric"
          min={100}
          max={20000}
          step={50}
          placeholder="e.g. 1200"
          value={squareFootage ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            onSquareFootageChange(v === '' ? null : Math.max(0, parseInt(v, 10) || 0));
          }}
          className="text-base h-12"
        />
      </FlowField>

      <FlowField
        label={<span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-aero-trust" /> How dirty is it? <span className="text-destructive">*</span></span>}
        helper="Be honest — this helps us match the right amount of effort."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DIRTINESS_OPTIONS.map((d) => {
            const selected = dirtinessLevel === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onDirtinessChange(d.id)}
                className={cn(
                  "rounded-2xl border p-3 flex items-center gap-3 transition-all text-left",
                  selected
                    ? "border-hairline-soft-cyan bg-aero-bg shadow-sm"
                    : "border-hairline-soft bg-app-surface hover:border-hairline-soft-cyan/40"
                )}
              >
                <span className="text-2xl flex-shrink-0">{d.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{d.label}</p>
                  <p className="text-xs text-ink-muted">{d.description}</p>
                </div>
                <div className={cn(
                  "h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                  selected ? "bg-aero-trust border-hairline-soft-trust" : "border-hairline-soft"
                )}>
                  {selected && <span className="text-white text-xs leading-none">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </FlowField>

      <FlowField label="How many hours?" helper="You only pay for time actually worked. Unused credits are returned.">
        <div className="rounded-2xl border border-hairline-soft bg-app-surface p-5">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onHoursChange(Math.max(1, hours - 1))}
              disabled={hours <= 1}
              className="h-12 w-12 rounded-full border border-hairline-soft bg-aero-bg flex items-center justify-center hover:border-hairline-soft-cyan disabled:opacity-40 transition-colors"
              aria-label="Decrease hours"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-aero-trust" />
              <span className="font-poppins text-3xl font-semibold tabular-nums text-foreground">
                {hours}
              </span>
              <span className="text-ink-muted text-sm">hrs</span>
            </div>
            <button
              type="button"
              onClick={() => onHoursChange(Math.min(12, hours + 1))}
              disabled={hours >= 12}
              className="h-12 w-12 rounded-full border border-hairline-soft bg-aero-bg flex items-center justify-center hover:border-hairline-soft-cyan disabled:opacity-40 transition-colors"
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
                    ? "border-hairline-soft-cyan bg-aero-bg shadow-sm"
                    : "border-hairline-soft bg-app-surface hover:border-hairline-soft-cyan/40"
                )}
              >
                <span className="text-2xl flex-shrink-0">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                  <p className="text-xs text-ink-muted">+${a.credits}</p>
                </div>
                <div
                  className={cn(
                    "h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                    selected ? "bg-aero-trust border-hairline-soft-trust" : "border-hairline-soft"
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
