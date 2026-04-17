import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle?: ReactNode;
  amount: number;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  paletteVar?: string;
  badge?: string;
}

export function PaymentMethodCard({
  icon: Icon, title, subtitle, amount, selected, disabled, onSelect, paletteVar = "pt-green", badge,
}: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "w-full text-left rounded-2xl border-2 p-4 flex items-center gap-4 transition-all bg-background",
        disabled && "opacity-60 cursor-not-allowed",
        selected && !disabled && "scale-[1.005] shadow-lg"
      )}
      style={{
        borderColor: `hsl(var(--${paletteVar}-deep))`,
        backgroundColor: selected ? `hsl(var(--${paletteVar})/0.10)` : undefined,
      }}
    >
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: `hsl(var(--${paletteVar})/0.18)`,
          color: `hsl(var(--${paletteVar}-deep))`,
        }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm">{title}</p>
          {badge && (
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `hsl(var(--${paletteVar})/0.18)`,
                color: `hsl(var(--${paletteVar}-deep))`,
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xl font-black" style={{ color: `hsl(var(--${paletteVar}-deep))` }}>${amount}</p>
      </div>
    </button>
  );
}
