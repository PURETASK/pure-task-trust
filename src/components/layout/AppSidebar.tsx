import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Search, Wallet, MessageSquare, Calendar, DollarSign,
  Users, User, Star, MapPin, Briefcase, TrendingUp, Shield, Settings,
  Heart, CalendarClock, Award, Link2, CheckCircle, BarChart3, Building,
  CreditCard, AlertTriangle, FileText, Activity, PieChart, Scale,
  Sparkles, Home, Tag, HelpCircle, Target, Bot, BookOpen,
  Bell, BarChart2, Globe, UserCheck, Layers, ChevronRight,
  RefreshCw, ShieldAlert, LucideIcon, Clipboard, ShieldCheck, RefreshCcw, AlertOctagon
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ─── Gift icon (not in lucide 0.462) ─────────────────────────────────────────
function Gift(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
  );
}

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon | React.FC<React.ComponentProps<"svg">>;
  badge?: string | null;
}
interface NavGroup { group: string; items: NavItem[] }

// ─── GUEST ────────────────────────────────────────────────────────────────────
const guestNavGroups: NavGroup[] = [
  {
    group: "Explore",
    items: [
      { title: "Home", url: "/", icon: Home },
      { title: "Browse Cleaners", url: "/discover", icon: Search },
      { title: "Pricing", url: "/pricing", icon: Tag },
      { title: "About Us", url: "/about", icon: Globe },
      { title: "Reviews", url: "/reviews", icon: Star },
    ]
  },
  {
    group: "Use Cases",
    items: [
      { title: "Airbnb Hosts", url: "/for-airbnb-hosts", icon: Star, badge: "Popular" },
      { title: "Families", url: "/for-families", icon: Heart },
      { title: "Professionals", url: "/for-professionals", icon: Briefcase },
      { title: "Retirees", url: "/for-retirees", icon: Award },
    ]
  },
  {
    group: "Resources",
    items: [
      { title: "Cleaning Scope", url: "/cleaning-scope", icon: Clipboard },
      { title: "Cancellation Policy", url: "/cancellationpolicy", icon: AlertTriangle },
      { title: "Reliability Score", url: "/reliability-score", icon: ShieldCheck },
    ]
  },
  {
    group: "Support",
    items: [
      { title: "Help Center", url: "/help", icon: HelpCircle },
      { title: "Legal Center", url: "/legal", icon: Scale },
    ]
  }
];

// ─── CLIENT ───────────────────────────────────────────────────────────────────
const clientNavGroups: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Find Cleaners", url: "/discover", icon: Search },
      { title: "Book Cleaning", url: "/book", icon: Sparkles, badge: "Book" },
    ]
  },
  {
    group: "My Bookings",
    items: [
      { title: "Properties", url: "/properties", icon: Building },
      { title: "Recurring Plans", url: "/recurring-plans", icon: RefreshCcw },
      { title: "Reschedule Requests", url: "/reschedule-requests", icon: CalendarClock },
      { title: "Favorite Cleaners", url: "/favorites", icon: Heart },
      { title: "Reviews", url: "/reviews", icon: Star },
    ]
  },
  {
    group: "Account",
    items: [
      { title: "My Profile", url: "/profile", icon: User },
      { title: "Wallet & Credits", url: "/wallet", icon: Wallet },
      { title: "Messages", url: "/messages", icon: MessageSquare },
      { title: "Notifications", url: "/notifications", icon: Bell },
      { title: "Referral Program", url: "/referral", icon: Gift as any, badge: "Earn" },
      { title: "Notification Settings", url: "/settings/notifications", icon: Settings },
    ]
  },
  {
    group: "Help",
    items: [
      { title: "Help & Support", url: "/help", icon: HelpCircle },
      { title: "Cleaning Scope", url: "/cleaning-scope", icon: Clipboard },
      { title: "Cancellation Policy", url: "/cancellationpolicy", icon: AlertTriangle },
      { title: "Legal Center", url: "/legal", icon: Scale },
    ]
  }
];

