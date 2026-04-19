import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (h: number) => void;
  min?: number;
  max?: number;
  paletteVar?: string; // e.g. "pt-green"
}

export function HoursSelector({ value, onChange, min = 1, max = 8, paletteVar = "pt-green" }: Props) {
  const opts = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {opts.map((h) => {
          const selected = h === value;
          return (
            <button
              key={h}
              type="button"
              onClick={() => onChange(h)}
              className={cn(
                "h-12 rounded-xl border-2 font-poppins font-bold text-sm transition-all",
                selected ? "text-white scale-105" : "bg-background hover:scale-105"
              )}
              style={
                selected
                  ? {
                      backgroundColor: `hsl(var(--${paletteVar}-deep))`,
                      borderColor: "#fff",
                      boxShadow: `0 6px 18px -6px hsl(var(--${paletteVar}-deep)/0.5)`,
                    }
                  : {
                      borderColor: `hsl(var(--${paletteVar}-deep))`,
                      color: `hsl(var(--${paletteVar}-deep))`,
                    }
              }
            >
              {h}h
            </button>
          );
        })}
      </div>
    </div>
  );
}
