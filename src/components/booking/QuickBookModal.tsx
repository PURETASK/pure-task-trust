import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface QuickBookCleaner {
  id: string;
  name: string;
  hourlyRate: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cleaner: QuickBookCleaner;
  zip?: string | null;
  defaultDate?: Date | null;
  defaultTime?: string | null;
}

const TIME_SLOTS = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

const DURATIONS = [
  { value: "2", label: "2 hours · Quick refresh" },
  { value: "3", label: "3 hours · Standard clean" },
  { value: "4", label: "4 hours · Thorough clean" },
  { value: "5", label: "5 hours · Deep clean" },
  { value: "6", label: "6 hours · Whole home" },
];

export function QuickBookModal({
  open,
  onOpenChange,
  cleaner,
  zip,
  defaultDate,
  defaultTime,
}: Props) {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(defaultDate ?? undefined);
  const [time, setTime] = useState<string>(defaultTime ?? "10:00 AM");
  const [hours, setHours] = useState<string>("3");
  const [submitting, setSubmitting] = useState(false);

  const { data: availability } = useQuery({
    queryKey: ["availability-blocks", cleaner.id],
    enabled: open && !!cleaner.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability_blocks")
        .select("day_of_week, is_active")
        .eq("cleaner_id", cleaner.id)
        .eq("is_active", true);
      if (error) throw error;
      return data || [];
    },
  });

  const availableDows = useMemo(() => {
    if (!availability || availability.length === 0) return null; // null = no restriction
    return new Set(availability.map((b: any) => b.day_of_week));
  }, [availability]);

  const total = cleaner.hourlyRate * parseInt(hours || "0", 10);

  const isDateDisabled = (d: Date) => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    if (d < t) return true;
    if (availableDows && !availableDows.has(d.getDay())) return true;
    return false;
  };

  const handleConfirm = () => {
    if (!date) return;
    setSubmitting(true);
    const params = new URLSearchParams({
      cleaner: cleaner.id,
      date: date.toISOString().split("T")[0],
      time,
      hours,
    });
    if (zip) params.set("zip", zip);
    navigate(`/book?${params.toString()}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-3xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-aero-cyan text-primary-foreground p-5">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-xl font-poppins font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Quick book
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              Book {cleaner.name} in a few taps. We'll confirm your details next.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-5">
          {/* Date */}
          <div className="space-y-2">
            <Label className="font-semibold flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-primary" /> Pick a date
            </Label>
            <div className="rounded-2xl border border-border/60 p-2 bg-muted/20">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={isDateDisabled}
                className="rounded-md mx-auto"
              />
            </div>
          </div>

          {/* Time + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-semibold flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" /> Start time
              </Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Duration</Label>
              <Select value={hours} onValueChange={setHours}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price summary */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                Estimated total
              </p>
              <p className="text-2xl font-poppins font-bold text-primary mt-0.5">
                ${total}
                <span className="text-sm text-muted-foreground font-medium ml-1">
                  · {hours}h × ${cleaner.hourlyRate}/hr
                </span>
              </p>
            </div>
            {date && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  When
                </p>
                <p className="text-sm font-bold mt-0.5">{format(date, "EEE, MMM d")}</p>
                <p className="text-xs text-muted-foreground">{time}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-5 pt-0 flex-col sm:flex-col gap-2">
          <Button
            onClick={handleConfirm}
            disabled={!date || submitting}
            className={cn(
              "w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20 gap-2",
            )}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Continue to checkout <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams({ cleaner: cleaner.id });
              if (zip) params.set("zip", zip);
              navigate(`/book?${params.toString()}`);
            }}
            className="text-sm text-muted-foreground hover:text-primary transition-colors mx-auto"
          >
            Need more options? Use the full booking flow →
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
