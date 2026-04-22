import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  ChevronDown,
  LogOut,
  Settings,
  User,
  Bot,
  Wifi,
  WifiOff,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Dashboard", href: "/cleaner/dashboard", icon: LayoutDashboard },
  { label: "Schedule", href: "/cleaner/schedule", icon: Calendar },
  { label: "Earnings", href: "/cleaner/earnings", icon: DollarSign },
  { label: "Messages", href: "/cleaner/messages", icon: MessageSquare },
  { label: "AI Assistant", href: "/cleaner/ai-assistant", icon: Bot },
];

export function CleanerHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile } = useCleanerProfile();
  const queryClient = useQueryClient();
  const [toggling, setToggling] = useState(false);

  const isAvailable = profile?.is_available ?? false;

  const handleToggleAvailability = async () => {
    if (!profile?.id) {
      toast.error("Cleaner profile not loaded yet");
      return;
    }

    const next = !isAvailable;
    setToggling(true);

    try {
      const { data, error } = await supabase
        .from("cleaner_profiles")
        .update({ is_available: next })
        .eq("id", profile.id)
        .select("id, is_available")
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("No profile row updated");

      queryClient.setQueriesData({ queryKey: ["cleaner-profile"] }, (old: any) =>
        old ? { ...old, is_available: next } : old
      );
      await queryClient.invalidateQueries({ queryKey: ["cleaner-profile"] });

      toast.success(
        next
          ? "You're now available — clients can book you!"
          : "You're now offline — you won't receive new bookings."
      );
    } catch (error) {
      console.error("Availability toggle failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update availability"
      );
    } finally {
      setToggling(false);
    }
  };

  const handleLogout = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    // Navigate to public page FIRST before clearing auth state
    // to prevent RequireAuth from redirecting back to /auth mid-logout.
    navigate("/", { replace: true });
    try {
      await logout();
    } catch {
      // ignore — session cleared client-side regardless
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/cleaner/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">PT</span>
            </div>
            <span className="font-bold text-xl">PureTask</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* One-tap availability toggle */}
          <button
            onClick={handleToggleAvailability}
            disabled={toggling || !profile}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
              isAvailable
                ? "bg-success/10 border-success/30 text-success hover:bg-success/20"
                : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {toggling ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isAvailable ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            {isAvailable ? "Online" : "Offline"}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {/* availability indicator dot */}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${
                      isAvailable ? "bg-success" : "bg-muted-foreground"
                    }`}
                  />
                </div>
                <span className="hidden md:inline text-sm font-medium">
                  {user?.name || "User"}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {/* Mobile availability toggle inside dropdown */}
              <div className="px-2 py-2 md:hidden">
                <button
                  onClick={handleToggleAvailability}
                  disabled={toggling || !profile}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isAvailable
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {toggling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isAvailable ? (
                    <Wifi className="h-4 w-4" />
                  ) : (
                    <WifiOff className="h-4 w-4" />
                  )}
                  {isAvailable ? "Online — tap to go offline" : "Offline — tap to go online"}
                </button>
              </div>
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuItem asChild>
                <Link to="/cleaner/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/cleaner/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => handleLogout(e)} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
