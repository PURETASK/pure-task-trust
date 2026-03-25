import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { useCalendarSync, getProviderInfo } from "@/hooks/useCalendarSync";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar, Link2, Unlink, RefreshCw, CheckCircle, AlertCircle,
  Loader2, Clock, Briefcase, MapPin, ChevronRight, Zap,
  CalendarDays, Activity, Star, TrendingUp, Eye, Shield
} from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek, parseISO } from "date-fns";

// ── Provider brand config ─────────────────────────────────────────────────────
const PROVIDERS = [
  {
    id: "google",
    name: "Google Calendar",
    description: "Sync with your Google Workspace or personal Gmail calendar",
    gradient: "from-red-500/20 to-orange-500/10",
    border: "border-red-500/50",
    icon: "🔴",
    accentColor: "text-red-400",
    badgeBg: "bg-red-500/15 border-red-500/30",
  },
  {
    id: "outlook",
    name: "Outlook / Microsoft 365",
    description: "Connect your work or personal Microsoft calendar",
    gradient: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/50",
    icon: "🔵",
    accentColor: "text-blue-400",
    badgeBg: "bg-blue-500/15 border-blue-500/30",
  },
  {
    id: "apple",
    name: "Apple Calendar",
    description: "Sync with iCloud Calendar on your Apple devices",
    gradient: "from-slate-500/20 to-zinc-500/10",
    border: "border-slate-400/50",
    icon: "🍎",
    accentColor: "text-slate-300",
    badgeBg: "bg-slate-500/15 border-slate-400/30",
  },
];

function getRelativeDay(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d))     return { label: "Today",    cls: "text-success font-bold" };
  if (isTomorrow(d))  return { label: "Tomorrow", cls: "text-warning font-semibold" };
  if (isThisWeek(d))  return { label: format(d, "EEEE"), cls: "text-primary" };
  return { label: format(d, "MMM d"), cls: "text-muted-foreground" };
}

