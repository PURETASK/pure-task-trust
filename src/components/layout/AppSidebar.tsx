import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Search, Wallet, MessageSquare, Calendar, DollarSign,
  Users, User, Star, MapPin, Briefcase, TrendingUp, Shield, Settings,
  Heart, CalendarClock, Award, Link2, CheckCircle, BarChart3, Building,
  CreditCard, AlertTriangle, FileText, Activity, PieChart, Scale,
  Sparkles, Home, Tag, HelpCircle, Zap, Target, Bot, BookOpen,
  Bell, Clock, BarChart2, Globe, UserCheck, Layers, ChevronRight
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── NAV DEFINITIONS ──────────────────────────────────────────────────────────

const guestNavGroups = [
  {
    group: "Explore",
    items: [
      { title: "Home", url: "/", icon: Home, badge: null },
      { title: "Browse Cleaners", url: "/discover", icon: Search, badge: null },
      { title: "Pricing", url: "/pricing", icon: Tag, badge: null },
      { title: "About Us", url: "/about", icon: Globe, badge: null },
    ]
  },
  {
    group: "Use Cases",
    items: [
      { title: "Airbnb Hosts", url: "/for-airbnb-hosts", icon: Star, badge: "Popular" },
      { title: "Families", url: "/for-families", icon: Heart, badge: null },
      { title: "Professionals", url: "/for-professionals", icon: Briefcase, badge: null },
      { title: "Retirees", url: "/for-retirees", icon: Award, badge: null },
    ]
  },
  {
    group: "Support",
    items: [
      { title: "Help Center", url: "/help", icon: HelpCircle, badge: null },
      { title: "Legal Center", url: "/legal", icon: Scale, badge: null },
    ]
  }
];

const clientNavGroups = [
  {
    group: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, badge: null },
      { title: "Find Cleaners", url: "/discover", icon: Search, badge: null },
      { title: "Book Cleaning", url: "/book", icon: Sparkles, badge: null },
    ]
  },
  {
    group: "My Bookings",
    items: [
      { title: "Properties", url: "/properties", icon: Building, badge: null },
      { title: "Reschedule Requests", url: "/reschedule-requests", icon: CalendarClock, badge: null },
      { title: "Favorite Cleaners", url: "/favorites", icon: Heart, badge: null },
      { title: "Recurring Plans", url: "/recurring-plans", icon: Clock, badge: null },
    ]
  },
  {
    group: "Account",
    items: [
      { title: "My Profile", url: "/profile", icon: User, badge: null },
      { title: "Wallet & Credits", url: "/wallet", icon: Wallet, badge: null },
      { title: "Messages", url: "/messages", icon: MessageSquare, badge: null },
      { title: "Referral Program", url: "/referral", icon: Gift, badge: "Earn" },
      { title: "Notifications", url: "/notifications", icon: Bell, badge: null },
    ]
  },
  {
    group: "Help",
    items: [
      { title: "Help & Support", url: "/help", icon: HelpCircle, badge: null },
      { title: "Legal Center", url: "/legal", icon: Scale, badge: null },
    ]
  }
];

const cleanerNavGroups = [
  {
    group: "Overview",
    items: [
      { title: "Dashboard", url: "/cleaner/dashboard", icon: LayoutDashboard, badge: null },
      { title: "My Schedule", url: "/cleaner/schedule", icon: Calendar, badge: null },
      { title: "Job Marketplace", url: "/cleaner/marketplace", icon: Search, badge: null },
    ]
  },
  {
    group: "Jobs",
    items: [
      { title: "Active Jobs", url: "/cleaner/jobs", icon: Briefcase, badge: null },
      { title: "Messages", url: "/cleaner/messages", icon: MessageSquare, badge: null },
    ]
  },
  {
    group: "Earnings",
    items: [
      { title: "Earnings", url: "/cleaner/earnings", icon: DollarSign, badge: null },
      { title: "Analytics", url: "/cleaner/analytics", icon: TrendingUp, badge: null },
      { title: "Referral & Earn", url: "/cleaner/referral", icon: Users, badge: null },
      { title: "AI Assistant", url: "/cleaner/ai-assistant", icon: Bot, badge: "New" },
    ]
  },
  {
    group: "Profile & Tools",
    items: [
      { title: "My Profile", url: "/cleaner/profile/view", icon: User, badge: null },
      { title: "Profile Settings", url: "/cleaner/profile", icon: Settings, badge: null },
      { title: "Availability", url: "/cleaner/availability", icon: CalendarClock, badge: null },
      { title: "Service Areas", url: "/cleaner/service-areas", icon: MapPin, badge: null },
      { title: "Calendar Sync", url: "/cleaner/calendar-sync", icon: Link2, badge: null },
      { title: "Team", url: "/cleaner/team", icon: Users, badge: null },
    ]
  },
  {
    group: "Trust & Compliance",
    items: [
      { title: "Verification", url: "/cleaner/verification", icon: CheckCircle, badge: null },
      { title: "Reliability Score", url: "/cleaner/reliability", icon: Award, badge: null },
      { title: "Cancellation Policy", url: "/cleaner/cancellation-policy", icon: AlertTriangle, badge: null },
    ]
  },
  {
    group: "Support",
    items: [
      { title: "Resources", url: "/cleaner/resources", icon: BookOpen, badge: null },
      { title: "Settings", url: "/cleaner/settings", icon: Settings, badge: null },
    ]
  }
];

