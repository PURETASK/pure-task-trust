import { ReactNode, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { MobileFooter } from "@/components/layout/MobileFooter";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { AdminAlertsBadge } from "@/components/admin/AdminAlertsBadge";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut, Settings, HelpCircle, Wallet, Wifi, WifiOff, Loader2,
  LayoutDashboard, Calendar, DollarSign, Shield, Search, Sparkles,
  Bell, User, BookOpen, Users, TrendingUp, Bot, Star
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

// ─── CREDIT CHIP (Client only) ────────────────────────────────────────────────
function CreditChip() {
  const { account } = useWallet();
  if (account === null || account === undefined) return null;
  const available = (account.current_balance || 0) - (account.held_balance || 0);
  return (
    <Link
      to="/wallet"
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-colors group"
    >
      <Wallet className="h-3.5 w-3.5 text-primary" />
      <span className="text-xs font-bold text-primary">{available}</span>
      <span className="text-xs text-primary/60 font-medium">cr</span>
    </Link>
  );
}

// ─── AVAILABILITY TOGGLE (Cleaner only) ───────────────────────────────────────
function CleanerAvailabilityToggle() {
  const { profile } = useCleanerProfile();
  const queryClient = useQueryClient();
  const [toggling, setToggling] = useState(false);
  const isAvailable = profile?.is_available ?? false;

  const handleToggle = async () => {
    if (!profile?.id) return;
    setToggling(true);
    try {
      const { error } = await supabase
        .from("cleaner_profiles")
        .update({ is_available: !isAvailable })
        .eq("id", profile.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["cleaner-profile"] });
      toast.success(
        !isAvailable
          ? "You're now online — clients can book you!"
          : "You're now offline — no new bookings."
      );
    } catch {
      toast.error("Failed to update availability");
    } finally {
      setToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={toggling || !profile}
      className={cn(
        "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all",
        isAvailable
          ? "bg-success/10 border-success/30 text-success hover:bg-success/20 shadow-sm"
          : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
      )}
    >
      {toggling ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <span className={cn(
          "h-2 w-2 rounded-full",
          isAvailable ? "bg-success animate-pulse" : "bg-muted-foreground"
        )} />
      )}
      {isAvailable ? "Online" : "Offline"}
    </button>
  );
}

// ─── ROLE BADGE ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const config = {
    admin:   { label: "Admin",   className: "bg-destructive/10 text-destructive border-destructive/20" },
    cleaner: { label: "Cleaner", className: "bg-success/10 text-success border-success/20" },
    client:  { label: "Client",  className: "bg-primary/10 text-primary border-primary/20" },
  }[role] ?? { label: role, className: "bg-muted text-muted-foreground border-border" };

  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide", config.className)}>
      {config.label}
    </span>
  );
}

// ─── ROLE-SPECIFIC QUICK LINKS in dropdown ────────────────────────────────────
function RoleQuickLinks({ role }: { role: string }) {
  if (role === "admin") return (
    <>
      <DropdownMenuItem asChild>
        <Link to="/admin/hub" className="flex items-center gap-2 cursor-pointer">
          <LayoutDashboard className="h-4 w-4 text-destructive" />Admin Hub
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/admin/analytics" className="flex items-center gap-2 cursor-pointer">
          <TrendingUp className="h-4 w-4 text-destructive" />Analytics
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/admin/trust-safety" className="flex items-center gap-2 cursor-pointer">
          <Shield className="h-4 w-4 text-destructive" />Trust & Safety
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/admin/users" className="flex items-center gap-2 cursor-pointer">
          <Users className="h-4 w-4 text-destructive" />Users
        </Link>
      </DropdownMenuItem>
    </>
  );

  if (role === "cleaner") return (
    <>
      <DropdownMenuItem asChild>
        <Link to="/cleaner/dashboard" className="flex items-center gap-2 cursor-pointer">
          <LayoutDashboard className="h-4 w-4 text-success" />Dashboard
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/cleaner/schedule" className="flex items-center gap-2 cursor-pointer">
          <Calendar className="h-4 w-4 text-success" />My Schedule
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/cleaner/earnings" className="flex items-center gap-2 cursor-pointer">
          <DollarSign className="h-4 w-4 text-success" />Earnings
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/cleaner/ai-assistant" className="flex items-center gap-2 cursor-pointer">
          <Bot className="h-4 w-4 text-success" />AI Assistant
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/cleaner/settings" className="flex items-center gap-2 cursor-pointer">
          <Settings className="h-4 w-4 text-success" />Settings
        </Link>
      </DropdownMenuItem>
    </>
  );

  // Client
  return (
    <>
      <DropdownMenuItem asChild>
        <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
          <LayoutDashboard className="h-4 w-4 text-primary" />Dashboard
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/discover" className="flex items-center gap-2 cursor-pointer">
          <Search className="h-4 w-4 text-primary" />Find Cleaners
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/wallet" className="flex items-center gap-2 cursor-pointer">
          <Wallet className="h-4 w-4 text-primary" />Wallet & Credits
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/referral" className="flex items-center gap-2 cursor-pointer">
          <Star className="h-4 w-4 text-primary" />Referral Program
        </Link>
      </DropdownMenuItem>
    </>
  );
}

