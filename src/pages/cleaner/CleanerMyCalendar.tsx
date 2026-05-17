import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ChevronLeft, ChevronRight, MapPin, Navigation,
  XCircle, MessageSquare, RotateCcw, Camera, PlayCircle, StopCircle, Upload, Check, X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Mock data (matches Command Center preview)                          */
/* ------------------------------------------------------------------ */
type Job = {
  id: string; day: number; time: string; end: string; type: keyof typeof TYPE_KEY;
  status: "confirmed" | "in_progress"; addr: string; client: string; credits: number;
};

const MOCK_JOBS: Job[] = [
  { id: "1", day: 4, time: "9:00 AM",  end: "11:30 AM", type: "Standard",   status: "confirmed",   addr: "902 Riverstone Dr", client: "Sarah J.",     credits: 70 },
  { id: "2", day: 4, time: "1:00 PM",  end: "3:30 PM",  type: "Deep Clean", status: "in_progress", addr: "14 Sky Ridge",      client: "TechCorp HQ",  credits: 120 },
  { id: "3", day: 6, time: "10:00 AM", end: "12:00 PM", type: "Standard",   status: "confirmed",   addr: "782 Bluebell Ave",  client: "Marcus T.",    credits: 65 },
  { id: "4", day: 8, time: "2:00 PM",  end: "4:30 PM",  type: "Move-out",   status: "confirmed",   addr: "12 Ocean View Dr",  client: "Linda K.",     credits: 95 },
  { id: "5", day: 10, time: "9:00 AM", end: "11:00 AM", type: "Airbnb",     status: "confirmed",   addr: "55 Pine St",        client: "Jen M.",       credits: 70 },
];

const MOCK_REQUESTS = [
  { id: "r1", time: "Tue · 2:00 PM",  type: "Deep Clean" as const, addr: "221 Maple Crest", client: "Alex P.",       credits: 130, expires: "4h left" },
  { id: "r2", time: "Thu · 10:00 AM", type: "Airbnb"     as const, addr: "9 Harbor Loft",   client: "Bayside Stays", credits: 85,  expires: "22h left" },
];

const TYPE_KEY = {
  Standard:     { dot: "bg-pt-blue",     chip: "bg-pt-blue/10 text-pt-blue",         label: "Standard"  },
  "Deep Clean": { dot: "bg-orange-500",  chip: "bg-orange-500/10 text-orange-600",   label: "Deep"      },
  "Move-out":   { dot: "bg-purple-500",  chip: "bg-purple-500/10 text-purple-600",   label: "Move-out"  },
  Airbnb:       { dot: "bg-emerald-500", chip: "bg-emerald-500/10 text-emerald-600", label: "Airbnb"    },
} as const;

const STATS = [
  { l: "Jobs",       v: "12",     tone: "bg-pt-blue/5 border-pt-blue/15 text-pt-blue" },
  { l: "Hours",      v: "34.5",   tone: "bg-primary/5 border-primary/15 text-primary" },
  { l: "Projected",  v: "$1,240", tone: "bg-aero-aqua/10 border-aero-aqua/30 text-pt-blue" },
  { l: "Utilization",v: "82%",    tone: "bg-muted border-border text-foreground" },
];