// ── Calendar event card ───────────────────────────────────────────────────────
function EventCard({ event }: { event: any }) {
  const job = event.job;
  const day = job?.scheduled_start_at ? getRelativeDay(job.scheduled_start_at) : null;

  const statusColor =
    job?.status === "completed"  ? "bg-success/15 border-success/40 text-success"   :
    job?.status === "confirmed"  ? "bg-primary/15 border-primary/40 text-primary"   :
    job?.status === "scheduled"  ? "bg-warning/15 border-warning/40 text-warning"   :
                                   "bg-muted border-border text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-3 rounded-2xl border-2 border-border/40 bg-card/50 hover:border-primary/30 transition-colors"
    >
      <div className="h-10 w-10 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0">
        <Briefcase className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {day && <span className={`text-xs ${day.cls}`}>{day.label}</span>}
          {job?.scheduled_start_at && (
            <span className="text-xs text-muted-foreground">
              {format(parseISO(job.scheduled_start_at), "h:mm a")}
            </span>
          )}
          {job?.status && (
            <Badge className={`text-[10px] h-4 px-1.5 border ${statusColor}`}>
              {job.status}
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium truncate">{job?.title || `Job #${event.job_id?.slice(0, 8)}`}</p>
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {event.event_type} · synced {format(parseISO(event.synced_at), "MMM d")}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1" />
    </motion.div>
  );
}

// ── Connected calendar card ───────────────────────────────────────────────────
function ConnectedCalendarCard({
  connection,
  onToggle,
  onDisconnect,
  isSyncing,
  isDisconnecting,
}: {
  connection: any;
  onToggle: (id: number, enabled: boolean) => void;
  onDisconnect: (id: number) => void;
  isSyncing: boolean;
  isDisconnecting: boolean;
}) {
  const { useSyncedEvents } = useCalendarSync();
  const { data: events = [], isLoading: eventsLoading } = useSyncedEvents(connection.id);
  const [expanded, setExpanded] = useState(true);

  const provider = PROVIDERS.find(p => p.id === connection.provider.toLowerCase()) || PROVIDERS[0];
  const info = getProviderInfo(connection.provider);

  // Summarize event stats
  const upcoming   = events.filter(e => e.job?.status === "scheduled" || e.job?.status === "confirmed").length;
  const completed  = events.filter(e => e.job?.status === "completed").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border-2 ${provider.border} overflow-hidden`}
    >
      {/* Header bar */}
      <div className={`p-5 bg-gradient-to-r ${provider.gradient}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-card/60 border-2 border-white/10 flex items-center justify-center text-2xl backdrop-blur-sm">
              {info.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{info.name}</h3>
                {connection.sync_enabled ? (
                  <Badge className="gap-1 bg-success/20 border-success/40 text-success border text-[11px]">
                    <Activity className="h-2.5 w-2.5" /> Live
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 text-[11px]">
                    <AlertCircle className="h-2.5 w-2.5" /> Paused
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {connection.email || connection.external_id}
              </p>
              {connection.last_synced_at && (
                <p className="text-xs text-muted-foreground">
                  Last sync: {format(new Date(connection.last_synced_at), "MMM d 'at' h:mm a")}
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:block">Auto-sync</span>
              {isSyncing
                ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                : <Switch
                    checked={connection.sync_enabled}
                    onCheckedChange={checked => onToggle(connection.id, checked)}
                  />
              }
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
              onClick={() => onDisconnect(connection.id)}
              disabled={isDisconnecting}
            >
              <Unlink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mini stats */}
        <div className="flex gap-3 mt-4">
          {[
            { icon: CalendarDays, value: events.length, label: "Synced Events", color: "text-primary" },
            { icon: TrendingUp,   value: upcoming,       label: "Upcoming Jobs", color: "text-success" },
            { icon: CheckCircle,  value: completed,       label: "Completed",    color: "text-warning" },
          ].map(s => (
            <div key={s.label} className="flex-1 rounded-xl bg-card/40 border border-white/10 p-2 text-center backdrop-blur-sm">
              <s.icon className={`h-3.5 w-3.5 mx-auto mb-1 ${s.color}`} />
              <p className="text-base font-black leading-none">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Events list */}
      <div className="p-5">
        <button
          className="flex items-center justify-between w-full mb-3"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Synced Calendar Events</span>
            <Badge variant="secondary" className="text-[11px]">{events.length}</Badge>
          </div>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {eventsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {events.map(ev => <EventCard key={ev.id} event={ev} />)}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-border/40 py-8 text-center">
                  <Calendar className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No events synced yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Events will appear here once the next sync runs</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CleanerCalendarSync() {
  const { toast } = useToast();
  const { connections, isLoading, toggleSync: toggleSyncMutation, disconnectCalendar } = useCalendarSync();
  const [syncingId, setSyncingId]     = useState<number | null>(null);

  const handleToggleSync = async (connectionId: number, enabled: boolean) => {
    setSyncingId(connectionId);
    try {
      await toggleSyncMutation.mutateAsync({ connectionId, enabled });
      toast({
        title: enabled ? "✅ Sync enabled" : "⏸ Sync paused",
        description: enabled ? "Your calendar will sync automatically" : "Calendar sync has been paused",
      });
    } catch (err: any) {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (connectionId: number) => {
    try {
      await disconnectCalendar.mutateAsync(connectionId);
      toast({ title: "Calendar disconnected" });
    } catch (err: any) {
      toast({ title: "Failed to disconnect", description: err.message, variant: "destructive" });
    }
  };

  return (
    <CleanerLayout>
      <div className="space-y-6 max-w-3xl">

        {/* ── HERO ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative overflow-hidden rounded-3xl p-7"
            style={{
              background: "linear-gradient(135deg, hsl(280,70%,18%) 0%, hsl(280,70%,30%) 50%, hsl(210,100%,28%) 100%)",
              boxShadow: "0 16px 48px -8px hsl(280,70%,30%/0.45)",
            }}>
            <div className="absolute -top-12 -right-12 w-60 h-60 rounded-full blur-3xl opacity-20"
              style={{ background: "hsl(210,100%,60%)" }} />
            <div className="absolute bottom-0 left-16 w-40 h-40 rounded-full blur-3xl opacity-15"
              style={{ background: "hsl(280,70%,60%)" }} />

            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-4 w-4 text-white/60" />
                <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Integrations</span>
              </div>
              <h1 className="text-4xl font-black text-white mb-1">Calendar Sync</h1>
              <p className="text-white/60 text-sm max-w-sm">
                Connect your calendar so your schedule always reflects your real availability — no double-bookings, no missed jobs.
              </p>

              <div className="flex gap-3 mt-5 flex-wrap">
                {[
                  { icon: Zap,    value: connections.length,                                      label: "Connected",  color: "bg-white/10 border-white/20" },
                  { icon: Activity, value: connections.filter(c => c.sync_enabled).length,        label: "Syncing",    color: "bg-success/20 border-success/40" },
                  { icon: Shield, value: "256-bit",                                               label: "Encrypted",  color: "bg-white/10 border-white/20" },
                ].map(s => (
                  <div key={s.label} className={`rounded-2xl border ${s.color} px-4 py-3 text-white backdrop-blur-sm text-center min-w-[80px]`}>
                    <s.icon className="h-4 w-4 mx-auto mb-1 text-white/60" />
                    <p className="text-xl font-bold leading-none">{s.value}</p>
                    <p className="text-white/50 text-[11px] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── CONNECT NEW ──────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
          <div className="rounded-3xl border-2 border-primary/50 overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(210,100%,50%/0.05), hsl(210,100%,50%/0.02))" }}>
            <div className="p-5 border-b border-primary/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold">Connect a Calendar</h2>
                  <p className="text-xs text-muted-foreground">Choose your provider — we'll import your events automatically</p>
                </div>
              </div>
            </div>

            <div className="p-5 grid sm:grid-cols-3 gap-3">
              {PROVIDERS.map(provider => (
                <motion.div key={provider.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button
                    className={`w-full rounded-2xl border-2 ${provider.border} p-4 text-left bg-gradient-to-br ${provider.gradient} hover:shadow-md transition-all duration-200 group`}
                    onClick={() => toast({ title: `${provider.name} OAuth coming soon`, description: "Calendar OAuth integration requires backend setup" })}
                  >
                    <div className="text-2xl mb-2">{provider.icon}</div>
                    <p className={`font-bold text-sm ${provider.accentColor}`}>{provider.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{provider.description}</p>
                    <div className={`mt-3 inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold ${provider.badgeBg}`}>
                      <Zap className="h-2.5 w-2.5" /> Connect
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── CONNECTED CALENDARS ──────────────────────── */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-64 rounded-3xl" />)}
          </div>
        ) : connections.length > 0 ? (
          <div className="space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Your Connected Calendars
              <Badge variant="secondary">{connections.length}</Badge>
            </h2>
            {connections.map(conn => (
              <ConnectedCalendarCard
                key={conn.id}
                connection={conn}
                onToggle={handleToggleSync}
                onDisconnect={handleDisconnect}
                isSyncing={syncingId === conn.id}
                isDisconnecting={disconnectCalendar.isPending}
              />
            ))}
          </div>
        ) : null}

        {/* ── HOW IT WORKS ─────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <div className="rounded-3xl border-2 border-warning/50 p-6"
            style={{ background: "linear-gradient(135deg, hsl(38,95%,55%/0.06), transparent)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-warning/15 flex items-center justify-center">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h2 className="font-bold">How Calendar Sync Works</h2>
                <p className="text-xs text-muted-foreground">Three steps to a perfectly managed schedule</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  step: "01",
                  icon: Link2,
                  title: "Connect",
                  desc: "Authorize your calendar provider once — we never store your passwords.",
                  color: "border-primary/50 bg-primary/8",
                  iconColor: "text-primary",
                  numColor: "text-primary/30",
                },
                {
                  step: "02",
                  icon: RefreshCw,
                  title: "Auto-Sync",
                  desc: "Your upcoming jobs are automatically pushed to your external calendar.",
                  color: "border-success/50 bg-success/8",
                  iconColor: "text-success",
                  numColor: "text-success/30",
                },
                {
                  step: "03",
                  icon: CheckCircle,
                  title: "Zero Conflicts",
                  desc: "Busy slots from your calendar block out matching job requests.",
                  color: "border-warning/50 bg-warning/8",
                  iconColor: "text-warning",
                  numColor: "text-warning/30",
                },
              ].map(item => (
                <div key={item.step} className={`rounded-2xl border-2 ${item.color} p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-9 w-9 rounded-xl bg-card flex items-center justify-center border-2 border-current ${item.color}`}>
                      <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                    </div>
                    <span className={`text-3xl font-black ${item.numColor}`}>{item.step}</span>
                  </div>
                  <h4 className="font-bold mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </CleanerLayout>
  );
}
