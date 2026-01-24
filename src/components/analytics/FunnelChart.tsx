import { useMemo } from "react";
import { motion } from "framer-motion";

interface FunnelStep {
  name: string;
  count: number;
  conversionRate?: number;
}

interface FunnelChartProps {
  steps: FunnelStep[];
  title?: string;
}

export function FunnelChart({ steps, title }: FunnelChartProps) {
  const maxCount = useMemo(() => Math.max(...steps.map((s) => s.count), 1), [steps]);

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      )}

      <div className="space-y-3">
        {steps.map((step, index) => {
          const widthPercent = (step.count / maxCount) * 100;
          const dropOff =
            index > 0
              ? ((steps[index - 1].count - step.count) / steps[index - 1].count) * 100
              : 0;

          return (
            <div key={step.name} className="space-y-1">
              {/* Step header */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="font-medium text-foreground capitalize">
                    {step.name.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {step.count.toLocaleString()}
                  </span>
                  {index > 0 && dropOff > 0 && (
                    <span className="text-destructive text-xs">
                      -{dropOff.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-8 bg-muted rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-lg"
                />
                {step.conversionRate !== undefined && (
                  <div className="absolute inset-0 flex items-center justify-end pr-3">
                    <span className="text-xs font-medium text-white drop-shadow">
                      {step.conversionRate.toFixed(1)}% conversion
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {steps.length > 1 && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Conversion</span>
            <span className="font-semibold text-foreground">
              {((steps[steps.length - 1].count / steps[0].count) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
