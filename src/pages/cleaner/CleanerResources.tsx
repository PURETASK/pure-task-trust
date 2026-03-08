import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  BookOpen, Video, FileText, ExternalLink, ShoppingBag, Award,
  Lightbulb, HeartHandshake, Search, Star, Clock, CheckCircle,
  PlayCircle, Download, Copy, Check, Zap, Shield, TrendingUp, Camera
} from "lucide-react";
import { toast } from "sonner";
import { useState as useLocalState } from "react";

const RESOURCES = [
  {
    category: "🎓 Training",
    color: "border-primary/20 bg-primary/3",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    items: [
      { title: "New Cleaner Onboarding", desc: "Essential guide for getting started on PureTask", icon: BookOpen, badge: "Required", badgeVariant: "destructive" as const, time: "20 min", type: "guide" },
      { title: "Deep Cleaning Masterclass", desc: "Advanced techniques for thorough, efficient cleaning", icon: Video, badge: "Video", badgeVariant: "secondary" as const, time: "45 min", type: "video" },
      { title: "Customer Service Excellence", desc: "How to consistently exceed client expectations", icon: HeartHandshake, badge: "Popular", badgeVariant: "default" as const, time: "15 min", type: "guide" },
      { title: "Photo Documentation Pro Tips", desc: "How to take great before & after photos every time", icon: Camera, badge: "New", badgeVariant: "default" as const, time: "10 min", type: "video" },
    ],
  },
  {
    category: "📄 Documents & Checklists",
    color: "border-success/20 bg-success/3",
    iconBg: "bg-success/10",
    iconColor: "text-success",
    items: [
      { title: "Standard Cleaning Checklist", desc: "Room-by-room guide for a thorough standard clean", icon: FileText, badge: "PDF", badgeVariant: "secondary" as const, time: "2 pages", type: "pdf" },
      { title: "Deep Clean Checklist", desc: "Comprehensive deep cleaning task list", icon: FileText, badge: "PDF", badgeVariant: "secondary" as const, time: "3 pages", type: "pdf" },
      { title: "Move-Out Cleaning Guide", desc: "Ensure nothing is missed on move-out jobs", icon: FileText, badge: "PDF", badgeVariant: "secondary" as const, time: "4 pages", type: "pdf" },
      { title: "Safety & Health Guidelines", desc: "Important health, safety, and chemical handling info", icon: Shield, badge: "Required", badgeVariant: "destructive" as const, time: "5 pages", type: "pdf" },
    ],
  },
  {
    category: "📈 Growth & Advancement",
    color: "border-warning/20 bg-warning/3",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    items: [
      { title: "How to Reach Gold Tier", desc: "Step-by-step strategy to advance your tier", icon: TrendingUp, badge: "Strategy", badgeVariant: "secondary" as const, time: "12 min", type: "guide" },
      { title: "Maximizing Your Reliability Score", desc: "Every factor explained with improvement tips", icon: Star, badge: "Guide", badgeVariant: "default" as const, time: "8 min", type: "guide" },
      { title: "Building Your Client Base", desc: "How top cleaners turn single bookings into regulars", icon: Zap, badge: "Advanced", badgeVariant: "secondary" as const, time: "18 min", type: "guide" },
    ],
  },
];

const DISCOUNTS = [
  { brand: "CleanCo Supplies", discount: "20% off", desc: "Professional cleaning products", code: "PURETASK20", color: "from-primary/10 to-primary/5 border-primary/20" },
  { brand: "EcoClean Pro", discount: "15% off", desc: "Eco-friendly cleaning solutions", code: "PURE15", color: "from-success/10 to-success/5 border-success/20" },
  { brand: "ProGear Tools", discount: "25% off", desc: "Professional equipment & tools", code: "PTPRO25", color: "from-warning/10 to-warning/5 border-warning/20" },
  { brand: "MicroFiber World", discount: "30% off", desc: "Premium cloths, mops & accessories", code: "PT30", color: "from-muted/60 to-muted/30 border-border" },
];

