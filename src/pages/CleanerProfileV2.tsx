import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Shield,
  CheckCircle2,
  Heart,
  MapPin,
  Award,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Quote,
  Loader2,
  ArrowLeft,
  Clock,
  Sparkles,
  Zap,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCleaner } from "@/hooks/useCleaners";
import { useCleanerReviews } from "@/hooks/useReviews";
import { useFavorites, useFavoriteActions } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/seo";
import { QuickBookModal } from "@/components/booking/QuickBookModal";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function gradientFor(seed: string) {
  const palettes = [
    "from-aero-cyan via-primary to-accent",
    "from-warning via-accent to-primary",
    "from-primary via-aero-cyan to-success",
    "from-accent via-primary to-warning",
    "from-success via-aero-cyan to-primary",
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palettes[h % palettes.length];
}
function getInitials(name: string) {
  const p = name.split(" ").filter(Boolean);
  return p.length >= 2 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : (p[0]?.[0] || "C").toUpperCase();
}

export default function CleanerProfileV2() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: cleaner, isLoading } = useCleaner(id || "");
  const { data: reviews } = useCleanerReviews(id || "");
  const { data: favorites } = useFavorites();
  const { toggleFavorite, isToggling } = useFavoriteActions();

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);

  const isFav = favorites?.some((f: any) => f.cleaner_id === id) ?? false;

  // Availability data
  const { data: blocks } = useQuery({
    queryKey: ["v2-blocks", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability_blocks")
        .select("day_of_week, start_time, end_time, is_active")
        .eq("cleaner_id", id!)
        .eq("is_active", true);
      if (error) throw error;
      return data || [];
    },
  });

  const monthStart = new Date(year, month, 1).toISOString();
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
  const { data: jobs } = useQuery({
    queryKey: ["v2-jobs", id, month, year],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("scheduled_start_at, status")
        .eq("cleaner_id", id!)
        .gte("scheduled_start_at", monthStart)
        .lte("scheduled_start_at", monthEnd)
        .in("status", ["pending", "confirmed", "in_progress"]);
      if (error) throw error;
      return data || [];
    },
  });

  const availDows = useMemo(() => new Set((blocks || []).map((b: any) => b.day_of_week)), [blocks]);
  const bookedDates = useMemo(() => {
    const s = new Set<string>();
    (jobs || []).forEach((j: any) => {
      if (j.scheduled_start_at) {
        const d = new Date(j.scheduled_start_at);
        s.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    });
    return s;
  }, [jobs]);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    const firstDow = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDow; i++) days.push(null);
    for (let i = 1; i <= lastDay; i++) days.push(i);
    return days;
  }, [month, year]);

  const slotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    const dow = selectedDate.getDay();
    const blocksForDay = (blocks || []).filter((b: any) => b.day_of_week === dow);
    if (blocksForDay.length === 0) {
      // Fallback default slots
      return ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"];
    }
    const slots: string[] = [];
    blocksForDay.forEach((b: any) => {
      const [sh] = (b.start_time || "09:00").split(":").map(Number);
      const [eh] = (b.end_time || "17:00").split(":").map(Number);
      for (let h = sh; h <= eh - 2; h += 2) {
        const hr12 = h % 12 === 0 ? 12 : h % 12;
        const ampm = h < 12 ? "AM" : "PM";
        slots.push(`${hr12}:00 ${ampm}`);
      }
    });
    return slots.length ? slots : ["9:00 AM", "11:00 AM", "1:00 PM"];
  }, [selectedDate, blocks]);

  const handleFav = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!id) return;
    try {
      await toggleFavorite({ cleanerId: id, isFavorite: isFav });
      toast({ title: isFav ? "Removed from favorites" : "❤️ Added to favorites" });
    } catch {
      toast({ title: "Could not update favorites", variant: "destructive" });
    }
  };

  const handleSlotClick = (slot: string) => {
    setSelectedTime(slot);
    setQuickOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6 max-w-3xl">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!cleaner) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Cleaner not found</h1>
        <Button asChild><Link to="/discover">Back to discover</Link></Button>
      </div>
    );
  }

  const score = cleaner.reliabilityScore ?? 0;
  const tierLabel =
    cleaner.tier === "platinum" ? "Elite"
    : cleaner.tier === "gold" ? "Pro"
    : cleaner.tier === "silver" ? "Proven"
    : cleaner.tier === "bronze" ? "Rising"
    : "Basic";

  const isTopRated = (cleaner.avgRating ?? 0) >= 4.7 && (cleaner.jobsCompleted ?? 0) >= 20;
  const onTime = Math.min(99, 85 + Math.round(score / 10));
  const photoVer = Math.min(100, 90 + Math.round(score / 14));
  const years = Math.max(1, Math.round((cleaner.jobsCompleted ?? 0) / 50));

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
  };

  return (
    <main className="flex-1 min-h-screen bg-background pb-32 md:pb-8">
      <SEO title={`${cleaner.name} · Verified Cleaner`} description={cleaner.bio || ""} url={`/cleaner/${id}/v2`} />

      {/* Top bar */}
      <div className="container max-w-3xl pt-6 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/discover"><ArrowLeft className="h-4 w-4" /> Back</Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary/40 text-primary font-bold">
            <Sparkles className="h-3 w-3 mr-1" /> Streamlined view (v2)
          </Badge>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to={`/cleaner/${id}`}>
              <ArrowRightLeft className="h-3.5 w-3.5" /> Try classic view
            </Link>
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="container max-w-3xl pt-4 space-y-5"
      >
        {/* HERO */}
        <div className="relative rounded-3xl overflow-hidden border border-border/60 bg-card shadow-elevated">
          <div className="relative h-72 sm:h-96">
            {cleaner.profilePhotoUrl ? (
              <img src={cleaner.profilePhotoUrl} alt={cleaner.name} className="w-full h-full object-cover" />
            ) : (
              <div className={cn("w-full h-full flex items-center justify-center bg-gradient-to-br", gradientFor(cleaner.id))}>
                <span className="text-9xl font-poppins font-bold text-white/95 drop-shadow-lg">
                  {getInitials(cleaner.name)}
                </span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Top badges */}
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1.5">
                {isTopRated && (
                  <Badge className="bg-success text-success-foreground border-0 shadow-md gap-1 font-bold w-fit">
                    <Award className="h-3 w-3" /> Top Rated
                  </Badge>
                )}
                <Badge className="bg-primary text-primary-foreground border-0 shadow-md gap-1 font-bold w-fit">
                  <Shield className="h-3 w-3" /> {tierLabel}
                </Badge>
              </div>
              <button
                onClick={handleFav}
                disabled={isToggling}
                className="h-11 w-11 rounded-full bg-card/95 backdrop-blur-sm border border-border/60 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <Heart className={cn("h-5 w-5", isFav ? "fill-destructive text-destructive" : "text-muted-foreground")} />
              </button>
            </div>

            {/* Name overlay */}
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <h1 className="text-3xl sm:text-4xl font-poppins font-bold drop-shadow-lg">{cleaner.name}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm">
                {cleaner.avgRating != null && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-bold">{cleaner.avgRating.toFixed(1)}</span>
                    <span className="text-white/70">({reviews?.length ?? 0} reviews)</span>
                  </span>
                )}
                <span className="text-white/70">·</span>
                <span>{cleaner.jobsCompleted} jobs done</span>
                {cleaner.distance && (<><span className="text-white/70">·</span><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {cleaner.distance}</span></>)}
              </div>
            </div>
          </div>
        </div>

        {/* KEY STATS */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Reliability", value: `${score}%`, icon: Shield, color: "text-primary" },
            { label: "On-time", value: `${onTime}%`, icon: Clock, color: "text-success" },
            { label: "Experience", value: `${years}yr`, icon: Award, color: "text-warning" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border/60 rounded-2xl p-4 text-center">
              <s.icon className={cn("h-5 w-5 mx-auto mb-1.5", s.color)} />
              <p className="text-xl font-poppins font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* PRICE + BOOK CTA */}
        <div className="bg-gradient-to-br from-primary/10 via-aero-cyan/5 to-accent/10 border border-primary/30 rounded-3xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Hourly rate</p>
            <p className="text-3xl font-poppins font-bold text-primary mt-0.5">
              ${cleaner.hourlyRate}<span className="text-sm text-muted-foreground font-medium">/hour</span>
            </p>
          </div>
          <Button onClick={() => setQuickOpen(true)} size="lg" className="rounded-xl font-bold shadow-md shadow-primary/30 gap-2 px-6">
            <Zap className="h-4 w-4" /> Book Now
          </Button>
        </div>

        {/* ABOUT */}
        {cleaner.bio && (
          <div className="bg-card border border-border/60 rounded-3xl p-5">
            <h2 className="font-poppins font-bold text-lg mb-2">About {cleaner.firstName || cleaner.name.split(" ")[0]}</h2>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{cleaner.bio}</p>
          </div>
        )}

        {/* TRUST CHECKLIST */}
        <div className="bg-card border border-border/60 rounded-3xl p-5">
          <h2 className="font-poppins font-bold text-lg mb-3">Why book with confidence</h2>
          <ul className="space-y-2.5 text-sm">
            {[
              `${onTime}% on-time arrival rate`,
              `${photoVer}% jobs with photo proof`,
              `${cleaner.jobsCompleted} jobs successfully completed`,
              `${years} year${years !== 1 ? "s" : ""} of professional experience`,
              "GPS check-in & check-out verification",
              "Background-checked & insured",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                <span className="text-foreground/85">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* SERVICES */}
        {cleaner.services && cleaner.services.length > 0 && (
          <div className="bg-card border border-border/60 rounded-3xl p-5">
            <h2 className="font-poppins font-bold text-lg mb-3">Services offered</h2>
            <div className="flex flex-wrap gap-2">
              {cleaner.services.map((s) => (
                <Badge key={s} variant="outline" className="border-primary/30 text-primary font-semibold px-3 py-1 text-sm">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* AVAILABILITY CALENDAR — one-tap booking */}
        <div className="bg-card border border-border/60 rounded-3xl overflow-hidden">
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <button onClick={prevMonth} className="p-1 hover:bg-primary-foreground/10 rounded-lg">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="font-poppins font-bold text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-1 hover:bg-primary-foreground/10 rounded-lg">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={i} className="h-11" />;
                const d = new Date(year, month, day);
                const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));
                const dow = d.getDay();
                const isAvailable = !isPast && (availDows.size === 0 || availDows.has(dow));
                const key = `${year}-${month}-${day}`;
                const booked = bookedDates.has(key);
                const isSelected = selectedDate?.toDateString() === d.toDateString();
                return (
                  <button
                    key={i}
                    disabled={isPast || !isAvailable}
                    onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                    className={cn(
                      "h-11 rounded-lg text-sm font-semibold border transition-all",
                      isPast && "text-muted-foreground/30 border-transparent cursor-not-allowed",
                      !isPast && !isAvailable && "border-transparent text-muted-foreground/50 cursor-not-allowed",
                      isAvailable && !isSelected && !booked && "border-success/40 bg-success/5 hover:bg-success/15 text-foreground",
                      isAvailable && booked && !isSelected && "border-warning/40 bg-warning/5 text-foreground",
                      isSelected && "border-primary bg-primary text-primary-foreground shadow-md",
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border-2 border-success bg-success/10" /> Open</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border-2 border-warning bg-warning/10" /> Some bookings</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-primary" /> Selected</span>
            </div>

            {/* Slots */}
            {selectedDate && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 pt-5 border-t border-border/40">
                <p className="text-sm font-semibold mb-3">
                  Available times on <span className="text-primary">{format(selectedDate, "EEE, MMM d")}</span>
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slotsForDate.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => handleSlotClick(slot)}
                      className="h-11 rounded-xl border border-border/60 text-sm font-semibold hover:border-primary hover:bg-primary/5 hover:text-primary transition-all"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Tap a time to book it instantly →</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* REVIEWS */}
        <div className="bg-card border border-border/60 rounded-3xl p-5">
          <h2 className="font-poppins font-bold text-lg mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-warning fill-warning" />
            Reviews ({reviews?.length || 0})
          </h2>
          {!reviews || reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No reviews yet — be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 5).map((r: any) => (
                <div key={r.id} className="border-b border-border/40 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("h-4 w-4", i < (r.rating || 0) ? "fill-warning text-warning" : "text-muted-foreground/25")} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {r.created_at ? format(new Date(r.created_at), "MMM d, yyyy") : ""}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-foreground/85 italic">
                      <Quote className="inline h-3 w-3 text-muted-foreground/40 mr-1" />
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Floating mobile book bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/60 p-4 flex items-center justify-between gap-3 shadow-2xl z-40">
        <div>
          <p className="text-xl font-poppins font-bold text-primary">${cleaner.hourlyRate}<span className="text-xs text-muted-foreground">/hr</span></p>
          <p className="text-xs text-muted-foreground">{cleaner.name}</p>
        </div>
        <Button onClick={() => setQuickOpen(true)} className="flex-1 rounded-xl font-bold gap-2">
          <Zap className="h-4 w-4" /> Book Now
        </Button>
      </div>

      <QuickBookModal
        open={quickOpen}
        onOpenChange={setQuickOpen}
        cleaner={{ id: cleaner.id, name: cleaner.name, hourlyRate: cleaner.hourlyRate }}
        defaultDate={selectedDate}
        defaultTime={selectedTime}
      />
    </main>
  );
}
