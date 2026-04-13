import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JobWithDetails } from "@/hooks/useJob";

interface Props {
  candidates: JobWithDetails[];
}

export function QuickRebookSection({ candidates }: Props) {
  if (!candidates.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold">Quick Rebook</h2>
          <p className="text-xs text-muted-foreground">Book your usual cleaning in seconds.</p>
        </div>
        <Link to="/discover" className="text-xs text-primary font-semibold hover:underline">
          Find new →
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar snap-x snap-mandatory">
        {candidates.map((job, i) => {
          const name = job.cleaner
            ? `${job.cleaner.first_name || ""} ${job.cleaner.last_name || ""}`.trim() || "Cleaner"
            : "Cleaner";
          const rating = job.cleaner?.avg_rating;
          const type = (job.cleaning_type || "standard").replace("_", " ");

          return (
            <motion.div
              key={job.cleaner_id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex-shrink-0 snap-start"
            >
              <Link to={`/book?cleaner=${job.cleaner_id}&type=${job.cleaning_type}`}>
                <div className="w-40 sm:w-48 rounded-2xl border border-border/60 bg-card p-4 hover:shadow-card hover:border-primary/30 transition-all">
                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg mb-3">
                    {name.charAt(0)}
                  </div>
                  <p className="font-semibold text-sm truncate">{name}</p>
                  {rating != null && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      {rating.toFixed(1)}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground capitalize mt-1 truncate">{type}</p>
                  <Button size="sm" className="w-full mt-3 h-8 text-xs rounded-xl gap-1">
                    <RotateCcw className="h-3 w-3" />
                    Rebook
                  </Button>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