const TIPS = [
  { tip: "Always arrive 5 minutes early — punctuality is the #1 factor clients mention in 5-star reviews.", icon: Clock },
  { tip: "Take before & after photos for every room. Cleaners with photo proof earn 23% more repeat bookings.", icon: Camera },
  { tip: "Send a quick 'on my way' message before departure — clients love the communication.", icon: HeartHandshake },
  { tip: "Ask about allergies and preferences on your first job with a new client — then remember them.", icon: Star },
  { tip: "Leave a small personal touch: arranged pillows, folded towels, a note. It creates lasting impressions.", icon: CheckCircle },
  { tip: "Set your rate at the upper end of your tier range — clients associate higher rates with higher quality.", icon: TrendingUp },
];

export default function CleanerResources() {
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Code "${code}" copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filterItem = (item: { title: string; desc: string }) =>
    !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase());

  return (
    <CleanerLayout>
      <div className="space-y-10 max-w-5xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Resources & Education</h1>
              <p className="text-muted-foreground mt-1">Training, guides, checklists, and partner discounts</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
          </div>

          {/* Stats banner */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Resources Available", value: "15+", icon: BookOpen, color: "text-primary" },
              { label: "Partner Discounts", value: "4", icon: ShoppingBag, color: "text-success" },
              { label: "Pro Tips", value: "6", icon: Lightbulb, color: "text-warning" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="text-center">
                  <CardContent className="p-4">
                    <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Resource Sections */}
        {RESOURCES.map((section, si) => {
          const filtered = section.items.filter(filterItem);
          if (search && filtered.length === 0) return null;
          return (
            <motion.section key={section.category} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: si * 0.05 }}>
              <h2 className="text-xl font-bold mb-4">{section.category}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {filtered.map((item, i) => (
                  <motion.div key={item.title} whileHover={{ y: -2 }}>
                    <Card className={`border ${section.color} hover:shadow-elevated transition-all cursor-pointer h-full`}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className={`h-11 w-11 rounded-xl ${section.iconBg} flex items-center justify-center flex-shrink-0`}>
                            {item.type === "video" ? (
                              <PlayCircle className={`h-5 w-5 ${section.iconColor}`} />
                            ) : item.type === "pdf" ? (
                              <Download className={`h-5 w-5 ${section.iconColor}`} />
                            ) : (
                              <item.icon className={`h-5 w-5 ${section.iconColor}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
                              <Badge variant={item.badgeVariant} className="text-xs">{item.badge}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{item.desc}</p>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{item.time}</span>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          );
        })}

        {/* Partner Discounts */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-success" />
            Partner Discounts
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DISCOUNTS.map((d, i) => (
              <motion.div key={d.brand} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ y: -2 }}>
                <Card className={`bg-gradient-to-br ${d.color} border h-full`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="success" className="font-bold">{d.discount}</Badge>
                      <Award className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">{d.brand}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{d.desc}</p>
                    <div className="bg-background/70 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Promo code</p>
                      <p className="font-mono font-bold text-primary text-sm">{d.code}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 rounded-lg h-8 text-xs"
                      onClick={() => handleCopy(d.code)}
                    >
                      {copiedCode === d.code ? (
                        <><Check className="h-3 w-3 mr-1.5 text-success" />Copied!</>
                      ) : (
                        <><Copy className="h-3 w-3 mr-1.5" />Copy Code</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Pro Tips */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            Pro Tips from Top Cleaners
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {TIPS.map((tip, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="border-warning/20 bg-warning/5 hover:bg-warning/8 transition-colors">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-warning/15 flex items-center justify-center flex-shrink-0">
                      <tip.icon className="h-4 w-4 text-warning" />
                    </div>
                    <p className="text-sm leading-relaxed">{tip.tip}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Help Footer */}
        <Card className="bg-gradient-to-r from-primary/5 to-muted/30 border-primary/20">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold mb-1">Need more help?</h3>
              <p className="text-sm text-muted-foreground">Our support team is available 7 days a week</p>
            </div>
            <Button variant="outline" className="gap-2 rounded-xl flex-shrink-0">
              <ExternalLink className="h-4 w-4" />
              Contact Support
            </Button>
          </CardContent>
        </Card>

      </div>
    </CleanerLayout>
  );
}
