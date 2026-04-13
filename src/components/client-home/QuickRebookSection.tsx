import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, RotateCcw, Brush, Home, Truck, Search, Heart, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { JobWithDetails } from "@/hooks/useJob";

interface Props {
  candidates: JobWithDetails[];
  isNewUser?: boolean;
}

export function QuickRebookSection({ candidates, isNewUser }: Props) {
  // New user: show "Popular ways to book"
  if (isNewUser || (!candidates.length && isNewUser !== false)) {
    return <PopularWaysToBook />;
  }

  // Returning user with no rebook candidates
  if (!candidates.length) {
    return (
      <section>
        <SectionHeader />
        <Card className="border-dashed">
          <CardContent className="p-5 flex flex-col items-center gap-3 text-center">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No recent cleaners yet</p>
              <p className="text-xs text-muted-foreground">Complete a booking to see quick rebook options.</p>
            </div>
            <Button size="sm" variant="outline" asChild className="mt-1">
              <Link to="/book">Browse Cleaners</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader />
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar snap-x snap-mandatory">
        {candidates.map((job, i) => {
          const name = job.cleaner
            ? `${job.cleaner.first_name || ""} ${job.cleaner.last_name || ""}`.trim() || "Cleaner"
            : "Cleaner";
          const rating = job.cleaner?.avg_rating;
          const type = (job.cleaning_type || "standard").replace("_", " ");
          const address = (job as any).address_line1 || (job as any).address || null;

          return (
            <motion.div
              key={job.cleaner_id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex-shrink-0 snap-start"
            >
              <Link to={`/book?cleaner=${job.cleaner_id}&type=${job.cleaning_type}`}>
                <div className="w-52 sm:w-60 rounded-2xl border border-border/60 bg-card p-4 sm:p-5 hover:shadow-card hover:border-primary/30 transition-all group">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-11 w-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-base group-hover:bg-primary/15 transition-colors flex-shrink-0">
                      {name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {rating != null && (
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            {rating.toFixed(1)}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground capitalize">• {type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Property & last booked */}
                  <div className="space-y-1 mb-3">
                    {address && (
                      <p className="text-xs text-muted-foreground truncate">{address}</p>
                    )}
                    {job.updated_at && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarCheck className="h-3 w-3" />
                        Last booked {new Date(job.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                    {job.escrow_credits_reserved != null && job.escrow_credits_reserved > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Usually ~${job.escrow_credits_reserved} credits
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-9 text-xs rounded-xl gap-1.5">
                      <RotateCcw className="h-3 w-3" />
                      Rebook
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 text-xs rounded-xl px-3"
                      onClick={(e) => e.stopPropagation()}
                      asChild
                    >
                      <Link to={`/book?cleaner=${job.cleaner_id}&type=${job.cleaning_type}&edit=true`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h2 className="text-base sm:text-lg font-bold">Quick Rebook</h2>
        <p className="text-xs text-muted-foreground">Book your usual cleaning in seconds.</p>
      </div>
      <Link to="/book" className="text-xs text-primary font-semibold hover:underline">
        Find new →
      </Link>
    </div>
  );
}

function PopularWaysToBook() {
  const ways = [
    { label: "Book Standard Cleaning", icon: Brush, href: "/book?type=standard", desc: "Weekly or bi-weekly maintenance" },
    { label: "Book Deep Cleaning", icon: Home, href: "/book?type=deep", desc: "Thorough top-to-bottom clean" },
    { label: "Find a Cleaner", icon: Search, href: "/book", desc: "Browse verified professionals" },
  ];

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-base sm:text-lg font-bold">Popular Ways to Book</h2>
        <p className="text-xs text-muted-foreground">Get started with your first cleaning.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ways.map((w) => (
          <Link key={w.label} to={w.href}>
            <Card className="hover:shadow-card hover:border-primary/30 transition-all h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <w.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{w.label}</p>
                  <p className="text-xs text-muted-foreground">{w.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
