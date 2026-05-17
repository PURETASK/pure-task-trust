import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChevronLeft, ChevronRight, Clock, MapPin, Navigation, Zap,
  TrendingUp, Calendar as CalendarIcon, DollarSign, Timer, Route,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */
const MOCK_JOBS = [
  { id: "1", day: 4, time: "9:00 AM", end: "11:30 AM", type: "Standard", status: "confirmed", addr: "902 Riverstone Dr", client: "Sarah J.", credits: 70 },
  { id: "2", day: 4, time: "1:00 PM", end: "3:30 PM", type: "Deep Clean", status: "in_progress", addr: "14 Sky Ridge", client: "TechCorp HQ", credits: 120 },
  { id: "3", day: 6, time: "10:00 AM", end: "12:00 PM", type: "Standard", status: "confirmed", addr: "782 Bluebell Ave", client: "Marcus T.", credits: 65 },
  { id: "4", day: 8, time: "2:00 PM", end: "4:30 PM", type: "Move-out", status: "pending", addr: "12 Ocean View Dr", client: "Linda K.", credits: 95 },
  { id: "5", day: 10, time: "9:00 AM", end: "11:00 AM", type: "Standard", status: "confirmed", addr: "55 Pine St", client: "Jen M.", credits: 70 },
];

const STATUS_DOT: Record<string, string> = {
  confirmed: "bg-primary",
  in_progress: "bg-aero-aqua",
  pending: "bg-warning",
  completed: "bg-success",
};