const adminNavGroups = [
  {
    group: "Command",
    items: [
      { title: "Admin Hub", url: "/admin/hub", icon: LayoutDashboard, badge: null },
      { title: "CEO Dashboard", url: "/admin/ceo", icon: TrendingUp, badge: null },
    ]
  },
  {
    group: "Analytics",
    items: [
      { title: "Analytics Hub", url: "/admin/analytics", icon: BarChart3, badge: null },
      { title: "Operations", url: "/admin/operations", icon: Activity, badge: null },
      { title: "Finance", url: "/admin/finance", icon: DollarSign, badge: null },
      { title: "Growth", url: "/admin/growth", icon: TrendingUp, badge: null },
      { title: "Performance", url: "/admin/performance", icon: Star, badge: null },
      { title: "Conversions", url: "/admin/conversions", icon: Target, badge: null },
      { title: "Cohort Analysis", url: "/admin/cohort-analysis", icon: BarChart2, badge: null },
      { title: "Geo Insights", url: "/admin/geo-insights", icon: MapPin, badge: null },
    ]
  },
  {
    group: "Trust & Safety",
    items: [
      { title: "Trust & Safety", url: "/admin/trust-safety", icon: Shield, badge: null },
      { title: "Fraud Alerts", url: "/admin/fraud-alerts", icon: AlertTriangle, badge: "Live" },
      { title: "Disputes", url: "/admin/disputes", icon: FileText, badge: null },
      { title: "Client Risk", url: "/admin/client-risk", icon: Users, badge: null },
      { title: "ID Verifications", url: "/admin/id-verifications", icon: UserCheck, badge: null },
      { title: "Reports", url: "/admin/trust-safety-reports", icon: PieChart, badge: null },
    ]
  },
  {
    group: "Management",
    items: [
      { title: "Users", url: "/admin/users", icon: Users, badge: null },
      { title: "Bookings Console", url: "/admin/bookings", icon: Calendar, badge: null },
      { title: "Client Jobs", url: "/admin/client-jobs", icon: Briefcase, badge: null },
      { title: "Pricing Rules", url: "/admin/pricing-rules", icon: CreditCard, badge: null },
      { title: "Pricing Mgmt", url: "/admin/pricing", icon: DollarSign, badge: null },
      { title: "Bulk Comms", url: "/admin/bulk-comms", icon: MessageSquare, badge: null },
      { title: "Platform Config", url: "/admin/platform-config", icon: Layers, badge: null },
    ]
  }
];

// Placeholder for Gift icon (not in lucide 0.462)
function Gift(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
  );
}

// ─── BADGE COLORS ─────────────────────────────────────────────────────────────
function NavBadge({ label }: { label: string }) {
  const colorMap: Record<string, string> = {
    "New": "bg-success/15 text-success border-success/20",
    "Popular": "bg-warning/15 text-warning border-warning/20",
    "Earn": "bg-primary/15 text-primary border-primary/20",
    "Live": "bg-destructive/15 text-destructive border-destructive/20",
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

  const getNavGroups = () => {
    if (!isAuthenticated) return guestNavGroups;
    if (user?.role === "admin") return adminNavGroups;
    if (user?.role === "cleaner") return cleanerNavGroups;
    return clientNavGroups;
  };

  const navGroups = getNavGroups();

  // Role-based accent color for sidebar identity
  const roleAccent = !isAuthenticated
    ? "text-muted-foreground"
    : user?.role === "admin"
    ? "text-destructive"
    : user?.role === "cleaner"
    ? "text-success"
    : "text-primary";

  const roleBg = !isAuthenticated
    ? "bg-muted/50"
    : user?.role === "admin"
    ? "bg-destructive/10"
    : user?.role === "cleaner"
    ? "bg-success/10"
    : "bg-primary/10";

  const isEnd = (url: string) =>
    url === "/" || url === "/dashboard" || url === "/cleaner/dashboard" || url === "/admin/hub";

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar
        className="transition-all duration-300 border-r border-border bg-background"
        collapsible="icon"
      >
        {/* Role Identity Banner */}
        {!collapsed && isAuthenticated && (
          <div className={cn("mx-3 mt-3 mb-1 px-3 py-2 rounded-xl flex items-center gap-2", roleBg)}>
            <div className={cn("h-2 w-2 rounded-full animate-pulse", 
              user?.role === "admin" ? "bg-destructive" : 
              user?.role === "cleaner" ? "bg-success" : "bg-primary"
            )} />
            <span className={cn("text-xs font-semibold capitalize", roleAccent)}>
              {user?.role === "admin" ? "Admin Console" : user?.role === "cleaner" ? "Cleaner Portal" : "Client Portal"}
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
                    const isActive = location.pathname === item.url ||
                      (item.url !== "/" && item.url !== "/dashboard" && item.url !== "/cleaner/dashboard" && item.url !== "/admin/hub"
                        && location.pathname.startsWith(item.url));

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
                                    isActive
                                      ? `${roleBg} ${roleAccent}`
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                  )}
                                >
                                  <item.icon className="h-4 w-4 flex-shrink-0" />
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
                                isActive
                                  ? `${roleBg} ${roleAccent} shadow-sm`
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                              )}
                            >
                              <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive && roleAccent)} />
                              <span className="flex-1 truncate">{item.title}</span>
                              {item.badge && <NavBadge label={item.badge} />}
                              {isActive && <ChevronRight className={cn("h-3 w-3 flex-shrink-0", roleAccent)} />}
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
