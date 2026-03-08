import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  HelpCircle, 
  User, 
  LogOut,
  LayoutDashboard,
  Wallet,
  MessageSquare,
  Calendar,
  DollarSign,
  Settings,
  Briefcase,
  Users,
  CreditCard
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { AdminAlertsBadge } from "@/components/admin/AdminAlertsBadge";
import { useWallet } from "@/hooks/useWallet";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // C5: Credit balance chip — only for clients
  const { account } = useWallet();
  const availableCredits = user?.role === 'client' && account
    ? (account.current_balance || 0) - (account.held_balance || 0)
    : null;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Public navigation (not logged in)
  const publicNav = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/discover", icon: Search, label: "Browse Cleaners" },
    { to: "/help", icon: HelpCircle, label: "Support" },
  ];

  // Client navigation
  const clientNav = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/discover", icon: Search, label: "Find Cleaners" },
    { to: "/wallet", icon: Wallet, label: "Wallet" },
    { to: "/messages", icon: MessageSquare, label: "Messages" },
  ];

  // Cleaner navigation
  const cleanerNav = [
    { to: "/cleaner/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/cleaner/schedule", icon: Calendar, label: "Schedule" },
    { to: "/cleaner/earnings", icon: DollarSign, label: "Earnings" },
    { to: "/cleaner/messages", icon: MessageSquare, label: "Messages" },
  ];

  const getNavItems = () => {
    if (!isAuthenticated) return publicNav;
    if (user?.role === "cleaner") return cleanerNav;
    return clientNav;
  };

  const navItems = getNavItems();

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to={isAuthenticated ? (user?.role === "cleaner" ? "/cleaner/dashboard" : "/dashboard") : "/"} className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-xl text-foreground">PureTask</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`
                    flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg
                    ${isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated && <NotificationBell />}
            {isAuthenticated && user?.role === 'admin' && <AdminAlertsBadge />}

            {/* C5: Credit balance chip for clients */}
            {isAuthenticated && user?.role === 'client' && availableCredits !== null && (
              <Link to="/wallet">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer">
                  <CreditCard className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-semibold text-primary">{availableCredits}</span>
                  <span className="text-xs text-primary/70">credits</span>
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
                    <span className="font-medium">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <Link 
                    to={user.role === "cleaner" ? "/cleaner/profile/view" : "/profile"}
                    className="block px-2 py-1.5 hover:bg-accent rounded-sm transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                        <span className="text-xs text-primary font-medium capitalize">{user.role}</span>
                      </div>
                    </div>
                  </Link>
                  <DropdownMenuSeparator />
                  
                  {user.role === "cleaner" ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/cleaner/profile" className="flex items-center gap-2 cursor-pointer">
                          <Settings className="h-4 w-4" />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/cleaner/earnings" className="flex items-center gap-2 cursor-pointer">
                          <DollarSign className="h-4 w-4" />
                          Earnings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/cleaner/referral" className="flex items-center gap-2 cursor-pointer">
                          <Users className="h-4 w-4" />
                          Referrals
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/wallet" className="flex items-center gap-2 cursor-pointer">
                          <Wallet className="h-4 w-4" />
                          Wallet
                          {availableCredits !== null && (
                            <span className="ml-auto text-xs font-medium text-primary">{availableCredits} cr</span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/discover" className="flex items-center gap-2 cursor-pointer">
                          <Search className="h-4 w-4" />
                          Find Cleaners
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/settings/notifications" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Notifications
                    </Link>
                  </DropdownMenuItem>
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
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {/* C5: Mobile credit chip */}
              {isAuthenticated && user?.role === 'client' && availableCredits !== null && (
                <Link to="/wallet" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 mb-3">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">{availableCredits} credits available</span>
                  </div>
                </Link>
              )}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-foreground hover:bg-secondary"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
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
