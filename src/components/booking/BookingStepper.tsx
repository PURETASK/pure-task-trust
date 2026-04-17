import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepDef {
  label: string;
  palette: "blue" | "green" | "amber" | "purple";
}

interface Props {
  steps: StepDef[];
  current: number; // 1-indexed
  onStepClick?: (step: number) => void;
}

const PALETTE_MAP = {
  blue: { step: "palette-step palette-step-blue", line: "palette-line-blue", label: "palette-label-blue" },
  green: { step: "palette-step palette-step-green", line: "palette-line-green", label: "palette-label-green" },
  amber: { step: "palette-step palette-step-amber", line: "palette-line-amber", label: "palette-label-amber" },
  purple: { step: "palette-step palette-step-purple", line: "palette-line-purple", label: "palette-label-purple" },
};

export function BookingStepper({ steps, current, onStepClick }: Props) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => {
        const n = i + 1;
        const p = PALETTE_MAP[s.palette];
        const reached = n <= current;
        const active = n === current;
        const completed = n < current;
        const clickable = onStepClick && n < current;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => clickable && onStepClick?.(n)}
                disabled={!clickable}
                className={cn(
                  "h-9 w-9 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all",
                  reached ? p.step : "border-border bg-muted text-muted-foreground",
                  active && "ring-4 ring-ring/10 scale-110",
                  clickable && "cursor-pointer hover:scale-105"
                )}
              >
                {completed ? <Check className="h-4 w-4" /> : n}
              </button>
              <span className={cn(
                "text-[10px] sm:text-xs font-bold hidden sm:block whitespace-nowrap",
                reached ? p.label : "text-muted-foreground"
              )}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "h-1 flex-1 mx-2 rounded-full transition-all",
                completed ? p.line : "bg-border"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
