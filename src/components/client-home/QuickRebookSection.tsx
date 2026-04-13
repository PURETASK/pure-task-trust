import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { JobWithDetails } from "@/hooks/useJob";

interface Props {
  candidates: JobWithDetails[];
}

export function QuickRebookSection({ candidates }: Props) {
  if (!candidates.length) {
    return (
      <section>
        <div className="mb-3">
          <h2 className="text-base sm:text-lg font-bold">Quick Rebook</h2>
          <p className="text-xs text-muted-foreground">Book your usual cleaning in seconds.</p>
        </div>
        <Card className="border-dashed">
          <CardContent className="p-5 flex flex-col items-center gap-3 text-center">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No recent cleaners yet</p>
              <p className="text-xs text-muted-foreground">Complete a booking to see quick rebook options</p>
            </div>
            <Button size="sm" variant="outline" asChild className="mt-1">
              <Link to="/discover">Browse Cleaners</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

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
                <div className="w-44 sm:w-52 rounded-2xl border border-border/60 bg-card p-4 sm:p-5 hover:shadow-card hover:border-primary/30 transition-all group">
                  <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-lg mb-3 group-hover:bg-primary/15 transition-colors">
                    {name.charAt(0)}
                  </div>
                  <p className="font-semibold text-sm truncate">{name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {rating != null && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        {rating.toFixed(1)}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground capitalize">• {type}</span>
                  </div>
                  <Button size="sm" className="w-full mt-3 h-9 text-xs rounded-xl gap-1.5">
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