/* ------------------------------------------------------------------ */
/* VERSION A — Command Center                                          */
/* ------------------------------------------------------------------ */
function VersionA() {
  return (
    <div className="space-y-6">
      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Jobs this week", v: "12", tone: "bg-pt-blue/5 border-pt-blue/15 text-pt-blue" },
          { l: "Hours booked", v: "34.5", tone: "bg-primary/5 border-primary/15 text-primary" },
          { l: "Projected", v: "$1,240", tone: "bg-aero-aqua/10 border-aero-aqua/30 text-pt-blue" },
          { l: "Utilization", v: "82%", tone: "bg-muted border-border text-foreground" },
        ].map((s) => (
          <Card key={s.l} className={`rounded-2xl border ${s.tone}`}>
            <CardContent className="p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{s.l}</div>
              <div className="text-2xl font-bold mt-1">{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today focus + mini cal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 rounded-3xl bg-pt-blue text-white border-0 overflow-hidden relative">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-aero-aqua/20 blur-2xl" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-wider opacity-70">Next Job</div>
                <h3 className="text-2xl font-bold mt-1">Deep Clean · 1:00 PM</h3>
                <div className="flex items-center gap-2 mt-2 text-sm opacity-90">
                  <MapPin className="h-4 w-4" /> 14 Sky Ridge · TechCorp HQ
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-aero-aqua">42m</div>
                <div className="text-[10px] uppercase opacity-70">Countdown</div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="bg-aero-aqua text-pt-blue hover:bg-aero-aqua/90"><Navigation className="h-4 w-4 mr-1" /> On my way</Button>
              <Button variant="glass">Travel: 15 min</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="p-4">
            <div className="text-xs font-bold uppercase text-ink-muted mb-3">May 2026</div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["S","M","T","W","T","F","S"].map((d,i)=>(<div key={i} className="text-[10px] text-ink-muted py-1">{d}</div>))}
              {Array.from({length:31}).map((_,i)=>{
                const day=i+1;
                const dayJobs=MOCK_JOBS.filter(j=>j.day===day);
                const isToday=day===4;
                return (
                  <div key={i} className={`aspect-square rounded-md text-xs flex flex-col items-center justify-center relative ${isToday?"bg-primary text-primary-foreground font-bold":"text-foreground hover:bg-muted"}`}>
                    {day}
                    {dayJobs.length>0 && (
                      <div className="flex gap-0.5 absolute bottom-1">
                        {dayJobs.slice(0,3).map((j,idx)=>(<div key={idx} className={`w-1 h-1 rounded-full ${isToday?"bg-white":STATUS_DOT[j.status]}`} />))}
                      </div>
                    )}
                    {dayJobs.length>1 && <div className="absolute -top-0.5 -right-0.5 text-[8px] bg-aero-aqua text-pt-blue rounded-full w-3 h-3 flex items-center justify-center font-bold">+{dayJobs.length-1}</div>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming list compact */}
      <Card className="rounded-3xl">
        <CardContent className="p-4 space-y-2">
          <div className="text-xs font-bold uppercase text-ink-muted mb-2">Upcoming</div>
          {MOCK_JOBS.map(j=>(
            <div key={j.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted">
              <div className={`w-2 h-10 rounded-full ${STATUS_DOT[j.status]}`} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{j.type} · {j.time}</div>
                <div className="text-xs text-ink-muted truncate">{j.addr} · {j.client}</div>
              </div>
              <Badge variant="secondary" className="font-semibold">${j.credits}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* VERSION B — Agenda Timeline                                         */
/* ------------------------------------------------------------------ */
function VersionB() {
  const days = [
    { label: "Today · Mon, May 4", jobs: MOCK_JOBS.filter(j=>j.day===4) },
    { label: "Wed, May 6", jobs: MOCK_JOBS.filter(j=>j.day===6) },
    { label: "Fri, May 8", jobs: MOCK_JOBS.filter(j=>j.day===8) },
    { label: "Sun, May 10", jobs: MOCK_JOBS.filter(j=>j.day===10) },
  ];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="inline-flex p-1 rounded-2xl bg-muted">
          <button className="px-4 py-1.5 text-sm font-semibold rounded-xl text-ink-muted">Month</button>
          <button className="px-4 py-1.5 text-sm font-semibold rounded-xl text-ink-muted">Week</button>
          <button className="px-4 py-1.5 text-sm font-semibold rounded-xl bg-background text-primary shadow-sm">Agenda</button>
        </div>
        <Badge className="bg-primary/10 text-primary hover:bg-primary/15">This week: $420</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-6">
          {days.map((d,i)=>(
            <div key={i}>
              <div className="sticky top-0 bg-background/95 backdrop-blur z-10 py-2 mb-3 flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${i===0?"bg-primary text-primary-foreground":"bg-muted text-foreground"}`}>{d.label}</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              {d.jobs.length===0 ? (
                <div className="ml-6 p-4 rounded-2xl border border-dashed border-border text-sm text-ink-muted italic">Time off · No jobs</div>
              ) : (
                <div className="relative ml-6 border-l-2 border-border pl-6 space-y-3">
                  {d.jobs.map(j=>(
                    <div key={j.id} className="relative">
                      <div className={`absolute -left-[31px] top-3 w-4 h-4 rounded-full border-4 border-background ${STATUS_DOT[j.status]}`} />
                      <Card className="rounded-2xl hover:border-primary transition-colors">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-primary">{j.time} – {j.end}</div>
                            <div className="font-semibold mt-0.5">{j.type}</div>
                            <div className="text-xs text-ink-muted">{j.addr}</div>
                          </div>
                          <Badge variant="secondary">${j.credits}</Badge>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="rounded-3xl">
            <CardContent className="p-5 text-center">
              <div className="text-[11px] font-bold uppercase text-ink-muted mb-3">Weekly Earnings</div>
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="stroke-muted fill-none" strokeWidth="3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path stroke="hsl(var(--primary))" className="fill-none" strokeWidth="3" strokeDasharray="70, 100" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xl font-bold">$840</div>
                  <div className="text-[10px] text-ink-muted">of $1.2k goal</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl">
            <CardContent className="p-4">
              <div className="text-[11px] font-bold uppercase text-ink-muted mb-2">May 2026</div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({length:14}).map((_,i)=>{
                  const day=i+1;
                  const has=MOCK_JOBS.some(j=>j.day===day);
                  return <div key={i} className={`aspect-square rounded-md flex items-center justify-center ${day===4?"bg-primary text-primary-foreground font-bold":has?"bg-primary/10 text-primary font-semibold":"text-ink-muted"}`}>{day}</div>;
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* VERSION C — Week Grid Planner                                        */
/* ------------------------------------------------------------------ */
function VersionC() {
  const hours = ["8 AM","10 AM","12 PM","2 PM","4 PM"];
  const days = ["Sun 3","Mon 4","Tue 5","Wed 6","Thu 7","Fri 8","Sat 9"];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Today</Button>
          <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
          <div className="font-semibold">May 3 – 9, 2026</div>
          <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <Badge className="bg-aero-aqua/20 text-pt-blue hover:bg-aero-aqua/30">34/40 hrs</Badge>
      </div>

      <Card className="rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="grid grid-cols-8 border-b border-border">
            <div className="p-3 text-[10px] font-bold uppercase text-ink-muted">Time</div>
            {days.map((d,i)=>(
              <div key={i} className={`p-3 text-center border-l border-border ${i===1?"bg-primary/5":""}`}>
                <div className="text-[10px] font-bold uppercase text-ink-muted">{d.split(" ")[0]}</div>
                <div className={`text-base font-bold ${i===1?"text-primary":""}`}>{d.split(" ")[1]}</div>
              </div>
            ))}
          </div>
          {/* Body */}
          <div className="grid grid-cols-8 relative" style={{minHeight:380}}>
            <div className="border-r border-border">
              {hours.map((h,i)=>(<div key={i} className="h-[76px] px-3 pt-1 text-[10px] text-ink-muted">{h}</div>))}
            </div>
            {days.map((_,colIdx)=>{
              const dayNum = colIdx + 3;
              const jobs = MOCK_JOBS.filter(j=>j.day===dayNum);
              return (
                <div key={colIdx} className="border-r border-border relative" style={{minHeight:380}}>
                  {/* hour lines */}
                  {hours.map((_,i)=>(<div key={i} className="h-[76px] border-b border-border/60" />))}
                  {/* jobs */}
                  {jobs.map((j,ji)=>{
                    // crude: pos by index
                    const top = 20 + ji*100;
                    return (
                      <div key={j.id} style={{top}} className={`absolute left-1 right-1 rounded-lg p-2 text-[10px] text-white shadow-tier-1 ${j.status==="in_progress"?"bg-pt-blue":"bg-primary"}`}>
                        <div className="font-bold">{j.time}</div>
                        <div className="opacity-90 truncate">{j.type}</div>
                      </div>
                    );
                  })}
                  {/* time-off Sat */}
                  {colIdx===6 && <div className="absolute inset-0 bg-muted/60" style={{backgroundImage:"repeating-linear-gradient(-45deg, transparent, transparent 8px, hsl(var(--border)) 8px, hsl(var(--border)) 10px)"}}><div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-ink-muted uppercase">Off</div></div>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-3xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase text-ink-muted">Weekly Utilization</div>
              <div className="text-2xl font-bold">34/40 <span className="text-sm text-ink-muted">hrs</span></div>
            </div>
            <div className="w-28 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-aero-aqua" style={{width:"85%"}} /></div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase text-ink-muted">Earnings Forecast</div>
              <div className="text-2xl font-bold text-success">$1,120</div>
            </div>
            <Badge className="bg-success/15 text-success hover:bg-success/20"><TrendingUp className="h-3 w-3 mr-1" />+12%</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* VERSION D — Map + Route                                              */
/* ------------------------------------------------------------------ */
function VersionD() {
  const stops = MOCK_JOBS.filter(j=>j.day===4);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><CalendarIcon className="h-4 w-4 mr-1" />Mon, May 4</Button>
          <Button size="sm"><Zap className="h-4 w-4 mr-1" /> Optimize route</Button>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="flex items-center gap-1 text-ink-muted"><Timer className="h-4 w-4" /> 32 min drive</span>
          <span className="flex items-center gap-1 text-ink-muted"><Route className="h-4 w-4" /> 14.2 mi</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{minHeight:520}}>
        {/* Stops list */}
        <div className="lg:col-span-2 space-y-3">
          {stops.map((j,i)=>(
            <div key={j.id} className="relative">
              <Card className={`rounded-2xl ${i===0?"border-2 border-primary":""}`}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${i===0?"bg-primary text-primary-foreground":"bg-muted text-foreground"}`}>{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-primary">{j.time} – {j.end}</div>
                    <div className="font-semibold">{j.type}</div>
                    <div className="text-xs text-ink-muted flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{j.addr}</div>
                    <div className="text-xs text-ink-muted">Client: {j.client}</div>
                  </div>
                  <Badge variant="secondary">${j.credits}</Badge>
                </CardContent>
              </Card>
              {i<stops.length-1 && (
                <div className="flex items-center gap-2 py-2 pl-4 text-[10px] font-bold text-ink-muted uppercase">
                  <Navigation className="h-3 w-3" /> 15 min drive · 4.2 mi
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Map placeholder */}
        <Card className="lg:col-span-3 rounded-3xl overflow-hidden relative" style={{minHeight:520}}>
          <div className="absolute inset-0 bg-aero-aqua/5" style={{backgroundImage:"radial-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px)", backgroundSize:"22px 22px"}} />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="none">
            <path d="M80 120 Q 200 200 220 280 T 340 400" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray="8 6" fill="none" />
          </svg>
          {/* Pins */}
          {stops.map((s,i)=>{
            const pos = [{l:"18%",t:"22%"},{l:"55%",t:"55%"},{l:"82%",t:"78%"}][i] ?? {l:"50%",t:"50%"};
            return (
              <div key={s.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-2" style={{left:pos.l, top:pos.t}}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-tier-2 border-2 border-white ${i===0?"bg-primary text-primary-foreground":"bg-pt-blue text-white"}`}>{i+1}</div>
                <div className="bg-white px-2 py-1 rounded-lg shadow-tier-1 border border-border text-[10px] font-semibold">{s.time}</div>
              </div>
            );
          })}
          <div className="absolute bottom-4 right-4 bg-white rounded-2xl p-3 shadow-tier-2 border border-border flex gap-4 text-xs">
            <div><div className="text-[9px] font-bold uppercase text-ink-muted">Today total</div><div className="font-bold text-base flex items-center"><DollarSign className="h-3 w-3" />190</div></div>
            <div><div className="text-[9px] font-bold uppercase text-ink-muted">Stops</div><div className="font-bold text-base">{stops.length}</div></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */
export default function CleanerMyCalendarPreview() {
  const [tab, setTab] = useState("a");
  return (
    <CleanerLayout>
      <Helmet>
        <title>My Schedule — Layout Previews | PureTask</title>
      </Helmet>

      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-3xl font-poppins font-bold tracking-tight">My Schedule — Pick a layout</h1>
          <p className="text-sm text-ink-muted">Click each tab to preview a different design direction. Tell me the letter you want and I'll ship it.</p>
        </header>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full rounded-2xl h-auto p-1">
            <TabsTrigger value="a" className="rounded-xl py-2.5 text-xs sm:text-sm">A · Command Center</TabsTrigger>
            <TabsTrigger value="b" className="rounded-xl py-2.5 text-xs sm:text-sm">B · Agenda Timeline</TabsTrigger>
            <TabsTrigger value="c" className="rounded-xl py-2.5 text-xs sm:text-sm">C · Week Grid</TabsTrigger>
            <TabsTrigger value="d" className="rounded-xl py-2.5 text-xs sm:text-sm">D · Map + Route</TabsTrigger>
          </TabsList>
          <TabsContent value="a" className="mt-5"><VersionA /></TabsContent>
          <TabsContent value="b" className="mt-5"><VersionB /></TabsContent>
          <TabsContent value="c" className="mt-5"><VersionC /></TabsContent>
          <TabsContent value="d" className="mt-5"><VersionD /></TabsContent>
        </Tabs>
      </div>
    </CleanerLayout>
  );
}