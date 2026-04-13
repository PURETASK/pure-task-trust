import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { UserCircle2, Building2, Bell, Gift, Shield, CircleHelp, ChevronRight, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const sections = [
  {
    icon: UserCircle2,
    title: "Personal Info",
    description: "Name, phone, email, and avatar",
    href: "/profile/edit",
    color: "bg-primary/10 text-primary border-primary/30",
  },
  {
    icon: Building2,
    title: "Saved Properties",
    description: "Manage addresses and access notes",
    href: "/properties",
    color: "bg-[hsl(var(--pt-aqua))]/10 text-[hsl(var(--pt-aqua))] border-[hsl(var(--pt-aqua))]/30",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Push, SMS, and email preferences",
    href: "/settings/notifications",
    color: "bg-warning/10 text-warning border-warning/30",
  },
  {
    icon: Gift,
    title: "Referral Program",
    description: "Invite friends, earn credits",
    href: "/referral",
    color: "bg-[hsl(var(--pt-purple))]/10 text-[hsl(var(--pt-purple))] border-[hsl(var(--pt-purple))]/30",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Password, sessions, and login activity",
    href: "/sessions",
    color: "bg-success/10 text-success border-success/30",
  },
  {
    icon: CircleHelp,
    title: "Help & Support",
    description: "FAQ, contact support, and policies",
    href: "/help",
    color: "bg-muted text-muted-foreground border-border/40",
  },
];

const f = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.3 },
});

export default function Account() {
  const { user, logout } = useAuth();
  const name = user?.name || user?.email?.split("@")[0] || "Your Account";
  const email = user?.email || "";
  const initial = name.charAt(0).toUpperCase();

  return (
    <main className="flex-1 bg-background min-h-screen">
      <Helmet>
        <title>Account | PureTask</title>
        <meta name="description" content="Manage your PureTask account settings and preferences." />
      </Helmet>

      <div className="container px-4 sm:px-6 py-5 sm:py-8 max-w-3xl">
        {/* ── PROFILE HEADER ──────────────────────────────────────── */}
        <motion.div {...f(0)} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-primary/15 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Account</h1>
              <p className="text-muted-foreground text-sm">Profile and preferences</p>
            </div>
          </div>
        </motion.div>

        {/* ── USER CARD ───────────────────────────────────────────── */}
        <motion.div {...f(0.04)} className="mb-6">
          <div className="rounded-3xl border-2 border-primary/20 bg-primary/[0.03] p-5 sm:p-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-xl font-black text-primary flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg truncate">{name}</p>
              <p className="text-sm text-muted-foreground truncate">{email}</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl" asChild>
              <Link to="/profile/edit">Edit</Link>
            </Button>
          </div>
        </motion.div>

        {/* ── SECTION LINKS ───────────────────────────────────────── */}
        <div className="space-y-2">
          {sections.map((section, i) => (
            <motion.div key={section.href} {...f(0.06 + i * 0.03)}>
              <Link to={section.href}>
                <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 border-border/40 hover:border-primary/20 hover:shadow-card bg-card transition-all cursor-pointer group">
                  <div className={`h-11 w-11 rounded-xl border-2 flex items-center justify-center flex-shrink-0 ${section.color}`}>
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{section.title}</p>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <Separator className="my-6" />

        {/* ── SIGN OUT ────────────────────────────────────────────── */}
        <motion.div {...f(0.3)}>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 gap-2 rounded-xl"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
