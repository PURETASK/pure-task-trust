import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Link, useNavigate, Outlet } from "react-router-dom";
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
import { LogOut, HelpCircle, Shield, Bell } from "lucide-react";
import logo from "@/assets/logo.png";
import { CreditChip } from "@/components/layout/header/CreditChip";
import { CleanerAvailabilityToggle } from "@/components/layout/header/CleanerAvailabilityToggle";
import { RoleBadge } from "@/components/layout/header/RoleBadge";
import { RoleQuickLinks } from "@/components/layout/header/RoleQuickLinks";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children?: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    // Navigate first so we land on a public page before auth state clears,
    // preventing RequireAuth from bouncing back to /auth mid-logout.
    navigate("/", { replace: true });
    try {
      await logout();
    } catch {
      // ignore — session is cleared client-side regardless
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const getHomePath = () => {
    if (!isAuthenticated) return "/";
    if (user?.role === "cleaner") return "/cleaner/dashboard";
    if (user?.role === "admin") return "/admin/hub";
    return "/dashboard";
  };

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
            "sticky top-0 z-40 h-12 sm:h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-safe",
            headerAccentClass
          )}>
            <div className="flex h-full items-center justify-between px-2 sm:px-4">

              {/* LEFT: Trigger + Logo */}
              <div className="flex items-center gap-2 sm:gap-3">
                <SidebarTrigger className="h-9 w-9 touch-target" />

                <Link to={getHomePath()} className="flex items-center gap-2 group">
                  <img
                    src={logo}
                    alt="PureTask logo"
                    className="h-7 w-7 sm:h-8 sm:w-8 object-contain transition-transform group-hover:scale-105"
                  />
                  <span className="font-bold text-base sm:text-lg text-foreground">PureTask</span>
                  {isAuthenticated && user?.role === "admin" && (
                    <span className="hidden sm:block text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">
                      Admin
                    </span>
                  )}
                </Link>
              </div>

              {/* RIGHT: Actions */}
              <div className="flex items-center gap-1 sm:gap-2">
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

                    {/* Client: Credit balance chip — hide on smallest screens */}
                    {user.role === "client" && (
                      <div className="hidden xs:flex">
                        <CreditChip />
                      </div>
                    )}

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
          <main className="flex-1 overflow-x-hidden min-w-0 pb-14 md:pb-0">
            <PageTransition>{children ?? <Outlet />}</PageTransition>
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
