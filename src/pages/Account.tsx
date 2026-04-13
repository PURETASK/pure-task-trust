import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { UserCircle2, Building2, Bell, Gift, Shield, CircleHelp, ChevronRight, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const sections = [
  { icon: UserCircle2, title: "Personal Info", description: "Name, phone, email, avatar", href: "/profile/edit", color: "bg-primary/10 text-primary" },
  { icon: Building2, title: "Saved Properties", description: "Manage addresses and access notes", href: "/properties", color: "bg-[hsl(var(--pt-aqua))]/10 text-[hsl(var(--pt-aqua))]" },
  { icon: Bell, title: "Notifications", description: "Push, SMS, and email preferences", href: "/settings/notifications", color: "bg-warning/10 text-warning" },
  { icon: Gift, title: "Referral Program", description: "Invite friends and earn credits", href: "/referral", color: "bg-[hsl(var(--pt-purple))]/10 text-[hsl(var(--pt-purple))]" },
  { icon: Shield, title: "Security", description: "Password, sessions, and login activity", href: "/sessions", color: "bg-success/10 text-success" },
  { icon: CircleHelp, title: "Help & Support", description: "FAQ, contact support, policies", href: "/help", color: "bg-muted text-muted-foreground" },
];

const f = (delay = 0) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.3 } });

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
        {/* Profile header */}
        <motion.div {...f(0)} className="mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {initial}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{name}</h1>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/profile/edit">Edit</Link>
            </Button>
          </div>
        </motion.div>

        {/* Section cards */}
        <div className="space-y-2">
          {sections.map((section, i) => (
            <motion.div key={section.href} {...f(0.03 * (i + 1))}>
              <Link to={section.href}>
                <Card className="hover:shadow-card hover:border-primary/20 transition-all cursor-pointer">
                  <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${section.color}`}>
                      <section.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{section.title}</p>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <Separator className="my-6" />

        {/* Sign out */}
        <motion.div {...f(0.2)}>
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 gap-2" <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 gap-2" onClick={() => logout()}>>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
