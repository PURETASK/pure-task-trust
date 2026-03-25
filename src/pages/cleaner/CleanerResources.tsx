import { useState } from "react";
import { Link } from "react-router-dom";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  FileText, TrendingUp, ShoppingBag, Lightbulb, Star, Clock,
  CheckCircle, Download, Mail, Printer, Shield, Zap, HeartHandshake,
  Camera, Lock, Sparkles, ChevronRight, BookOpen, ListChecks, ArrowRight, Calculator, DollarSign
} from "lucide-react";
import { toast } from "sonner";

/* ─── DATA ─────────────────────────────────────────────────── */

const CHECKLISTS = [
  {
    id: "standard",
    title: "Standard Cleaning Checklist",
    desc: "Room-by-room guide for a thorough standard clean",
    pages: "2 pages",
    color: "border-primary/40 bg-primary/5",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    badge: "Standard",
    badgeColor: "bg-primary/10 text-primary border-primary/30",
    rooms: ["Living Room", "Kitchen", "Bathroom", "Bedroom", "Hallways"],
  },
  {
    id: "deep",
    title: "Deep Clean Checklist",
    desc: "Comprehensive deep cleaning task list for every surface",
    pages: "3 pages",
    color: "border-[hsl(var(--pt-purple))]/40 bg-[hsl(var(--pt-purple))]/5",
    iconBg: "bg-[hsl(var(--pt-purple))]/10",
    iconColor: "text-[hsl(var(--pt-purple))]",
    badge: "Deep Clean",
    badgeColor: "bg-[hsl(var(--pt-purple))]/10 text-[hsl(var(--pt-purple))] border-[hsl(var(--pt-purple))]/30",
    rooms: ["Kitchen Appliances", "Baseboards", "Window Sills", "Under Furniture", "Grout & Tiles"],
  },
  {
    id: "moveout",
    title: "Move-Out Cleaning Guide",
    desc: "Ensure nothing is missed on move-out jobs",
    pages: "4 pages",
    color: "border-warning/40 bg-warning/5",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    badge: "Move-Out",
    badgeColor: "bg-warning/10 text-warning border-warning/30",
    rooms: ["Full Kitchen Deep", "Carpets & Floors", "All Fixtures", "Closets & Cabinets", "Outdoor Areas"],
  },
  {
    id: "safety",
    title: "Safety & Health Guidelines",
    desc: "Health, safety, and chemical handling information",
    pages: "5 pages",
    color: "border-success/40 bg-success/5",
    iconBg: "bg-success/10",
    iconColor: "text-success",
    badge: "Required",
    badgeColor: "bg-success/10 text-success border-success/30",
    rooms: ["Chemical Safety", "PPE Requirements", "Ventilation", "Spill Protocols", "Emergency Contacts"],
  },
];

const GROWTH_ITEMS = [
  {
    title: "How to Reach Gold Tier",
    desc: "Step-by-step strategy to advance your tier and unlock higher earnings",
    icon: TrendingUp,
    time: "12 min read",
    color: "border-warning/40 bg-warning/5",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    tag: "Strategy",
    tagColor: "bg-warning/10 text-warning border-warning/30",
  },
  {
    title: "Maximising Your Reliability Score",
    desc: "Every scoring factor explained with actionable improvement tips",
    icon: Star,
    time: "8 min read",
    color: "border-primary/40 bg-primary/5",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    tag: "Guide",
    tagColor: "bg-primary/10 text-primary border-primary/30",
  },
  {
    title: "Building Your Client Base",
    desc: "How top cleaners turn single bookings into loyal regulars",
    icon: Zap,
    time: "18 min read",
    color: "border-[hsl(var(--pt-purple))]/40 bg-[hsl(var(--pt-purple))]/5",
    iconBg: "bg-[hsl(var(--pt-purple))]/10",
    iconColor: "text-[hsl(var(--pt-purple))]",
    tag: "Advanced",
    tagColor: "bg-[hsl(var(--pt-purple))]/10 text-[hsl(var(--pt-purple))] border-[hsl(var(--pt-purple))]/30",
  },
  {
    title: "Photo Documentation Pro Tips",
    desc: "How to take compelling before & after photos that impress clients",
    icon: Camera,
    time: "10 min read",
    color: "border-success/40 bg-success/5",
    iconBg: "bg-success/10",
    iconColor: "text-success",
    tag: "Popular",
    tagColor: "bg-success/10 text-success border-success/30",
  },
  {
    title: "Customer Service Excellence",
    desc: "How to consistently exceed client expectations and earn 5-star reviews",
    icon: HeartHandshake,
    time: "15 min read",
    color: "border-warning/40 bg-warning/5",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    tag: "Essential",
    tagColor: "bg-warning/10 text-warning border-warning/30",
  },
  {
    title: "Setting the Right Rate",
    desc: "Pricing strategy to attract quality clients while maximising your income",
    icon: Sparkles,
    time: "9 min read",
    color: "border-primary/40 bg-primary/5",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    tag: "Finance",
    tagColor: "bg-primary/10 text-primary border-primary/30",
  },
];