// ─── CLEANER ──────────────────────────────────────────────────────────────────
const cleanerNavGroups: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { title: "Dashboard", url: "/cleaner/dashboard", icon: LayoutDashboard },
      { title: "My Schedule", url: "/cleaner/schedule", icon: Calendar },
      { title: "Job Marketplace", url: "/cleaner/marketplace", icon: Search, badge: "Live" },
    ]
  },
  {
    group: "Jobs",
    items: [
      { title: "Active Jobs", url: "/cleaner/jobs", icon: Briefcase },
      { title: "Messages", url: "/cleaner/messages", icon: MessageSquare },
    ]
  },
  {
    group: "Earnings & Growth",
    items: [
      { title: "Earnings", url: "/cleaner/earnings", icon: DollarSign },
      { title: "Analytics", url: "/cleaner/analytics", icon: TrendingUp },
      { title: "Referral & Earn", url: "/cleaner/referral", icon: Gift as any, badge: "Earn" },
      { title: "AI Assistant", url: "/cleaner/ai-assistant", icon: Bot, badge: "New" },
    ]
  },
  {
    group: "Profile & Setup",
    items: [
      { title: "My Public Profile", url: "/cleaner/profile/view", icon: User },
      { title: "Profile Settings", url: "/cleaner/profile", icon: Settings },
      { title: "Availability", url: "/cleaner/availability", icon: CalendarClock },
      { title: "Service Areas", url: "/cleaner/service-areas", icon: MapPin },
      { title: "Calendar Sync", url: "/cleaner/calendar-sync", icon: Link2 },
      { title: "Team Management", url: "/cleaner/team", icon: Users },
    ]
  },
  {
    group: "Trust & Compliance",
    items: [
      { title: "Verification", url: "/cleaner/verification", icon: CheckCircle },
      { title: "Reliability Score", url: "/cleaner/reliability", icon: Award },
      { title: "Cancellation Policy", url: "/cleaner/cancellation-policy", icon: AlertTriangle },
    ]
  },
  {
    group: "Support",
    items: [
      { title: "Resources & Guides", url: "/cleaner/resources", icon: BookOpen },
      { title: "Account Settings", url: "/cleaner/settings", icon: Settings },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ]
  }
];

// ─── ADMIN ────────────────────────────────────────────────────────────────────
const adminNavGroups: NavGroup[] = [
  {
    group: "Command",
    items: [
      { title: "Admin Hub", url: "/admin/hub", icon: LayoutDashboard },
      { title: "CEO Dashboard", url: "/admin/ceo", icon: TrendingUp },
    ]
  },
  {
    group: "Analytics",
    items: [
      { title: "Analytics Hub", url: "/admin/analytics", icon: BarChart3 },
      { title: "Operations", url: "/admin/operations", icon: Activity },
      { title: "Finance", url: "/admin/finance", icon: DollarSign },
      { title: "Growth", url: "/admin/growth", icon: TrendingUp },
      { title: "Performance", url: "/admin/performance", icon: Star },
      { title: "Conversions", url: "/admin/conversions", icon: Target },
      { title: "Cohort Analysis", url: "/admin/cohort-analysis", icon: BarChart2 },
      { title: "Geo Insights", url: "/admin/geo-insights", icon: MapPin },
    ]
  },
  {
    group: "Trust & Safety",
    items: [
      { title: "Trust & Safety", url: "/admin/trust-safety", icon: Shield },
      { title: "Fraud Alerts", url: "/admin/fraud-alerts", icon: AlertTriangle, badge: "Live" },
      { title: "Disputes", url: "/admin/disputes", icon: FileText },
      { title: "Client Risk", url: "/admin/client-risk", icon: AlertOctagon },
      { title: "ID Verifications", url: "/admin/id-verifications", icon: UserCheck },
      { title: "Safety Reports", url: "/admin/trust-safety-reports", icon: PieChart },
    ]
  },
  {
    group: "Operations",
    items: [
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Bookings Console", url: "/admin/bookings", icon: CalendarClock },
      { title: "Client Jobs", url: "/admin/client-jobs", icon: Briefcase },
      { title: "Bulk Comms", url: "/admin/bulk-comms", icon: MessageSquare },
    ]
  },
  {
    group: "Platform Config",
    items: [
      { title: "Pricing Rules", url: "/admin/pricing-rules", icon: CreditCard },
      { title: "Pricing Management", url: "/admin/pricing", icon: DollarSign },
      { title: "Platform Config", url: "/admin/platform-config", icon: Layers },
    ]
  }
];

