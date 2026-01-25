import { Link } from "react-router-dom";
import { 
  Sparkles, Shield, MapPin, Award
} from "lucide-react";

// Custom Link component that scrolls to top
function FooterLink({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  const handleClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };
  
  return (
    <Link to={to} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Company",
      links: [
        { name: "About Us", path: "/about" },
        { name: "How It Works", path: "/help" },
        { name: "Pricing", path: "/pricing" },
        { name: "Customer Reviews", path: "/reviews" },
        { name: "Cleaning Scope", path: "/cleaning-scope" },
        { name: "Reliability Score", path: "/reliability-score" },
      ]
    },
    {
      title: "For Clients",
      links: [
        { name: "Find Cleaners", path: "/discover" },
        { name: "Book Cleaning", path: "/book" },
        { name: "My Dashboard", path: "/dashboard" },
        { name: "My Properties", path: "/properties" },
        { name: "My Wallet", path: "/wallet" },
        { name: "Messages", path: "/messages" },
        { name: "Favorite Cleaners", path: "/favorites" },
        { name: "Reschedule Requests", path: "/reschedule-requests" },
        { name: "Referral Program", path: "/referral" },
      ]
    },
    {
      title: "For Cleaners",
      links: [
        { name: "Become a Cleaner", path: "/auth?role=cleaner" },
        { name: "Cleaner Dashboard", path: "/cleaner/dashboard" },
        { name: "Find Jobs", path: "/cleaner/marketplace" },
        { name: "My Schedule", path: "/cleaner/schedule" },
        { name: "Active Jobs", path: "/cleaner/jobs" },
        { name: "Earnings", path: "/cleaner/earnings" },
        { name: "Analytics", path: "/cleaner/analytics" },
        { name: "Referral Program", path: "/cleaner/referral" },
        { name: "Messages", path: "/cleaner/messages" },
        { name: "My Profile", path: "/cleaner/profile" },
      ]
    },
    {
      title: "Cleaner Tools",
      links: [
        { name: "Availability", path: "/cleaner/availability" },
        { name: "Service Areas", path: "/cleaner/service-areas" },
        { name: "Calendar Sync", path: "/cleaner/calendar-sync" },
        { name: "Team Management", path: "/cleaner/team" },
        { name: "Verification", path: "/cleaner/verification" },
        { name: "Reliability Score", path: "/cleaner/reliability" },
        { name: "Cancellation Policy", path: "/cleaner/cancellation-policy" },
        { name: "Resources", path: "/cleaner/resources" },
        { name: "AI Assistant", path: "/cleaner/ai-assistant" },
      ]
    },
    {
      title: "Use Cases",
      links: [
        { name: "For Airbnb Hosts", path: "/for-airbnb-hosts" },
        { name: "For Families", path: "/for-families" },
        { name: "For Retirees", path: "/for-retirees" },
        { name: "For Professionals", path: "/for-professionals" },
      ]
    },
    {
      title: "Admin",
      links: [
        { name: "CEO Dashboard", path: "/admin/ceo" },
        { name: "Analytics Dashboard", path: "/admin/analytics" },
        { name: "Operations", path: "/admin/operations" },
        { name: "Finance", path: "/admin/finance" },
        { name: "Growth", path: "/admin/growth" },
        { name: "Performance", path: "/admin/performance" },
        { name: "Conversion Dashboard", path: "/admin/conversions" },
        { name: "Bookings Console", path: "/admin/bookings" },
        { name: "Client Jobs", path: "/admin/client-jobs" },
        { name: "Pricing Management", path: "/admin/pricing" },
        { name: "Pricing Rules", path: "/admin/pricing-rules" },
        { name: "Trust & Safety", path: "/admin/trust-safety" },
        { name: "Trust Reports", path: "/admin/trust-safety-reports" },
        { name: "Fraud Alerts", path: "/admin/fraud-alerts" },
        { name: "Disputes", path: "/admin/disputes" },
        { name: "Client Risk", path: "/admin/client-risk" },
        { name: "ID Verifications", path: "/admin/id-verifications" },
      ]
    },
    {
      title: "Legal & Support",
      links: [
        { name: "Privacy Policy", path: "/legal" },
        { name: "Terms of Service", path: "/legal" },
        { name: "Legal Center", path: "/legal" },
        { name: "Cancellation Policy", path: "/cancellationpolicy" },
        { name: "Help Center", path: "/help" },
        { name: "Notification Settings", path: "/settings/notifications" },
      ]
    },
  ];

  return (
    <footer className="border-t border-border bg-muted/30 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-xs sm:text-sm">
                {section.title}
              </h4>
              <ul className="space-y-1.5 sm:space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <FooterLink 
                      to={link.path} 
                      className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Brand Section */}
        <div className="border-t border-border pt-6 sm:pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
            {/* Logo & Description */}
            <div className="max-w-md">
              <FooterLink to="/" className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg sm:text-xl text-foreground">PureTask</span>
              </FooterLink>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Trust-first cleaning marketplace. GPS-verified check-ins, photo proof, 
                and pay only when you're happy. Connecting quality cleaners with happy homes.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-background border border-border">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
                <span className="text-[10px] sm:text-xs font-medium text-foreground">Background Checked</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-background border border-border">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span className="text-[10px] sm:text-xs font-medium text-foreground">GPS Verified</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-background border border-border">
                <Award className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
                <span className="text-[10px] sm:text-xs font-medium text-foreground">Satisfaction Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {currentYear} PureTask. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            <FooterLink to="/legal" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </FooterLink>
            <FooterLink to="/legal" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </FooterLink>
            <FooterLink to="/help" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Support
            </FooterLink>
            <FooterLink to="/about" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </FooterLink>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Built with trust in mind ✨
          </p>
        </div>
      </div>
    </footer>
  );
}