// ─── MAIN LAYOUT ──────────────────────────────────────────────────────────────
export function MainLayout({ children }: MainLayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const getHomePath = () => {
    if (!isAuthenticated) return "/";
    if (user?.role === "cleaner") return "/cleaner/dashboard";
    if (user?.role === "admin") return "/admin/hub";
    return "/dashboard";
  };

  // Per-role header accent stripe color
  const headerAccentClass = !isAuthenticated
    ? ""
    : user?.role === "admin"
    ? "border-b-destructive/30"
    : user?.role === "cleaner"
    ? "border-b-success/30"
    : "border-b-primary/30";

  const avatarRingClass = !isAuthenticated
    ? ""
    : user?.role === "admin"
    ? "ring-destructive/40"
    : user?.role === "cleaner"
    ? "ring-success/40"
    : "ring-primary/40";

  return (
    <SidebarProvider>
      <div className="min-h-dvh flex w-full max-w-[100vw] bg-background overflow-x-hidden">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-h-dvh min-w-0">
          {/* ── HEADER ───────────────────────────────────────────────────── */}
          <header className={cn(
            "sticky top-0 z-40 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            headerAccentClass
          )}>
            <div className="flex h-full items-center justify-between px-3 sm:px-4">

              {/* LEFT: Trigger + Logo */}
              <div className="flex items-center gap-2 sm:gap-3">
                <SidebarTrigger className="h-9 w-9 touch-target" />

                <Link to={getHomePath()} className="flex items-center gap-2 group">
                  <div className={cn(
                    "h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105",
                    !isAuthenticated || user?.role === "client"
                      ? "gradient-brand"
                      : user?.role === "cleaner"
                      ? "bg-success"
                      : "bg-destructive"
                  )}>
                    {user?.role === "admin" ? (
                      <Shield className="h-4 w-4 text-white" />
                    ) : user?.role === "cleaner" ? (
                      <Sparkles className="h-4 w-4 text-white" />
                    ) : (
                      <span className="text-white font-bold text-xs sm:text-sm">P</span>
                    )}
                  </div>
                  <span className="font-bold text-base sm:text-lg text-foreground">PureTask</span>
                  {isAuthenticated && user?.role === "admin" && (
                    <span className="hidden sm:block text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">
                      Admin
                    </span>
                  )}
                </Link>
              </div>

              {/* RIGHT: Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ThemeToggle />

                {isAuthenticated && user ? (
                  <>
                    {/* Admin: Command Palette + Alerts */}
                    {user.role === "admin" && (
                      <div className="hidden md:flex items-center gap-1">
                        <AdminCommandPalette />
                        <AdminAlertsBadge />
                      </div>
                    )}

                    {/* Cleaner: Online/Offline toggle */}
                    {user.role === "cleaner" && <CleanerAvailabilityToggle />}

                    {/* Client: Credit balance chip */}
                    {user.role === "client" && <CreditChip />}

                    {/* Notifications bell */}
                    <div className="hidden sm:flex">
                      <NotificationBell />
                    </div>

                    {/* Avatar dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 h-9 touch-target rounded-full"
                        >
                          <Avatar className={cn("h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-offset-1 ring-offset-background", avatarRingClass)}>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className={cn(
                              "text-xs sm:text-sm font-bold",
                              user.role === "admin" ? "bg-destructive/10 text-destructive" :
                              user.role === "cleaner" ? "bg-success/10 text-success" :
                              "bg-primary/10 text-primary"
                            )}>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium hidden md:inline text-sm">{user.name}</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-64">
                        {/* Profile header */}
                        <Link
                          to={
                            user.role === "cleaner" ? "/cleaner/profile/view" :
                            user.role === "admin" ? "/admin/hub" : "/profile"
                          }
                          className="block px-3 py-2.5 hover:bg-muted rounded-t-md transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className={cn("h-10 w-10 ring-2 ring-offset-1 ring-offset-background", avatarRingClass)}>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className={cn(
                                "font-bold text-sm",
                                user.role === "admin" ? "bg-destructive/10 text-destructive" :
                                user.role === "cleaner" ? "bg-success/10 text-success" :
                                "bg-primary/10 text-primary"
                              )}>
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-sm truncate">{user.name}</span>
                              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                              <RoleBadge role={user.role} />
                            </div>
                          </div>
                        </Link>

                        <DropdownMenuSeparator />
                        <RoleQuickLinks role={user.role} />
                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                          <Link to="/notifications" className="flex items-center gap-2 cursor-pointer">
                            <Bell className="h-4 w-4" />Notifications
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/help" className="flex items-center gap-2 cursor-pointer">
                            <HelpCircle className="h-4 w-4" />Help & Support
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer font-medium"
                        >
                          <LogOut className="h-4 w-4 mr-2" />Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  /* Guest CTAs */
                  <nav aria-label="Main navigation" className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild className="h-9 hidden sm:flex font-medium">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                    <Button size="sm" asChild className="h-9 font-semibold rounded-full px-4">
                      <Link to="/auth?mode=signup">Get Started</Link>
                    </Button>
                  </nav>
                )}
              </div>
            </div>
          </header>

          {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
          <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden">
            <PageTransition>{children}</PageTransition>
          </main>

          {/* ── FOOTER ───────────────────────────────────────────────────── */}
          <div className="hidden md:block">
            <Footer />
          </div>
          <MobileFooter />
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </SidebarProvider>
  );
}
