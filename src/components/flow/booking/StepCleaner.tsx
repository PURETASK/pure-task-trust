import { Star, Shield, Award, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { CleanerListing } from "@/hooks/useCleaners";

interface StepCleanerProps {
  cleaners: CleanerListing[] | undefined;
  isLoading: boolean;
  selectedCleanerId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Show top 3–5 matched cleaners — concierge-style picker.
 * Always requires a selection (no auto-match — gating decision).
 */
export function StepCleaner({ cleaners, isLoading, selectedCleanerId, onSelect }: StepCleanerProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    );
  }

  // Rank top 3-5 by reliability + rating
  const top = (cleaners || [])
    .filter((c) => c.isAvailable)
    .sort((a, b) => {
      const aScore = (a.reliabilityScore || 0) + (a.avgRating || 0) * 20;
      const bScore = (b.reliabilityScore || 0) + (b.avgRating || 0) * 20;
      return bScore - aScore;
    })
    .slice(0, 5);

  if (!top.length) {
    return (
      <div className="rounded-2xl border border-dashed border-aero p-8 text-center">
        <p className="text-sm font-medium text-foreground">No cleaners available right now</p>
        <p className="text-xs text-aero-soft mt-1">Try a different date or time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-aero-soft">
        Hand-picked from {cleaners?.length || 0} pros — ranked by reliability and reviews.
      </p>
      {top.map((c, idx) => {
        const selected = selectedCleanerId === c.id;
        const initials = c.name
          .split(" ")
          .map((n) => n[0])
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase();
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={cn(
              "w-full text-left rounded-2xl border p-4 transition-all flex items-start gap-4",
              selected
                ? "border-aero-cyan bg-aero-bg shadow-aero ring-2 ring-aero-cyan/20"
                : "border-aero bg-aero-card hover:border-aero-cyan/40 hover:shadow-sm"
            )}
          >
            <div className="relative flex-shrink-0">
              {c.profilePhotoUrl ? (
                <img
                  src={c.profilePhotoUrl}
                  alt={c.name}
                  className="h-14 w-14 rounded-full object-cover border-2 border-aero-card shadow-sm"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-gradient-aero text-white font-poppins font-semibold flex items-center justify-center text-base shadow-sm">
                  {initials || "PT"}
                </div>
              )}
              {idx === 0 && (
                <span className="absolute -top-1 -right-1 bg-aero-trust text-aero-trust-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow-sm">
                  Top
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-poppins font-semibold text-foreground">{c.name}</h3>
                {c.tier === "platinum" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-aero text-white">
                    <Award className="h-2.5 w-2.5" /> Platinum
                  </span>
                )}
                {c.reliabilityScore >= 90 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-aero-trust">
                    <Shield className="h-2.5 w-2.5" /> Trusted
                  </span>
                )}
              </div>
              {c.professionalHeadline && (
                <p className="text-xs text-aero-soft mt-0.5 line-clamp-1">{c.professionalHeadline}</p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs text-aero-soft flex-wrap">
                {c.avgRating != null && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-aero-cyan text-aero-cyan" />
                    <span className="font-medium text-foreground">{c.avgRating.toFixed(1)}</span>
                    <span>({c.jobsCompleted} jobs)</span>
                  </span>
                )}
                <span className="font-medium text-foreground">${c.hourlyRate}/hr</span>
              </div>
            </div>

            {selected && (
              <CheckCircle2 className="h-5 w-5 text-aero-trust flex-shrink-0 mt-1" />
            )}
          </button>
        );
      })}
    </div>
  );
}
