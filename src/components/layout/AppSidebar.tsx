import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Search,
  Wallet,
  MessageSquare,
  Calendar,
  DollarSign,
  Users,
  User,
  Star,
  MapPin,
  Briefcase,
  TrendingUp,
  Shield,
  Settings,
  Heart,
  Home,
  CalendarClock,
  Award,
  Link2,
  CheckCircle,
  BarChart3,
  Building,
  CreditCard,
  AlertTriangle,
  FileText,
  Activity,
  PieChart,
  Scale
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Client navigation items
const clientNavItems = [
  {
    group: "Main",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Find Cleaners", url: "/discover", icon: Search },
      { title: "Messages", url: "/messages", icon: MessageSquare },
    ]
  },
  {
    group: "Bookings",
    items: [
      { title: "Properties", url: "/properties", icon: Building },
      { title: "Reschedule Requests", url: "/reschedule-requests", icon: CalendarClock },
      { title: "Favorite Cleaners", url: "/favorites", icon: Heart },
    ]
  },
  {
    group: "Account",
    items: [
      { title: "My Profile", url: "/profile", icon: User },
      { title: "Wallet", url: "/wallet", icon: Wallet },
      { title: "Help & Support", url: "/help", icon: MessageSquare },
      { title: "Notifications", url: "/settings/notifications", icon: Settings },
      { title: "Legal Center", url: "/legal", icon: Scale },
    ]
  }
];

// Cleaner navigation items
const cleanerNavItems = [
  {
    group: "Main",
    items: [
      { title: "Dashboard", url: "/cleaner/dashboard", icon: LayoutDashboard },
      { title: "My Schedule", url: "/cleaner/schedule", icon: Calendar },
      { title: "My Jobs", url: "/cleaner/jobs", icon: Briefcase },
      { title: "Marketplace", url: "/cleaner/marketplace", icon: Search },
    ]
  },
  {
    group: "Earnings",
    items: [
      { title: "Earnings", url: "/cleaner/earnings", icon: DollarSign },
      { title: "Referrals", url: "/cleaner/referral", icon: Users },
      { title: "Analytics", url: "/cleaner/analytics", icon: TrendingUp },
      { title: "AI Assistant", url: "/cleaner/ai-assistant", icon: Star },
    ]
  },
  {
    group: "Settings",
    items: [
      { title: "My Profile", url: "/cleaner/profile/view", icon: User },
      { title: "Profile Settings", url: "/cleaner/profile", icon: Settings },
      { title: "Settings", url: "/cleaner/settings", icon: Settings },
      { title: "Availability", url: "/cleaner/availability", icon: CalendarClock },
      { title: "Service Areas", url: "/cleaner/service-areas", icon: MapPin },
      { title: "Team", url: "/cleaner/team", icon: Users },
      { title: "Calendar Sync", url: "/cleaner/calendar-sync", icon: Link2 },
      { title: "Verification", url: "/cleaner/verification", icon: CheckCircle },
      { title: "Reliability", url: "/cleaner/reliability", icon: Award },
    ]
  },
  {
    group: "Support",
    items: [
      { title: "Messages", url: "/cleaner/messages", icon: MessageSquare },
      { title: "Resources", url: "/cleaner/resources", icon: FileText },
      { title: "Cancellation Policy", url: "/cleaner/cancellation-policy", icon: AlertTriangle },
    ]
  }
];

// Admin navigation items
const adminNavItems = [
  {
    group: "Analytics",
    items: [
      { title: "Analytics Hub", url: "/admin/analytics", icon: BarChart3 },
      { title: "CEO Dashboard", url: "/admin/ceo", icon: TrendingUp },
      { title: "Operations", url: "/admin/operations", icon: Activity },
      { title: "Finance", url: "/admin/finance", icon: DollarSign },
      { title: "Growth", url: "/admin/growth", icon: Users },
      { title: "Performance", url: "/admin/performance", icon: Star },
      { title: "Conversions", url: "/admin/conversions", icon: PieChart },
      { title: "Cohort Analysis", url: "/admin/cohort-analysis", icon: BarChart3 },
      { title: "Geo Insights", url: "/admin/geo-insights", icon: MapPin },
    ]
  },
  {
    group: "Trust & Safety",
    items: [
      { title: "Trust & Safety", url: "/admin/trust-safety", icon: Shield },
      { title: "Fraud Alerts", url: "/admin/fraud-alerts", icon: AlertTriangle },
      { title: "Disputes", url: "/admin/disputes", icon: FileText },
      { title: "Client Risk", url: "/admin/client-risk", icon: Users },
      { title: "ID Verifications", url: "/admin/id-verifications", icon: CheckCircle },
      { title: "Reports", url: "/admin/trust-safety-reports", icon: PieChart },
    ]
  },
  {
    group: "Management",
    items: [
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Bookings", url: "/admin/bookings", icon: Calendar },
      { title: "Client Jobs", url: "/admin/client-jobs", icon: Briefcase },
      { title: "Pricing Rules", url: "/admin/pricing-rules", icon: CreditCard },
      { title: "Pricing Mgmt", url: "/admin/pricing", icon: DollarSign },
      { title: "Bulk Comms", url: "/admin/bulk-comms", icon: MessageSquare },
      { title: "Platform Config", url: "/admin/platform-config", icon: Settings },
    ]
  }
];

// Public navigation items
const publicNavItems = [
  {
    group: "Navigation",
    items: [
      { title: "Home", url: "/", icon: Home },
      { title: "Browse Cleaners", url: "/discover", icon: Search },
      { title: "Pricing", url: "/pricing", icon: DollarSign },
      { title: "About Us", url: "/about", icon: Users },
      { title: "Help", url: "/help", icon: MessageSquare },
      { title: "Legal Center", url: "/legal", icon: Scale },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const getNavItems = () => {
    if (!isAuthenticated) return publicNavItems;
    if (user?.role === "admin") return adminNavItems;
    if (user?.role === "cleaner") return cleanerNavItems;
    return clientNavItems;
  };

  const navGroups = getNavItems();

  const isActive = (path: string) => location.pathname === path;

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar
        className={`${collapsed ? "w-14" : "w-64"} transition-all duration-300 border-r border-border bg-background`}
        collapsible="icon"
      >
        <SidebarContent className="pt-2">
          {navGroups.map((group) => (
            <SidebarGroup key={group.group}>
              {!collapsed && (
                <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">
                  {group.group}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        {collapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <NavLink
                                to={item.url}
                                end={item.url === "/" || item.url === "/dashboard" || item.url === "/cleaner/dashboard"}
                                className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isActive(item.url)
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                                activeClassName="bg-primary/10 text-primary"
                              >
                                <item.icon className="h-4 w-4 flex-shrink-0" />
                              </NavLink>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {item.title}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <NavLink
                            to={item.url}
                            end={item.url === "/" || item.url === "/dashboard" || item.url === "/cleaner/dashboard"}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive(item.url)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                            activeClassName="bg-primary/10 text-primary"
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span>{item.title}</span>
                          </NavLink>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
    </TooltipProvider>
  );
}