import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu, X, Home, Search, HelpCircle, User, LogOut,
  LayoutDashboard, Wallet, MessageSquare, Calendar, DollarSign,
  Settings, Briefcase, Users, CreditCard, Bell, Bot, Sparkles,
  Shield, BarChart3, BookOpen, Award, ClipboardList, TrendingUp
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { AdminAlertsBadge } from "@/components/admin/AdminAlertsBadge";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";
import { useWallet } from "@/hooks/useWallet";
import { cn } from "@/lib/utils";

// ─── Top-bar nav items per role (desktop) ─────────────────────────────────────
const publicNav = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/discover", icon: Search, label: "Browse Cleaners" },
  { to: "/pricing", icon: CreditCard, label: "Pricing" },
  { to: "/help", icon: HelpCircle, label: "Support" },
];

const clientNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/discover", icon: Search, label: "Find Cleaners" },
  { to: "/book", icon: Sparkles, label: "Book Now" },
  { to: "/messages", icon: MessageSquare, label: "Messages" },
  { to: "/wallet", icon: Wallet, label: "Wallet" },
];

const cleanerNav = [
  { to: "/cleaner/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/cleaner/schedule", icon: Calendar, label: "Schedule" },
  { to: "/cleaner/jobs", icon: Briefcase, label: "Jobs" },
  { to: "/cleaner/earnings", icon: DollarSign, label: "Earnings" },
  { to: "/cleaner/messages", icon: MessageSquare, label: "Messages" },
];

// Admin top nav — minimal, since sidebar carries all admin pages
const adminNav = [
  { to: "/admin/hub", icon: LayoutDashboard, label: "Hub" },
  { to: "/admin/ceo", icon: TrendingUp, label: "CEO" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/trust-safety", icon: Shield, label: "Trust & Safety" },
];

// ─── Dropdown quick-links per role ────────────────────────────────────────────
const clientDropdownLinks = [
  { to: "/profile", icon: User, label: "My Profile" },
  { to: "/wallet", icon: Wallet, label: "Wallet" },
  { to: "/recurring-plans", icon: Calendar, label: "Recurring Plans" },
  { to: "/favorites", icon: Award, label: "Favourite Cleaners" },
  { to: "/referral", icon: Users, label: "Referral Program" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/settings/notifications", icon: Settings, label: "Notification Settings" },
];

const cleanerDropdownLinks = [
  { to: "/cleaner/profile/view", icon: User, label: "My Public Profile" },
  { to: "/cleaner/profile", icon: Settings, label: "Profile Settings" },
  { to: "/cleaner/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/cleaner/ai-assistant", icon: Bot, label: "AI Assistant" },
  { to: "/cleaner/verification", icon: Award, label: "Verification" },
  { to: "/cleaner/reliability", icon: Award, label: "Reliability Score" },
  { to: "/cleaner/resources", icon: BookOpen, label: "Resources & Guides" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/cleaner/settings", icon: Settings, label: "Account Settings" },
];

const adminDropdownLinks = [
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/bookings", icon: ClipboardList, label: "Bookings Console" },
  { to: "/admin/disputes", icon: MessageSquare, label: "Disputes" },
  { to: "/admin/fraud-alerts", icon: Bell, label: "Fraud Alerts" },
  { to: "/admin/platform-config", icon: Settings, label: "Platform Config" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const { account } = useWallet();
  const availableCredits =
    user?.role === "client" && account
      ? (account.current_balance || 0) - (account.held_balance || 0)
      : null;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getNavItems = () => {
    if (!isAuthenticated)         return publicNav;
    if (user?.role === "cleaner") return cleanerNav;
    if (user?.role === "admin")   return adminNav;
    return clientNav;
  };

  const getDropdownLinks = () => {
    if (user?.role === "cleaner") return cleanerDropdownLinks;
    if (user?.role === "admin")   return adminDropdownLinks;
    return clientDropdownLinks;
  };

  const navItems = getNavItems();
  const dropdownLinks = getDropdownLinks();

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const roleAccentClass =
    user?.role === "admin"   ? "bg-destructive/10 border-destructive/20 text-destructive" :
    user?.role === "cleaner" ? "bg-success/10 border-success/20 text-success"             :
                               "bg-primary/10 border-primary/20 text-primary";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to={
              !isAuthenticated     ? "/" :
              user?.role === "cleaner" ? "/cleaner/dashboard" :
              user?.role === "admin"   ? "/admin/hub"         : "/dashboard"
            }
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="h-9 w-9 rounded-xl gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-xl text-foreground">PureTask</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to ||
                (item.to !== "/" && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-lg",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right-side Controls */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />

            {/* Admin: Command Palette + Alerts */}
            {isAuthenticated && user?.role === "admin" && (
              <>
                <AdminCommandPalette />
                <AdminAlertsBadge />
              </>
            )}

            {/* Notifications bell for all authenticated users */}
            {isAuthenticated && <NotificationBell />}

            {/* Client credit chip */}
            {isAuthenticated && user?.role === "client" && availableCredits !== null && (
              <Link to="/wallet">
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border hover:opacity-80 transition-opacity cursor-pointer",
                  roleAccentClass
                )}>
                  <CreditCard className="h-3.5 w-3.5" />
                  <span className="text-sm font-semibold">{availableCredits}</span>
                  <span className="text-xs opacity-70">cr</span>
                </div>
              </Link>
            )}

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline font-medium max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  {/* Profile header */}
                  <Link
                    to={
                      user.role === "cleaner" ? "/cleaner/profile/view" :
                      user.role === "admin"   ? "/admin/hub"            : "/profile"
                    }
                    className="block px-3 py-2 hover:bg-accent rounded-sm transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                        <span className={cn(
                          "text-xs font-semibold capitalize mt-0.5",
                          user.role === "admin"   ? "text-destructive" :
                          user.role === "cleaner" ? "text-success"     : "text-primary"
                        )}>
                          {user.role === "admin" ? "Admin Console" : user.role === "cleaner" ? "Cleaner Portal" : "Client"}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <DropdownMenuSeparator />

                  {dropdownLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <DropdownMenuItem asChild key={link.to}>
                        <Link to={link.to} className="flex items-center gap-2 cursor-pointer">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {link.label}
                          {link.to === "/wallet" && availableCredits !== null && (
                            <span className="ml-auto text-xs font-medium text-primary">
                              {availableCredits} cr
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {/* Mobile credit chip */}
              {isAuthenticated && user?.role === "client" && availableCredits !== null && (
                <Link to="/wallet" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 mb-3">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {availableCredits} credits available
                    </span>
                  </div>
                </Link>
              )}

              {/* Primary nav links */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Additional dropdown links for mobile */}
              {isAuthenticated && dropdownLinks.length > 0 && (
                <>
                  <div className="h-px bg-border my-2" />
                  {dropdownLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground rounded-lg hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                </>
              )}

              <div className="h-px bg-border my-2" />
              {isAuthenticated ? (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive rounded-lg hover:bg-destructive/10 w-full transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
