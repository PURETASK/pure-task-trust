import { Star, Heart, Shield, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  initial?: string;
  rating?: number | null;
  hourlyRate?: number;
  jobsCompleted?: number;
  reliabilityScore?: number;
  tier?: string;
  isFavorite?: boolean;
  subtitle?: string; // for "Last booked: ..."
  selected: boolean;
  onSelect: () => void;
  paletteVar?: string;
}

export function BookingCleanerCard({
  name, initial, rating, hourlyRate, jobsCompleted, reliabilityScore, tier,
  isFavorite, subtitle, selected, onSelect, paletteVar = "pt-amber",
}: Props) {
  const letter = (initial || name || "?").charAt(0).toUpperCase();
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-2xl border-2 p-4 flex items-center gap-4 transition-all bg-background",
        selected ? "scale-[1.005] shadow-lg" : "hover:shadow-md"
      )}
      style={{
        borderColor: `hsl(var(--${paletteVar}-deep))`,
        backgroundColor: selected ? `hsl(var(--${paletteVar})/0.10)` : undefined,
      }}
    >
      <div
        className="h-12 w-12 rounded-full flex items-center justify-center font-black text-base flex-shrink-0"
        style={{
          backgroundColor: `hsl(var(--${paletteVar})/0.18)`,
          color: `hsl(var(--${paletteVar}-deep))`,
        }}
      >
        {letter}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm truncate">{name}</p>
          {isFavorite && <Heart className="h-3 w-3 text-destructive fill-destructive flex-shrink-0" />}
          {tier && tier !== "standard" && (
            <Badge
              variant="outline"
              className="text-[10px] h-4 capitalize border-2"
              style={{ borderColor: `hsl(var(--${paletteVar}-deep))`, color: `hsl(var(--${paletteVar}-deep))` }}
            >
              {tier}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap mt-0.5">
          {rating != null && (
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 text-warning fill-warning" />
              {rating.toFixed(1)}
            </span>
          )}
          {hourlyRate != null && <span className="font-semibold">${hourlyRate}/hr</span>}
          {jobsCompleted != null && <span>{jobsCompleted} jobs</span>}
          {reliabilityScore != null && (
            <span className="flex items-center gap-0.5">
              <Shield className="h-3 w-3" />
              {reliabilityScore}%
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
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
