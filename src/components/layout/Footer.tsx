import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sparkles, Shield, MapPin, Award,
  LayoutDashboard, Search, Wallet, MessageSquare, Calendar,
  DollarSign, Heart, Star, Users, HelpCircle,
  BarChart3, Settings, TrendingUp, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ptMark from "@/assets/brand/puretask-mark.png";

function FooterLink({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  return (
    <Link to={to} onClick={() => window.scrollTo({ top: 0, behavior: "instant" })} className={className}>
      {children}
    </Link>
  );
}

// ─── GUEST FOOTER ─────────────────────────────────────────────────────────────
function GuestFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-aero bg-gradient-to-b from-background to-muted/30">
      {/* CTA Banner */}
      <div className="relative overflow-hidden bg-gradient-aero py-12">
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-aero-cyan/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl sm:text-3xl font-poppins font-bold text-white mb-2 tracking-tight">Ready for a spotless home?</h3>
          <p className="text-white/85 mb-6 text-sm sm:text-base">Join thousands of happy clients. Book in under 2 minutes.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild size="lg" className="font-semibold rounded-full bg-white text-aero-trust hover:bg-white/90 border-0 shadow-elevated">
              <Link to="/auth?mode=signup">Get Started Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-semibold rounded-full border-white/40 text-white hover:bg-white/10 bg-transparent">
              <Link to="/discover">Browse Cleaners</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {[
            {
              title: "Product",
              links: [
                { name: "How It Works", path: "/help" },
                { name: "Pricing", path: "/pricing" },
                { name: "Browse Cleaners", path: "/discover" },
                { name: "Book a Cleaning", path: "/book" },
                { name: "Cleaning Scope", path: "/cleaning-scope" },
              ]
            },
            {
              title: "Use Cases",
              links: [
                { name: "Airbnb Hosts", path: "/for-airbnb-hosts" },
                { name: "Families", path: "/for-families" },
                { name: "Professionals", path: "/for-professionals" },
                { name: "Retirees", path: "/for-retirees" },
              ]
            },
            {
              title: "Company",
              links: [
                { name: "About Us", path: "/about" },
                { name: "Customer Reviews", path: "/reviews" },
                { name: "Reliability Score", path: "/reliability-score" },
                { name: "Become a Cleaner", path: "/auth?role=cleaner" },
              ]
            },
            {
              title: "Legal & Support",
              links: [
                { name: "Help Center", path: "/help" },
                { name: "Privacy Policy", path: "/legal" },
                { name: "Terms of Service", path: "/legal" },
                { name: "Cancellation Policy", path: "/cancellation-policy" },
              ]
            }
          ].map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-foreground mb-4 text-sm">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <FooterLink to={link.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-aero pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <FooterLink to="/" className="flex items-center gap-2">
            <img src={ptMark} alt="PureTask" className="h-8 w-8 object-contain" />
            <span className="font-poppins font-bold text-lg text-aero-trust tracking-tight">PureTask</span>
          </FooterLink>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-aero-cyan/10 border border-aero-cyan/30">
              <Shield className="h-3.5 w-3.5 text-aero-trust" />
              <span className="text-xs font-medium text-aero-trust">Background Checked</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">GPS Verified</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
              <Award className="h-3.5 w-3.5 text-success" />
              <span className="text-xs font-medium text-success">Satisfaction Guaranteed</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">© {currentYear} PureTask. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── CLIENT FOOTER ────────────────────────────────────────────────────────────
function ClientFooter() {
  const currentYear = new Date().getFullYear();
  const quickLinks = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Search, label: "Find Cleaners", path: "/discover" },
    { icon: Wallet, label: "Wallet", path: "/wallet" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: Heart, label: "Favorites", path: "/favorites" },
    { icon: HelpCircle, label: "Help", path: "/help" },
  ];

  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-primary" /> Quick Access
            </h4>
            <ul className="space-y-2">
              {quickLinks.map(l => (
                <li key={l.path}>
                  <FooterLink to={l.path} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <l.icon className="h-3.5 w-3.5" />{l.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Bookings
            </h4>
            <ul className="space-y-2">
              {[
                { name: "Book Cleaning", path: "/book" },
                { name: "My Cleanings", path: "/my-cleanings" },
                { name: "Cancellation Policy", path: "/cancellation-policy" },
              ].map(l => (
                <li key={l.path}>
                  <FooterLink to={l.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">{l.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" /> Rewards
            </h4>
            <ul className="space-y-2">
              {[
                { name: "Referral Program", path: "/referral" },
                { name: "Reviews", path: "/reviews" },
                { name: "Loyalty Program", path: "/wallet" },
                { name: "Notification Settings", path: "/settings/notifications" },
              ].map(l => (
                <li key={l.path}>
                  <FooterLink to={l.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">{l.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Support
            </h4>
            <ul className="space-y-2">
              {[
                { name: "Help Center", path: "/help" },
                { name: "Cleaning Scope", path: "/cleaning-scope" },
                { name: "Privacy Policy", path: "/legal" },
                { name: "Terms of Service", path: "/legal" },
              ].map(l => (
                <li key={l.path}>
                  <FooterLink to={l.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">{l.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <FooterLink to="/dashboard" className="flex items-center gap-2">
            <img src={ptMark} alt="PureTask" className="h-7 w-7 object-contain" />
            <span className="font-poppins font-bold text-aero-trust tracking-tight">PureTask</span>
          </FooterLink>
          <p className="text-xs text-muted-foreground">© {currentYear} PureTask · Trust-first cleaning marketplace</p>
          <div className="flex gap-4">
            <FooterLink to="/legal" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</FooterLink>
            <FooterLink to="/legal" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</FooterLink>
            <FooterLink to="/help" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Support</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── CLEANER FOOTER ───────────────────────────────────────────────────────────
function CleanerFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-success" /> My Work
            </h4>
            <ul className="space-y-2">
              {[
                { name: "Dashboard", path: "/cleaner/dashboard" },
                { name: "My Schedule", path: "/cleaner/schedule" },
                { name: "Active Jobs", path: "/cleaner/jobs" },
                { name: "Job Marketplace", path: "/cleaner/marketplace" },
                { name: "Messages", path: "/cleaner/messages" },
              ].map(l => (
                <li key={l.path}>
                  <FooterLink to={l.path} className="text-sm text-muted-foreground hover:text-success transition-colors">{l.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" /> Earnings
            </h4>
            <ul className="space-y-2">
              {[
                { name: "Earnings Overview", path: "/cleaner/earnings" },
                { name: "Analytics", path: "/cleaner/analytics" },
                { name: "Referral Program", path: "/cleaner/referral" },
                { name: "AI Assistant", path: "/cleaner/ai-assistant" },
              ].map(l => (
                <li key={l.path}>
                  <FooterLink to={l.path} className="text-sm text-muted-foreground hover:text-success transition-colors">{l.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
              <Settings className="h-4 w-4 text-success" /> Profile & Tools
            </h4>
            <ul className="space-y-2">
              {[
                { name: "My Profile", path: "/cleaner/profile/view" },
                { name: "Availability", path: "/cleaner/availability" },
                { name: "Service Areas", path: "/cleaner/service-areas" },
                { name: "Calendar Sync", path: "/cleaner/calendar-sync" },
                { name: "Team Management", path: "/cleaner/team" },
              ].map(l => (
                <li key={l.path}>
                  <FooterLink to={l.path} className="text-sm text-muted-foreground hover:text-success transition-colors">{l.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-success" /> Trust & Support
            </h4>
            <ul className="space-y-2">
              {[
                { name: "Verification", path: "/cleaner/verification" },
                { name: "Reliability Score", path: "/cleaner/reliability" },
                { name: "Resources", path: "/cleaner/resources" },
                { name: "Cancellation Policy", path: "/cleaner/cancellation-policy" },
                { name: "Help Center", path: "/help" },
              ].map(l => (
                <li key={l.path}>
                  <FooterLink to={l.path} className="text-sm text-muted-foreground hover:text-success transition-colors">{l.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <FooterLink to="/cleaner/dashboard" className="flex items-center gap-2">
            <img src={ptMark} alt="PureTask" className="h-7 w-7 object-contain" />
            <span className="font-poppins font-bold text-aero-trust tracking-tight">PureTask</span>
            <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">Cleaner</span>
          </FooterLink>
          <p className="text-xs text-muted-foreground">© {currentYear} PureTask · Empowering professional cleaners</p>
          <div className="flex gap-4">
            <FooterLink to="/legal" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</FooterLink>
            <FooterLink to="/legal" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</FooterLink>
            <FooterLink to="/help" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Support</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── ADMIN FOOTER ─────────────────────────────────────────────────────────────
function AdminFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-destructive/20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-destructive" /> Analytics
            </h4>
            <ul className="space-y-2">
              {[
                { name: "Analytics Hub", path: "/admin/analytics" },
                { name: "CEO Dashboard", path: "/admin/ceo" },
                { name: "Operations", path: "/admin/operations" },
                { name: "Finance", path: "/admin/finance" },
                { name: "Growth", path: "/admin/growth" },
                { name: "Geo Insights", path: "/admin/geo-insights" },
              ].map(l => (
                <li key={l.path}>
                  <FooterLink to={l.path} className="text-sm text-muted-foreground hover:text-destructive transition-colors">{l.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-destructive" /> Trust & Safety
            </h4>
            <ul className="space-y-2">
              {[
                { name: "Trust & Safety", path: "/admin/trust-safety" },
                { name: "Fraud Alerts", path: "/admin/fraud-alerts" },
                { name: "Disputes", path: "/admin/disputes" },
                { name: "Client Risk", path: "/admin/client-risk" },
                { name: "ID Verifications", path: "/admin/id-verifications" },
              ].map(l => (
                <li key={l.path}>
                  <FooterLink to={l.path} className="text-sm text-muted-foreground hover:text-destructive transition-colors">{l.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-destructive" /> Management
            </h4>
            <ul className="space-y-2">
              {[
                { name: "Users", path: "/admin/users" },
                { name: "Bookings Console", path: "/admin/bookings" },
                { name: "Client Jobs", path: "/admin/client-jobs" },
                { name: "Pricing Rules", path: "/admin/pricing-rules" },
                { name: "Pricing Management", path: "/admin/pricing" },
                { name: "Bulk Comms", path: "/admin/bulk-comms" },
                { name: "Platform Config", path: "/admin/platform-config" },
              ].map(l => (
                <li key={l.path}>
                  <FooterLink to={l.path} className="text-sm text-muted-foreground hover:text-destructive transition-colors">{l.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-destructive" /> Performance
            </h4>
            <ul className="space-y-2">
              {[
                { name: "Performance Metrics", path: "/admin/performance" },
                { name: "Conversions", path: "/admin/conversions" },
                { name: "Cohort Analysis", path: "/admin/cohort-analysis" },
                { name: "Trust Reports", path: "/admin/trust-safety-reports" },
                { name: "Client Jobs", path: "/admin/client-jobs" },
              ].map(l => (
                <li key={l.path}>
                  <FooterLink to={l.path} className="text-sm text-muted-foreground hover:text-destructive transition-colors">{l.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <FooterLink to="/admin/hub" className="flex items-center gap-2">
            <img src={ptMark} alt="PureTask" className="h-7 w-7 object-contain" />
            <span className="font-poppins font-bold text-aero-trust tracking-tight">PureTask</span>
            <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium">Admin</span>
          </FooterLink>
          <p className="text-xs text-muted-foreground">© {currentYear} PureTask Admin Console · Internal use only</p>
          <div className="flex gap-4">
            <FooterLink to="/legal" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</FooterLink>
            <FooterLink to="/legal" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}


// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export function Footer() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <GuestFooter />;
  if (user?.role === "admin") return <AdminFooter />;
  if (user?.role === "cleaner") return <CleanerFooter />;
  return <ClientFooter />;
}