const WEEK_DAYS = [
  { d: 3, n: "Sun" }, { d: 4, n: "Mon" }, { d: 5, n: "Tue" }, { d: 6, n: "Wed" },
  { d: 7, n: "Thu" }, { d: 8, n: "Fri" }, { d: 9, n: "Sat" },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function CleanerMyCalendar() {
  const [openJob, setOpenJob] = useState<Job | null>(null);
  const isMobile = useIsMobile();
  const acceptedJobs = MOCK_JOBS.filter(j => j.status === "confirmed" || j.status === "in_progress");
  const close = () => setOpenJob(null);

  return (
    <>
      <Helmet>
        <title>My Schedule · Command Center</title>
        <meta name="description" content="Your jobs, requests, and weekly schedule at a glance." />
      </Helmet>

      <CleanerLayout>
        <div className="space-y-4 sm:space-y-6">
          {/* ── Header ───────────────────────────────────────── */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Schedule</h1>
            <p className="text-sm text-ink-muted">Your week at a glance</p>
          </div>

          {/* ── Stats (2 cols mobile, 4 cols desktop) ────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {STATS.map(s => (
              <Card key={s.l} className={`rounded-2xl border ${s.tone}`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide opacity-70">{s.l}</div>
                  <div className="text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1">{s.v}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Next Job hero ────────────────────────────────── */}
          <Card className="rounded-3xl bg-pt-blue text-white border-0 overflow-hidden relative">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-aero-aqua/20 blur-2xl pointer-events-none" />
            <CardContent className="p-4 sm:p-6 relative">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wider opacity-70">Next Job</div>
                  <h3 className="text-lg sm:text-2xl font-bold mt-0.5 truncate">Deep Clean · 1:00 PM</h3>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs sm:text-sm opacity-90 min-w-0">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">14 Sky Ridge · TechCorp HQ</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl sm:text-3xl font-bold text-aero-aqua leading-none">42m</div>
                  <div className="text-[9px] sm:text-[10px] uppercase opacity-70 mt-1">Countdown</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <Button className="bg-aero-aqua text-pt-blue hover:bg-aero-aqua/90 w-full sm:w-auto">
                  <Navigation className="h-4 w-4 mr-1" /> On my way
                </Button>
                <Button variant="glass" className="w-full sm:w-auto">Travel: 15 min</Button>
              </div>
            </CardContent>
          </Card>

          {/* ── Horizontal week strip ────────────────────────── */}
          <Card className="rounded-3xl">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-xs font-bold uppercase text-ink-muted">This Week</div>
                  <div className="text-xs sm:text-sm font-semibold">May 3 – 9, 2026</div>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" className="h-8 px-2 text-xs">Today</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {WEEK_DAYS.map(({ d, n }) => {
                  const dayJobs = MOCK_JOBS.filter(j => j.day === d);
                  const isToday = d === 4;
                  return (
                    <button
                      key={d}
                      className={`rounded-xl sm:rounded-2xl p-1.5 sm:p-3 border text-center min-h-[78px] sm:min-h-[100px] flex flex-col items-center transition-colors ${
                        isToday
                          ? "bg-primary text-primary-foreground border-primary shadow-tier-2"
                          : "bg-app-surface border-hairline-soft hover:border-primary/30"
                      }`}
                    >
                      <div className={`text-[9px] sm:text-[10px] font-bold uppercase ${isToday ? "opacity-80" : "text-ink-muted"}`}>{n}</div>
                      <div className="text-lg sm:text-2xl font-bold leading-none mt-0.5">{d}</div>
                      <div className="flex flex-wrap gap-0.5 sm:gap-1 justify-center mt-auto pt-1.5">
                        {dayJobs.slice(0, 4).map(j => (
                          <span key={j.id} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${TYPE_KEY[j.type].dot}`} />
                        ))}
                      </div>
                      {dayJobs.length > 0 && (
                        <div className={`text-[9px] sm:text-[10px] mt-0.5 ${isToday ? "opacity-90" : "text-ink-muted"}`}>
                          {dayJobs.length} job{dayJobs.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Color key legend */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4 pt-3 border-t border-border">
                <span className="text-[10px] font-bold uppercase text-ink-muted">Key:</span>
                {Object.values(TYPE_KEY).map(t => (
                  <div key={t.label} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${t.dot}`} />
                    <span className="text-[11px] sm:text-xs font-medium">{t.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── Pending Requests ─────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h2 className="text-base sm:text-lg font-bold">Pending Requests</h2>
              <Badge className="bg-warning/15 text-warning hover:bg-warning/20">{MOCK_REQUESTS.length} new</Badge>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {MOCK_REQUESTS.map(r => (
                <Card key={r.id} className="rounded-2xl border-l-4 border-l-warning">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${TYPE_KEY[r.type].chip}`}>{r.type}</span>
                      <Badge variant="secondary" className="font-semibold ml-auto">${r.credits}</Badge>
                    </div>
                    <div className="font-semibold text-sm">{r.time} · {r.client}</div>
                    <div className="text-xs text-ink-muted flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="h-3 w-3 shrink-0" />{r.addr}
                    </div>
                    <div className="text-[10px] text-warning font-semibold mt-1">⏱ {r.expires}</div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button size="sm" variant="outline" className="w-full"><X className="h-4 w-4 mr-1" />Decline</Button>
                      <Button size="sm" className="w-full"><Check className="h-4 w-4 mr-1" />Accept</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ── Accepted Jobs ────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h2 className="text-base sm:text-lg font-bold">Accepted Jobs</h2>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/15">{acceptedJobs.length} upcoming</Badge>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {acceptedJobs.map(j => (
                <button key={j.id} onClick={() => setOpenJob(j)} className="w-full text-left">
                  <Card className="rounded-2xl hover:shadow-wf-hover active:scale-[0.99] transition-all cursor-pointer">
                    <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                      <div className={`w-1.5 sm:w-2 h-12 rounded-full shrink-0 ${TYPE_KEY[j.type].dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${TYPE_KEY[j.type].chip}`}>{TYPE_KEY[j.type].label}</span>
                          {j.status === "in_progress" && (
                            <Badge className="bg-aero-aqua/20 text-pt-blue text-[10px] hover:bg-aero-aqua/25">In Progress</Badge>
                          )}
                          <span className="text-xs font-semibold ml-auto">${j.credits}</span>
                        </div>
                        <div className="text-sm font-semibold mt-1 truncate">{j.time} · {j.client}</div>
                        <div className="text-xs text-ink-muted truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" /> {j.addr}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-ink-muted shrink-0" />
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* ── Job Modal (Drawer on mobile, Dialog on desktop) ── */}
        {isMobile ? (
          <Drawer open={!!openJob} onOpenChange={(o) => !o && close()}>
            <DrawerContent className="px-4 pb-6 max-h-[92dvh] overflow-y-auto">
              {openJob && (
                <>
                  <DrawerHeader className="px-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${TYPE_KEY[openJob.type].chip}`}>{openJob.type}</span>
                      {openJob.status === "in_progress" && <Badge className="bg-aero-aqua/20 text-pt-blue">In Progress</Badge>}
                    </div>
                    <DrawerTitle>{openJob.type} · {openJob.time}</DrawerTitle>
                    <DrawerDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {openJob.addr} · {openJob.client}
                    </DrawerDescription>
                  </DrawerHeader>
                  <JobModalBody />
                </>
              )}
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={!!openJob} onOpenChange={(o) => !o && close()}>
            <DialogContent className="max-w-xl rounded-3xl">
              {openJob && (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${TYPE_KEY[openJob.type].chip}`}>{openJob.type}</span>
                      {openJob.status === "in_progress" && <Badge className="bg-aero-aqua/20 text-pt-blue">In Progress</Badge>}
                    </div>
                    <DialogTitle>{openJob.type} · {openJob.time}</DialogTitle>
                    <DialogDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {openJob.addr} · {openJob.client}
                    </DialogDescription>
                  </DialogHeader>
                  <JobModalBody />
                </>
              )}
            </DialogContent>
          </Dialog>
        )}
      </CleanerLayout>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Job modal body (shared between Drawer and Dialog)                   */
/* ------------------------------------------------------------------ */
function JobModalBody() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase text-ink-muted">Job Flow</div>
        <div className="grid grid-cols-2 gap-2">
          <Button className="w-full"><Navigation className="h-4 w-4 mr-1" />On My Way</Button>
          <Button variant="outline" className="w-full"><PlayCircle className="h-4 w-4 mr-1" />Clock In</Button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button className="aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-1 text-ink-muted hover:text-primary transition-colors">
            <Camera className="h-5 w-5" />
            <span className="text-xs font-semibold">Before photos</span>
          </button>
          <button className="aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-1 text-ink-muted hover:text-primary transition-colors">
            <Upload className="h-5 w-5" />
            <span className="text-xs font-semibold">After photos</span>
          </button>
        </div>

        <Button variant="success" className="w-full mt-1">
          <StopCircle className="h-4 w-4 mr-1" />Finalize · Clock Out & Send
        </Button>
      </div>

      <div className="pt-3 border-t border-border space-y-2">
        <div className="text-[11px] font-bold uppercase text-ink-muted">Manage</div>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm"><MessageSquare className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Message</span></Button>
          <Button variant="outline" size="sm"><RotateCcw className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Reschedule</span></Button>
          <Button variant="destructive" size="sm"><XCircle className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Cancel</span></Button>
        </div>
      </div>
    </div>
  );
}
