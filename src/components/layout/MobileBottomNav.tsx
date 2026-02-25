import { Link, useLocation } from "react-router-dom";
import { Home, Search, Calendar, MessageSquare, User, Briefcase, DollarSign, LogIn, Tag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const clientNavItems: NavItem[] = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Search, label: "Find", path: "/discover" },
  { icon: Calendar, label: "Book", path: "/book" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: User, label: "Profile", path: "/profile" },
];

const cleanerNavItems: NavItem[] = [
  { icon: Home, label: "Dashboard", path: "/cleaner/dashboard" },
  { icon: Briefcase, label: "Jobs", path: "/cleaner/jobs" },
  { icon: DollarSign, label: "Earnings", path: "/cleaner/earnings" },
  { icon: MessageSquare, label: "Messages", path: "/cleaner/messages" },
  { icon: User, label: "Profile", path: "/cleaner/profile/view" },
];

const unauthenticatedNavItems: NavItem[] = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Find", path: "/discover" },
  { icon: Tag, label: "Pricing", path: "/pricing" },
  { icon: LogIn, label: "Sign In", path: "/auth" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  // Determine which nav items to show based on auth state and role
  const userRole = user?.role;
  const navItems = !user 
    ? unauthenticatedNavItems 
    : userRole === 'cleaner' 
      ? cleanerNavItems 
      : clientNavItems;

  // Don't show on auth pages or onboarding
  const hiddenPaths = ['/auth', '/role-selection', '/cleaner/onboarding', '/forgot-password', '/reset-password'];
  if (hiddenPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Exact match OR path starts with item path only for nested routes (not "/" and not cross-role prefixes)
          const isActive = location.pathname === item.path ||
            (item.path.length > 1 && item.path !== '/discover' && location.pathname.startsWith(item.path + '/'));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors touch-target",
                "active:scale-95 transition-transform",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "font-semibold"
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