// ─── BADGE COLORS ─────────────────────────────────────────────────────────────
function NavBadge({ label }: { label: string }) {
  const colorMap: Record<string, string> = {
    "New":     "bg-success/15 text-success border-success/20",
    "Popular": "bg-warning/15 text-warning border-warning/20",
    "Earn":    "bg-primary/15 text-primary border-primary/20",
    "Live":    "bg-destructive/15 text-destructive border-destructive/20",
    "Book":    "bg-primary/15 text-primary border-primary/20",
  };
  return (
    <span className={cn(
      "ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full border",
      colorMap[label] ?? "bg-muted text-muted-foreground border-border"
    )}>
      {label}
    </span>
  );
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const getNavGroups = (): NavGroup[] => {
    if (!isAuthenticated) return guestNavGroups;
    if (user?.role === "admin")   return adminNavGroups;
    if (user?.role === "cleaner") return cleanerNavGroups;
    return clientNavGroups;
  };

  const navGroups = getNavGroups();

  const roleAccent =
    !isAuthenticated      ? "text-muted-foreground" :
    user?.role === "admin"   ? "text-destructive" :
    user?.role === "cleaner" ? "text-success"     : "text-primary";

  const roleBg =
    !isAuthenticated      ? "bg-muted/50" :
    user?.role === "admin"   ? "bg-destructive/10" :
    user?.role === "cleaner" ? "bg-success/10"     : "bg-primary/10";

  const roleIndicator =
    !isAuthenticated      ? "bg-muted-foreground" :
    user?.role === "admin"   ? "bg-destructive" :
    user?.role === "cleaner" ? "bg-success"     : "bg-primary";

  const exactMatchUrls = ["/", "/dashboard", "/cleaner/dashboard", "/admin/hub"];
  const isEnd = (url: string) => exactMatchUrls.includes(url);

  const isActive = (url: string) =>
    location.pathname === url ||
    (!isEnd(url) && location.pathname.startsWith(url + "/")) ||
    (!isEnd(url) && url !== "/" && location.pathname === url);

  return (
    <TooltipProvider delayDuration={0}>
      <nav aria-label="Site navigation">
      <Sidebar
        className="transition-all duration-300 border-r border-border bg-background"
        collapsible="icon"
      >
        {/* Role Identity Banner */}
        {!collapsed && isAuthenticated && (
          <div className={cn("mx-3 mt-3 mb-1 px-3 py-2 rounded-xl flex items-center gap-2", roleBg)}>
            <span className={cn("h-2 w-2 rounded-full animate-pulse flex-shrink-0", roleIndicator)} />
            <span className={cn("text-xs font-semibold capitalize truncate", roleAccent)}>
              {user?.role === "admin"   ? "Admin Console"   :
               user?.role === "cleaner" ? "Cleaner Portal"  : "Client Portal"}
            </span>
          </div>
        )}

        <SidebarContent className="pt-2 pb-4">
          {navGroups.map((group) => (
            <SidebarGroup key={group.group}>
              {!collapsed && (
                <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-4 mb-0.5">
                  {group.group}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const active = isActive(item.url);
                    const Icon = item.icon as LucideIcon;

                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild>
                          {collapsed ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <NavLink
                                  to={item.url}
                                  end={isEnd(item.url)}
                                  className={cn(
                                    "flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all mx-1",
                                    active
                                      ? `${roleBg} ${roleAccent}`
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                  )}
                                >
                                  <Icon className="h-4 w-4 flex-shrink-0" />
                                </NavLink>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="font-medium">
                                {item.title}
                                {item.badge && <span className="ml-1 opacity-70">· {item.badge}</span>}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <NavLink
                              to={item.url}
                              end={isEnd(item.url)}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all mx-1",
                                active
                                  ? `${roleBg} ${roleAccent} shadow-sm`
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                              )}
                            >
                              <Icon className={cn("h-4 w-4 flex-shrink-0", active && roleAccent)} />
                              <span className="flex-1 truncate">{item.title}</span>
                              {item.badge && <NavBadge label={item.badge} />}
                              {active && <ChevronRight className={cn("h-3 w-3 flex-shrink-0", roleAccent)} />}
                            </NavLink>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
    </TooltipProvider>
  );
}
