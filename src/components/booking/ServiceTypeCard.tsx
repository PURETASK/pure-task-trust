import { LucideIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  name: string;
  description: string;
  estimate: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
  paletteVar?: string;
}

export function ServiceTypeCard({ name, description, estimate, icon: Icon, selected, onSelect, paletteVar = "pt-blue" }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-2xl border-2 p-4 sm:p-5 flex items-center gap-4 transition-all bg-background",
        selected ? "scale-[1.01] shadow-lg" : "hover:shadow-md"
      )}
      style={{
        borderColor: `hsl(var(--${paletteVar}-deep))`,
        backgroundColor: selected ? `hsl(var(--${paletteVar})/0.10)` : undefined,
      }}
    >
      <div
        className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: `hsl(var(--${paletteVar})/0.15)`,
          color: `hsl(var(--${paletteVar}-deep))`,
        }}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-base">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="text-right flex-shrink-0 hidden sm:block">
        <p className="font-poppins font-bold text-sm" style={{ color: `hsl(var(--${paletteVar}-deep))` }}>{estimate}</p>
        <p className="text-[10px] text-muted-foreground">est. range</p>
      </div>
      <div
        className="h-7 w-7 rounded-full border-2 flex items-center justify-center flex-shrink-0"
        style={{
          borderColor: `hsl(var(--${paletteVar}-deep))`,
          backgroundColor: selected ? `hsl(var(--${paletteVar}-deep))` : "transparent",
          color: selected ? "#fff" : "transparent",
        }}
      >
        {selected && <Check className="h-4 w-4" />}
      </div>
    </button>
  );
}