const PRO_TIPS = [
  { tip: "Always arrive 5 minutes early — punctuality is the #1 factor clients mention in 5-star reviews.", icon: Clock, color: "text-primary", bg: "bg-primary/10" },
  { tip: "Take before & after photos for every room. Cleaners with photo proof earn 23% more repeat bookings.", icon: Camera, color: "text-[hsl(var(--pt-purple))]", bg: "bg-[hsl(var(--pt-purple))]/10" },
  { tip: "Send a quick 'on my way' message before departure — clients love the communication.", icon: HeartHandshake, color: "text-success", bg: "bg-success/10" },
  { tip: "Ask about allergies and preferences on your first job with a new client — then remember them.", icon: Star, color: "text-warning", bg: "bg-warning/10" },
  { tip: "Leave a small personal touch: arranged pillows, folded towels, a note. It creates lasting impressions.", icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  { tip: "Set your rate at the upper end of your tier range — clients associate higher rates with higher quality.", icon: TrendingUp, color: "text-warning", bg: "bg-warning/10" },
];

/* ─── EMAIL MODAL ───────────────────────────────────────────── */
function EmailModal({ checklist, onClose }: { checklist: typeof CHECKLISTS[0] | null; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  if (!checklist) return null;

  const handleSend = async () => {
    if (!email.includes("@")) { toast.error("Please enter a valid email address"); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    toast.success(`"${checklist.title}" sent to ${email}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-3xl border-2 border-border/60 shadow-xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">Send to Email</h3>
            <p className="text-xs text-muted-foreground">{checklist.title}</p>
          </div>
        </div>
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="mb-4 rounded-xl border-2"
        />
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-2xl border-2" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 rounded-2xl" onClick={handleSend} disabled={sending}>
            {sending ? "Sending…" : <><Mail className="h-4 w-4 mr-1.5" />Send</>}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── CHECKLIST CARD ────────────────────────────────────────── */
function ChecklistCard({ item, onEmail, onPrint }: {
  item: typeof CHECKLISTS[0];
  onEmail: () => void;
  onPrint: () => void;
}) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className={`border-2 ${item.color} rounded-3xl h-full`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className={`h-11 w-11 rounded-2xl ${item.iconBg} flex items-center justify-center flex-shrink-0 border-2 border-current/10`}>
              <FileText className={`h-5 w-5 ${item.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-sm leading-snug">{item.title}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor} flex-shrink-0`}>{item.badge}</span>
              </div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>

          {/* Rooms preview */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.rooms.map(r => (
              <span key={r} className="text-xs bg-muted/60 rounded-full px-2 py-0.5 text-muted-foreground">{r}</span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />{item.pages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 px-3 rounded-xl border-2 text-xs gap-1.5" onClick={onEmail}>
                <Mail className="h-3.5 w-3.5" />Email
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-3 rounded-xl border-2 text-xs gap-1.5" onClick={onPrint}>
                <Printer className="h-3.5 w-3.5" />Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── MAIN PAGE ─────────────────────────────────────────────── */
export default function CleanerResources() {
  const [emailTarget, setEmailTarget] = useState<typeof CHECKLISTS[0] | null>(null);

  const handlePrint = (item: typeof CHECKLISTS[0]) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>${item.title}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        p  { color: #666; margin-bottom: 24px; }
        ul { padding-left: 20px; line-height: 2; }
        li { border-bottom: 1px solid #eee; padding: 4px 0; }
        .footer { margin-top: 40px; font-size: 11px; color: #aaa; text-align: center; }
      </style></head><body>
      <h1>${item.title}</h1>
      <p>${item.desc}</p>
      <h3>Key Sections:</h3>
      <ul>${item.rooms.map(r => `<li>${r}</li>`).join("")}</ul>
      <div class="footer">PureTask — Printed ${new Date().toLocaleDateString()}</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <CleanerLayout>
      {emailTarget && <EmailModal checklist={emailTarget} onClose={() => setEmailTarget(null)} />}

      <div className="space-y-8 max-w-5xl">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/8 via-background to-[hsl(var(--pt-purple))]/5 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Resources & Education</h1>
                <p className="text-sm text-muted-foreground">Checklists, growth guides, and partner perks</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: "Checklists", value: "4", color: "text-success", bg: "bg-success/10 border-success/30" },
                { label: "Growth Guides", value: "6", color: "text-warning", bg: "bg-warning/10 border-warning/30" },
                { label: "Pro Tips", value: "6", color: "text-[hsl(var(--pt-purple))]", bg: "bg-[hsl(var(--pt-purple))]/10 border-[hsl(var(--pt-purple))]/30" },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <div className={`rounded-2xl border-2 ${s.bg} p-3 text-center`}>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="checklists" className="w-full">
          <TabsList className="w-full sm:w-auto mb-6 rounded-2xl border-2 border-border/50 bg-muted/50 p-1.5 h-auto flex flex-wrap gap-1">
            <TabsTrigger value="checklists" className="flex-1 sm:flex-none rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-success data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <FileText className="h-4 w-4 mr-1.5" />Checklists
            </TabsTrigger>
            <TabsTrigger value="scope" className="flex-1 sm:flex-none rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <ListChecks className="h-4 w-4 mr-1.5" />Scope Guide
            </TabsTrigger>
            <TabsTrigger value="growth" className="flex-1 sm:flex-none rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-warning data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <TrendingUp className="h-4 w-4 mr-1.5" />Growth
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex-1 sm:flex-none rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-[hsl(var(--pt-purple))] data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Lightbulb className="h-4 w-4 mr-1.5" />Pro Tips
            </TabsTrigger>
            <TabsTrigger value="partners" className="flex-1 sm:flex-none rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <ShoppingBag className="h-4 w-4 mr-1.5" />Partners
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex-1 sm:flex-none rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-success data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Calculator className="h-4 w-4 mr-1.5" />Calculator
            </TabsTrigger>
          </TabsList>

          {/* ── Checklists Tab ── */}
          <TabsContent value="checklists">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-2xl bg-success/10 border-2 border-success/30 flex items-center justify-center">
                  <FileText className="h-4.5 w-4.5 text-success" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Documents & Checklists</h2>
                  <p className="text-xs text-muted-foreground">Email or print any checklist instantly</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {CHECKLISTS.map((item) => (
                  <ChecklistCard
                    key={item.id}
                    item={item}
                    onEmail={() => setEmailTarget(item)}
                    onPrint={() => handlePrint(item)}
                  />
                ))}
              </div>
              <div className="mt-4 rounded-2xl border-2 border-success/20 bg-success/5 p-4 flex items-start gap-3">
                <Shield className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">All checklists are aligned with PureTask quality standards. Using them consistently helps maintain your reliability score.</p>
              </div>
            </motion.div>
          </TabsContent>

          {/* ── Scope Guide Tab ── */}
          <TabsContent value="scope">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <ListChecks className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Cleaning Scope Guide</h2>
                  <p className="text-xs text-muted-foreground">What's included in each service type</p>
                </div>
              </div>

              {/* Service cards */}
              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                {[
                  { emoji: '🏠', label: 'Basic Clean', duration: '2–3 hrs', tasks: ['Kitchen countertops & appliance exteriors', 'Bathroom disinfect & mop', 'Beds made, surfaces dusted', 'Floors vacuumed/mopped', 'All trash emptied'], color: 'border-primary/30 bg-primary/5', badge: 'bg-primary/10 text-primary border-primary/20' },
                  { emoji: '✨', label: 'Deep Clean', duration: '4–6 hrs', tasks: ['Everything in Basic, plus:', 'Baseboards & ceiling fans', 'Interior windows & sills', 'Inside microwave & cabinets', 'Door frames & wall wipe-down'], color: 'border-[hsl(280,70%,50%)]/30 bg-[hsl(280,70%,50%)]/5', badge: 'bg-[hsl(280,70%,50%)]/10 text-[hsl(280,70%,50%)] border-[hsl(280,70%,50%)]/20' },
                  { emoji: '📦', label: 'Move-Out', duration: '4–6+ hrs', tasks: ['Full Deep Clean scope', 'Inside oven & fridge', 'All blinds & shutters', 'Closets & cabinet interiors', 'Garage & patio sweep'], color: 'border-warning/30 bg-warning/5', badge: 'bg-warning/10 text-warning border-warning/20' },
                  { emoji: '🏨', label: 'Airbnb Turnover', duration: '2–4 hrs', tasks: ['Strip & remake all beds', 'Full bathroom sanitise', 'Kitchen guest-ready reset', 'Restock consumables', 'Photo documentation for host'], color: 'border-success/30 bg-success/5', badge: 'bg-success/10 text-success border-success/20' },
                ].map(s => (
                  <div key={s.label} className={`rounded-2xl border-2 p-4 ${s.color}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{s.emoji}</span>
                        <span className="font-bold text-sm">{s.label}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${s.badge}`}>
                        {s.duration}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {s.tasks.map(t => (
                        <li key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <Button asChild className="w-full rounded-2xl font-bold border-2" variant="outline">
                <Link to="/cleaning-scope">
                  <ListChecks className="h-4 w-4 mr-2" />
                  View Full Scope Guide <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
            </motion.div>
          </TabsContent>


          <TabsContent value="growth">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-2xl bg-warning/10 border-2 border-warning/30 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Growth & Advancement</h2>
                  <p className="text-xs text-muted-foreground">Strategies from our top-earning cleaners</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {GROWTH_ITEMS.map((item, i) => (
                  <motion.div key={item.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }}>
                    <Card className={`border-2 ${item.color} rounded-3xl h-full cursor-pointer group`}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className={`h-11 w-11 rounded-2xl ${item.iconBg} flex items-center justify-center flex-shrink-0 border-2 border-current/10`}>
                            <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <h3 className="font-bold text-sm leading-snug">{item.title}</h3>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${item.tagColor}`}>{item.tag}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{item.desc}</p>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />{item.time}
                              </span>
                              <ChevronRight className={`h-4 w-4 ${item.iconColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* ── Pro Tips Tab ── */}
          <TabsContent value="tips">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-2xl bg-[hsl(var(--pt-purple))]/10 border-2 border-[hsl(var(--pt-purple))]/30 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-[hsl(var(--pt-purple))]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Pro Tips from Top Cleaners</h2>
                  <p className="text-xs text-muted-foreground">Collected from our highest-rated professionals</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {PRO_TIPS.map((tip, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className="border-2 border-[hsl(var(--pt-purple))]/20 bg-[hsl(var(--pt-purple))]/4 rounded-3xl">
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className={`h-9 w-9 rounded-xl ${tip.bg} flex items-center justify-center flex-shrink-0`}>
                          <tip.icon className={`h-4 w-4 ${tip.color}`} />
                        </div>
                        <p className="text-sm leading-relaxed">{tip.tip}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* ── Partners Tab — Coming Soon ── */}
          <TabsContent value="partners">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/6 via-background to-[hsl(var(--pt-purple))]/5 p-10 sm:p-16 text-center">
                <motion.div
                  animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="h-20 w-20 rounded-3xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6"
                >
                  <ShoppingBag className="h-9 w-9 text-primary" />
                </motion.div>
                <Badge className="mb-4 px-4 py-1 rounded-full border-2 border-primary/30 bg-primary/10 text-primary font-bold text-sm">Coming Soon</Badge>
                <h2 className="text-2xl font-bold mb-3">Partner Discounts</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
                  We're partnering with top cleaning supply brands to bring you exclusive discounts on products and equipment. Check back soon for special deals just for PureTask cleaners.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
                  {["Cleaning Supplies", "Equipment & Tools", "Eco Products", "Safety Gear"].map((cat, i) => (
                    <div key={cat} className="rounded-2xl border-2 border-border/50 bg-muted/30 p-3 text-center">
                      <Lock className="h-4 w-4 text-muted-foreground mx-auto mb-1.5" />
                      <p className="text-xs text-muted-foreground font-medium">{cat}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* ── Help Footer ── */}
        <Card className="rounded-3xl border-2 border-border/50 bg-gradient-to-r from-primary/4 to-muted/20">
          <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold mb-0.5">Need more help?</h3>
              <p className="text-sm text-muted-foreground">Our support team is available 7 days a week</p>
            </div>
            <Button variant="outline" className="rounded-2xl border-2 gap-2 flex-shrink-0">
              <HeartHandshake className="h-4 w-4" />Contact Support
            </Button>
          </CardContent>
        </Card>

      </div>
    </CleanerLayout>
  );
}
