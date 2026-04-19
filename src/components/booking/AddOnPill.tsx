import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  icon: string;
  credits: number;
  selected: boolean;
  onToggle: () => void;
  paletteVar?: string;
}

export function AddOnPill({ name, icon, credits, selected, onToggle, paletteVar = "pt-purple" }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full text-left rounded-2xl border-2 p-3 flex items-center gap-3 transition-all bg-background",
        selected ? "scale-[1.01]" : "hover:shadow-md"
      )}
      style={{
        borderColor: `hsl(var(--${paletteVar}-deep))`,
        backgroundColor: selected ? `hsl(var(--${paletteVar})/0.12)` : undefined,
      }}
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      <span className="flex-1 font-semibold text-sm truncate">{name}</span>
      <span
        className="text-xs font-poppins font-bold px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: `hsl(var(--${paletteVar})/0.15)`,
          color: `hsl(var(--${paletteVar}-deep))`,
        }}
      >
        +${credits}
      </span>
      <div
        className="h-6 w-6 rounded-md border-2 flex items-center justify-center flex-shrink-0"
        style={{
          borderColor: `hsl(var(--${paletteVar}-deep))`,
          backgroundColor: selected ? `hsl(var(--${paletteVar}-deep))` : "transparent",
          color: selected ? "#fff" : "transparent",
        }}
      >
        {selected && <Check className="h-3.5 w-3.5" />}
      </div>
    </button>
  );
}
