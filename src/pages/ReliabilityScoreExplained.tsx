
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, CheckCircle, Clock, Camera, MessageSquare, Star, XCircle, AlertTriangle, DollarSign, Zap, Shield, Info, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { SEO } from '@/components/seo';
import React from 'react';

const TIERS = [
  { tier: "Bronze", range: "0–49", rate: "$20–35/hr", color: "from-amber-700 to-amber-500", icon: "🥉", features: ["Standard marketplace access", "Basic job matching", "Standard support", "Platform fee: 20%"] },
  { tier: "Silver", range: "50–69", rate: "$30–50/hr", color: "from-slate-500 to-slate-400", icon: "🥈", features: ["Improved visibility", "Priority job matching", "Full marketplace access", "Platform fee: 18%"] },
  { tier: "Gold", range: "70–89", rate: "$40–65/hr", color: "from-yellow-600 to-yellow-400", icon: "🥇", features: ["Top search results", "Premium client matching", "Early notifications", "Platform fee: 17%"] },
  { tier: "Platinum", range: "90–100", rate: "$50–100/hr", color: "from-violet-600 to-violet-400", icon: "💎", features: ["VIP client access", "Exclusive job offers", "Maximum earnings", "Platform fee: 15%"] },
];

const SCORING_FACTORS = [
  { icon: CheckCircle, name: "Job Completion", points: 35, desc: "Complete every assigned job. This is the single most important factor.", color: "text-success", bg: "bg-success/10" },
  { icon: Clock, name: "On-Time Check-In", points: 25, desc: "GPS check-in within 15 minutes of the scheduled start time.", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Camera, name: "Photo Compliance", points: 20, desc: "Upload both before AND after photos on every completed job.", color: "text-violet-500", bg: "bg-violet-500/10" },
  { icon: Star, name: "Client Rating", points: 15, desc: "Average star rating from client reviews (0–5 stars).", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: CheckCircle, name: "No Cancellations", points: 5, desc: "Low cancellation rate — avoid canceling jobs you've accepted.", color: "text-cyan-500", bg: "bg-cyan-500/10" },
];

const PENALTIES = [
  { name: "No-Shows", pts: "-15", desc: "Missing a scheduled job without notice — the most severe penalty." },
  { name: "Late Cancellations", pts: "-8", desc: "Canceling within 24 hours of job start." },
  { name: "Disputes Lost", pts: "-10", desc: "Client disputes resolved in the client's favor." },
];

const QUICK_WINS = [
  { icon: Clock, title: "Arrive 10 Minutes Early", desc: "GPS check-in on arrival. On-time check-ins are the easiest points to earn." },
  { icon: Camera, title: "Take Clear Photos", desc: "Before/after every room with good lighting and clear angles." },
  { icon: MessageSquare, title: "Message Proactively", desc: "Send a quick message when on your way. Clients love it." },
  { icon: Star, title: "Go the Extra Mile", desc: "Small touches like straightening pillows lead to 5-star reviews." },
];

export default function ReliabilityScoreExplained() {
  return (
    <main className="min-h-screen bg-background">
      <SEO title="Reliability Score Explained — How PureTask Ranks Cleaners" description="Discover how PureTask's Reliability Score ranks cleaners on punctuality, photo compliance, and client ratings. Bronze to Platinum — higher score means better jobs and pay." url="/reliability-score" image="/og/og-reliability-score.jpg" />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute top-20 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/25">
              <TrendingUp className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4">Reliability Score</h1>
            <p className="text-xl text-muted-foreground">Your score (0–100) determines your tier, earning potential, and visibility to clients</p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl pb-20 space-y-12">
        {/* Tier System */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Award className="h-5 w-5 text-primary" /></div>
            <h2 className="text-2xl font-bold">Tier System</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIERS.map((t, i) => (
              <motion.div key={t.tier} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="overflow-hidden hover:shadow-elevated transition-all border-border/60">
                  <div className={`h-2 bg-gradient-to-r ${t.color}`} />
                  <CardContent className="p-5">
                    <div className="text-center mb-4">
                      <div className="text-3xl mb-2">{t.icon}</div>
                      <h3 className="font-bold text-lg">{t.tier}</h3>
                      <p className="text-sm font-semibold text-primary">{t.range} pts</p>
                      <p className="text-xs text-muted-foreground">{t.rate}/hr</p>
                    </div>
                    <ul className="space-y-1.5">
                      {t.features.map((f, fi) => (
                        <li key={fi} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />{f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Scoring Factors */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Star className="h-5 w-5 text-primary" /></div>
            <h2 className="text-2xl font-bold">How Your Score is Calculated</h2>
          </div>
          <div className="space-y-3">
            {SCORING_FACTORS.map((f, i) => (
              <motion.div key={f.name} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/60 bg-card hover:shadow-soft transition-all">
                  <div className={`h-12 w-12 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0`}>
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold">{f.name}</h4>
                      <Badge className="bg-success/10 text-success border-success/30">+{f.points} pts</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                  <div className="hidden sm:block">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r from-primary to-violet-600 rounded-full`} style={{ width: `${f.points}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground text-right mt-1">{f.points}%</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Penalties */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3"><AlertTriangle className="h-5 w-5 text-destructive" /><h3 className="font-bold text-lg">Penalties to Avoid</h3></div>
            <div className="grid md:grid-cols-3 gap-3">
              {PENALTIES.map((p) => (
                <div key={p.name} className="flex items-start gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{p.name}</h4>
                      <Badge variant="destructive" className="text-xs">{p.pts} pts</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Quick Wins */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Zap className="h-5 w-5 text-primary" /></div>
            <h2 className="text-2xl font-bold">Easy Wins to Boost Your Score</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {QUICK_WINS.map((w, i) => (
              <motion.div key={w.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="flex items-start gap-4 p-5 rounded-2xl border border-border/60 bg-card hover:shadow-soft hover:border-primary/30 transition-all">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><w.icon className="h-6 w-6 text-primary" /></div>
                  <div><h4 className="font-bold mb-1">{w.title}</h4><p className="text-sm text-muted-foreground">{w.desc}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Benefits CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Card className="overflow-hidden border-0">
            <div className="bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-10 text-center text-white">
              <Crown className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h2 className="text-3xl font-bold mb-3">Reach Platinum & Maximize Earnings</h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-6">Platinum cleaners earn the highest rates ($50–100/hr), get first access to premium jobs, and pay the lowest platform fee (15%)</p>
              <div className="flex flex-wrap gap-4 justify-center">
                {["Up to $100/hr", "First on marketplace", "VIP client access", "15% platform fee"].map((b) => (
                  <Badge key={b} className="bg-white/20 text-white border-white/30 text-sm px-4 py-1.5">{b}</Badge>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
