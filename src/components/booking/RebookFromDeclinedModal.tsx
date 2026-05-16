import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Shield, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { TIER_LABELS } from "@/lib/tier-config";

interface RebookFromDeclinedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  cleaningType: string | null;
  hours: number | null;
  excludeCleanerId?: string | null;
}

/**
 * Shown when a cleaner declined a client's pending offer.
 * Surfaces the top 3 best-matched available cleaners and routes the client
 * into the standard booking flow with the chosen cleaner preselected.
 */
export function RebookFromDeclinedModal({
  open, onOpenChange, jobId, cleaningType, hours, excludeCleanerId,
}: RebookFromDeclinedModalProps) {
  const navigate = useNavigate();

  const { data: topMatches = [], isLoading } = useQuery({
    queryKey: ["top-cleaner-matches", excludeCleanerId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cleaner_public_profiles")
        .select(
          "id, first_name, last_name, profile_photo_url, professional_headline, hourly_rate_credits, avg_rating, reliability_score, jobs_completed, tier, is_available"
        )
        .eq("is_available", true)
        .order("reliability_score", { ascending: false, nullsFirst: false })
        .order("avg_rating", { ascending: false, nullsFirst: false })
        .limit(10);
      if (error) throw error;
      return (data || [])
        .filter((c) => c.id !== excludeCleanerId)
        .slice(0, 3);
    },
  });

  const handlePick = (cleanerId: string) => {
    const params = new URLSearchParams({
      cleaner: cleanerId,
      from: jobId,
      ...(cleaningType ? { type: cleaningType } : {}),
      ...(hours ? { hours: String(hours) } : {}),
    });
    onOpenChange(false);
    navigate(`/book?${params.toString()}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Pick a replacement cleaner
          </DialogTitle>
          <DialogDescription>
            Your previous cleaner declined this job and your credits were released.
            Here are your top 3 matches available right now.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 mt-2">
          {isLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
          ) : topMatches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-hairline-soft p-8 text-center">
              <p className="text-sm text-ink-muted">No matching cleaners available right now.</p>
              <Button
                variant="outline" size="sm" className="rounded-xl mt-3"
                onClick={() => { onOpenChange(false); navigate("/discover"); }}
              >
                Browse all cleaners
              </Button>
            </div>
          ) : (
            topMatches.map((c, idx) => {
              const name = `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Cleaner";
              const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              const tierLabel = TIER_LABELS[(c.tier || "bronze") as keyof typeof TIER_LABELS] || "Bronze";
              return (
                <button
                  key={c.id}
                  onClick={() => handlePick(c.id!)}
                  className="w-full text-left rounded-2xl border-2 border-hairline-soft hover:border-primary/50 hover:bg-primary/[0.03] transition-all p-3 sm:p-4 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12 border-2 border-primary/30">
                        <AvatarImage src={c.profile_photo_url || undefined} alt={name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      {idx === 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-warning text-warning-foreground text-[10px] font-bold flex items-center justify-center border-2 border-app-surface">
                          ★
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-sm truncate">{name}</p>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-muted text-ink-muted">
                          {tierLabel}
                        </span>
                      </div>
                      {c.professional_headline && (
                        <p className="text-xs text-ink-muted truncate">{c.professional_headline}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                        {c.avg_rating != null && (
                          <span className="inline-flex items-center gap-1 text-warning">
                            <Star className="h-3 w-3 fill-current" /> {Number(c.avg_rating).toFixed(1)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-success">
                          <Shield className="h-3 w-3" /> {c.reliability_score || 100}%
                        </span>
                        <span className="inline-flex items-center gap-1 text-ink-muted">
                          <CheckCircle2 className="h-3 w-3" /> {c.jobs_completed || 0} jobs
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-primary">{c.hourly_rate_credits || 35}</p>
                      <p className="text-[10px] text-ink-muted">cr / hr</p>
                      <ArrowRight className="h-4 w-4 text-ink-muted/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all ml-auto mt-1" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex justify-between items-center pt-2 mt-2 border-t border-hairline-soft">
          <p className="text-[11px] text-ink-muted">Ranked by reliability + rating</p>
          <Button
            variant="ghost" size="sm" className="rounded-xl text-xs"
            onClick={() => { onOpenChange(false); navigate("/discover"); }}
          >
            See all cleaners
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
