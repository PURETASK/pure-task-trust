import { Link, useLocation } from "react-router-dom";
import {
  Home, Search, Calendar, MessageSquare, User, Briefcase,
  DollarSign, LogIn, Tag, LayoutDashboard, Wallet, Bell,
  Shield, BarChart3, Bot, Sparkles, Heart, Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useMessageThreads } from "@/hooks/useMessages";
import { useInAppNotifications } from "@/hooks/useInAppNotifications";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

// ─── GUEST ────────────────────────────────────────────────────────────────────
const guestItems: NavItem[] = [
  { icon: Home,         label: "Home",    path: "/" },
  { icon: Search,       label: "Browse",  path: "/discover" },
  { icon: Tag,          label: "Pricing", path: "/pricing" },
  { icon: LogIn,        label: "Sign In", path: "/auth" },
];

// ─── CLIENT (5 tabs — most important actions) ─────────────────────────────────
const clientItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Home",     path: "/dashboard" },
  { icon: Search,          label: "Find",     path: "/discover" },
  { icon: Sparkles,        label: "Book",     path: "/book" },
  { icon: MessageSquare,   label: "Messages", path: "/messages" },
  { icon: User,            label: "Profile",  path: "/profile" },
];

// ─── CLEANER (5 tabs — core work flow) ────────────────────────────────────────
const cleanerItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/cleaner/dashboard" },
  { icon: Briefcase,       label: "Jobs",      path: "/cleaner/jobs" },
  { icon: Calendar,        label: "Schedule",  path: "/cleaner/schedule" },
  { icon: DollarSign,      label: "Earnings",  path: "/cleaner/earnings" },
  { icon: User,            label: "Profile",   path: "/cleaner/profile/view" },
];

// ─── ADMIN (5 tabs — command shortcuts) ───────────────────────────────────────
const adminItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Hub",      path: "/admin/hub" },
  { icon: BarChart3,       label: "Analytics",path: "/admin/analytics" },
  { icon: Shield,          label: "Safety",   path: "/admin/trust-safety" },
  { icon: Bell,            label: "Alerts",   path: "/admin/fraud-alerts" },
  { icon: User,            label: "Users",    path: "/admin/users" },
];

// ─── ROLE CONFIG ─────────────────────────────────────────────────────────────
const roleConfig = {
  guest:   { items: guestItems,   accent: "text-primary",     activeBg: "bg-primary/10",     activeIndicator: "bg-primary" },
  client:  { items: clientItems,  accent: "text-primary",     activeBg: "bg-primary/10",     activeIndicator: "bg-primary" },
  cleaner: { items: cleanerItems, accent: "text-success",     activeBg: "bg-success/10",     activeIndicator: "bg-success" },
  admin:   { items: adminItems,   accent: "text-destructive", activeBg: "bg-destructive/10", activeIndicator: "bg-destructive" },
};

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const threadsQuery = useMessageThreads();
  const { unreadCount: notifCount } = useInAppNotifications();
  const unreadMessages =
    threadsQuery.data?.reduce((sum, t) => sum + (t.unreadCount || 0), 0) ?? 0;

  const role = !user ? "guest" : (user.role as "client" | "cleaner" | "admin");
  const config = roleConfig[role] ?? roleConfig.client;

  const messagesPath = role === "cleaner" ? "/cleaner/messages" : "/messages";

  // Hide on auth/onboarding
  const hiddenPaths = ["/auth", "/role-selection", "/cleaner/onboarding", "/forgot-password", "/reset-password"];
  if (hiddenPaths.some((p) => location.pathname.startsWith(p))) return null;

  const isActive = (item: NavItem) => {
    const exact = ["/", "/dashboard", "/cleaner/dashboard", "/admin/hub"];
    if (exact.includes(item.path)) return location.pathname === item.path;
    return location.pathname === item.path ||
      location.pathname.startsWith(item.path + "/");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex items-stretch justify-around h-16 px-1">
        {config.items.map((item) => {
          const active   = isActive(item);
          const isMsgs   = item.path === messagesPath;
          const isAlerts = item.path === "/admin/fraud-alerts";
          const badge    = isMsgs ? unreadMessages : isAlerts ? notifCount : 0;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center flex-1 gap-0.5 transition-all duration-200 active:scale-95"
            >
              {/* Active bar */}
              {active && (
                <span className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-b-full",
                  config.activeIndicator
                )} />
              )}

              {/* Icon */}
              <div className={cn(
                "relative flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200",
                active ? config.activeBg : "bg-transparent"
              )}>
                <item.icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  active
                    ? cn(config.accent, "stroke-[2.5]")
                    : "text-muted-foreground stroke-[1.5]"
                )} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={cn(
                "text-[10px] font-medium transition-colors duration-200",
                active ? config.accent : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
