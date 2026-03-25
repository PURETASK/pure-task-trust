import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Plus, Trash2, Umbrella, Star, CheckCircle2, Loader2 } from "lucide-react";
import { useTimeOff } from "@/hooks/useAvailability";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const YEAR = new Date().getFullYear();

const HOLIDAYS = [
  { label: "New Year's Day",       date: `${YEAR}-01-01`, emoji: "🎆" },
  { label: "Memorial Day",         date: `${YEAR}-05-26`, emoji: "🇺🇸" },
  { label: "Independence Day",     date: `${YEAR}-07-04`, emoji: "🎇" },
  { label: "Labor Day",            date: `${YEAR}-09-01`, emoji: "🛠️" },
  { label: "Thanksgiving",         date: `${YEAR}-11-27`, emoji: "🦃" },
  { label: "Christmas Eve",        date: `${YEAR}-12-24`, emoji: "🎄" },
  { label: "Christmas Day",        date: `${YEAR}-12-25`, emoji: "🎁" },
  { label: "New Year's Eve",       date: `${YEAR}-12-31`, emoji: "🥂" },
];

export function TimeOffManager() {
  const { upcomingTimeOff, pastTimeOff, isLoading, addTimeOff, deleteTimeOff } = useTimeOff();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addingHoliday, setAddingHoliday] = useState<string | null>(null);
  const [newTimeOff, setNewTimeOff] = useState({
    start_date: "",
    end_date: "",
    start_time: null as string | null,
    end_time: null as string | null,
    all_day: true,
    reason: "",
  });

  const resetForm = () =>
    setNewTimeOff({ start_date: "", end_date: "", start_time: null, end_time: null, all_day: true, reason: "" });

  const handleAdd = () => {
    addTimeOff.mutate(
      {
        start_date: newTimeOff.start_date,
        end_date: newTimeOff.end_date,
        start_time: newTimeOff.all_day ? null : newTimeOff.start_time,
        end_time: newTimeOff.all_day ? null : newTimeOff.end_time,
        all_day: newTimeOff.all_day,
        reason: newTimeOff.reason || null,
      },
      { onSuccess: () => { setIsDialogOpen(false); resetForm(); } }
    );
  };

  const addHoliday = async (h: (typeof HOLIDAYS)[number]) => {
    setAddingHoliday(h.date);
    try {
      await addTimeOff.mutateAsync({
        start_date: h.date,
        end_date: h.date,
        start_time: null,
        end_time: null,
        all_day: true,
        reason: h.label,
      });
    } finally {
      setAddingHoliday(null);
    }
  };

  // Check which holidays are already blocked
  const allTimeOff = [...(upcomingTimeOff || []), ...(pastTimeOff || [])];
  const isHolidayBlocked = (date: string) =>
    allTimeOff.some((t) => t.start_date === date || t.end_date === date);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-56 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Holiday quick-add ── */}
      <div className="rounded-3xl border-2 border-warning/40 overflow-hidden" style={{ background: "hsl(var(--card))" }}>
        <div className="flex items-center gap-3 px-5 py-4 bg-warning/8 border-b-2 border-warning/30">
          <div className="h-9 w-9 rounded-xl bg-warning/15 border-2 border-warning/30 flex items-center justify-center">
            <Star className="h-4 w-4 text-warning" />
          </div>
          <div>
            <p className="font-black text-base text-warning">Common Holidays</p>
            <p className="text-xs text-muted-foreground">Tap any holiday to block that day off — tap again to remove</p>
          </div>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {HOLIDAYS.map((h) => {
            const blocked = isHolidayBlocked(h.date);
            const isAdding = addingHoliday === h.date;
            // find the existing record so we can delete it
            const existing = allTimeOff.find((t) => t.start_date === h.date && t.reason === h.label);

            return (
              <motion.button
                key={h.date}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (blocked && existing) {
                    deleteTimeOff.mutate(existing.id);
                  } else if (!blocked) {
                    addHoliday(h);
                  }
                }}
                disabled={isAdding || (deleteTimeOff.isPending && existing?.id === deleteTimeOff.variables)}
                className={cn(
                  "relative flex flex-col items-center gap-1 p-3 rounded-2xl border-2 text-xs font-semibold transition-all text-center",
                  blocked
                    ? "border-success/60 bg-success/12 text-success"
                    : "border-border/60 bg-muted/30 text-foreground hover:border-warning/40 hover:bg-warning/8"
                )}
              >
                {isAdding ? (
                  <Loader2 className="h-5 w-5 animate-spin text-warning" />
                ) : blocked ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <span className="text-lg">{h.emoji}</span>
                )}
                <span className="leading-tight">{h.label}</span>
                {blocked && (
                  <span className="absolute top-1 right-1 text-[9px] font-bold text-success bg-success/15 rounded-full px-1">
                    ✓ Set
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Main days off manager ── */}
      <div className="rounded-3xl border-2 border-primary/40 overflow-hidden" style={{ background: "hsl(var(--card))" }}>
        <div className="flex items-center justify-between px-5 py-4 bg-primary/8 border-b-2 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/15 border-2 border-primary/30 flex items-center justify-center">
              <Umbrella className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-black text-base text-primary">Days I Don't Work</p>
              <p className="text-xs text-muted-foreground">Mark specific dates you won't be available</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl gap-1.5 border-2 border-primary bg-primary text-white font-bold">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle>Add Days Off</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">Start Date</Label>
                    <Input
                      type="date"
                      className="rounded-xl border-2 border-border/60 h-11"
                      value={newTimeOff.start_date}
                      onChange={(e) =>
                        setNewTimeOff((p) => ({
                          ...p,
                          start_date: e.target.value,
                          end_date: p.end_date || e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">End Date</Label>
                    <Input
                      type="date"
                      className="rounded-xl border-2 border-border/60 h-11"
                      value={newTimeOff.end_date}
                      onChange={(e) => setNewTimeOff((p) => ({ ...p, end_date: e.target.value }))}
                      min={newTimeOff.start_date}
                    />
                  </div>
                </div>

                {/* All Day toggle */}
                <div
                  onClick={() => setNewTimeOff((p) => ({ ...p, all_day: !p.all_day }))}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border-2 px-4 py-3 cursor-pointer transition-all",
                    newTimeOff.all_day ? "border-primary/50 bg-primary/8" : "border-border bg-muted/30"
                  )}
                >
                  <div>
                    <p className="font-bold text-sm">All Day</p>
                    <p className="text-xs text-muted-foreground">Block the entire day</p>
                  </div>
                  <Switch
                    checked={newTimeOff.all_day}
                    onCheckedChange={(v) => setNewTimeOff((p) => ({ ...p, all_day: v }))}
                    className="pointer-events-none"
                  />
                </div>

                {!newTimeOff.all_day && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Start Time</Label>
                      <Input
                        type="time"
                        className="rounded-xl border-2 border-border/60 h-11"
                        value={newTimeOff.start_time || ""}
                        onChange={(e) => setNewTimeOff((p) => ({ ...p, start_time: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">End Time</Label>
                      <Input
                        type="time"
                        className="rounded-xl border-2 border-border/60 h-11"
                        value={newTimeOff.end_time || ""}
                        onChange={(e) => setNewTimeOff((p) => ({ ...p, end_time: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="font-semibold">Reason (optional)</Label>
                  <Input
                    className="rounded-xl border-2 border-border/60 h-11"
                    placeholder="e.g. Holiday, Personal day, Travel"
                    value={newTimeOff.reason}
                    onChange={(e) => setNewTimeOff((p) => ({ ...p, reason: e.target.value }))}
                  />
                </div>

                <Button
                  onClick={handleAdd}
                  className="w-full rounded-xl h-11 font-bold border-2 border-primary"
                  disabled={addTimeOff.isPending || !newTimeOff.start_date || !newTimeOff.end_date}
                >
                  {addTimeOff.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
                  ) : (
                    "Save Days Off"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="p-4">
          {upcomingTimeOff.length === 0 && pastTimeOff.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No days off added yet</p>
              <p className="text-sm mt-1">Use the Add button or tap a holiday shortcut above</p>
            </div>
          ) : (
            <div className="space-y-5">
              {upcomingTimeOff.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Upcoming</p>
                  <div className="space-y-2">
                    {upcomingTimeOff.map((t) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 rounded-2xl border-2 border-primary/30 bg-primary/6"
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm">
                              {format(parseISO(t.start_date), "MMM d")}
                              {t.start_date !== t.end_date && (
                                <> – {format(parseISO(t.end_date), "MMM d")}</>
                              )}
                            </span>
                            {t.all_day ? (
                              <Badge className="bg-primary/15 text-primary border border-primary/30 text-xs rounded-full">All Day</Badge>
                            ) : (
                              <Badge className="bg-muted text-muted-foreground border border-border/40 text-xs rounded-full">
                                {t.start_time} – {t.end_time}
                              </Badge>
                            )}
                          </div>
                          {t.reason && <p className="text-xs text-muted-foreground mt-0.5">{t.reason}</p>}
                        </div>
                        <button
                          onClick={() => deleteTimeOff.mutate(t.id)}
                          className="h-8 w-8 rounded-xl bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {pastTimeOff.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Past</p>
                  <div className="space-y-1.5">
                    {pastTimeOff.slice(0, 4).map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-muted/20">
                        <span className="text-sm text-muted-foreground">
                          {format(parseISO(t.start_date), "MMM d")}
                          {t.start_date !== t.end_date && <> – {format(parseISO(t.end_date), "MMM d")}</>}
                          {t.reason && <span className="ml-2 text-xs">· {t.reason}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
