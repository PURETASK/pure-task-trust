import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserInspectorPanel } from "./UserInspectorPanel";
import {
  LayoutDashboard, BarChart3, BookOpen, Shield, TrendingUp,
  DollarSign, Users, Star, AlertTriangle, MessageSquare,
  Fingerprint, Tag, Activity, ChevronRight, MapPin, Settings, AtSign
} from "lucide-react";

const ADMIN_ROUTES = [
  { label: "Analytics Hub", href: "/admin/analytics", icon: BarChart3, group: "Dashboards" },
  { label: "CEO Dashboard", href: "/admin/ceo", icon: TrendingUp, group: "Dashboards" },
  { label: "Operations Dashboard", href: "/admin/operations", icon: Activity, group: "Dashboards" },
  { label: "Finance Dashboard", href: "/admin/finance", icon: DollarSign, group: "Dashboards" },
  { label: "Growth Dashboard", href: "/admin/growth", icon: Users, group: "Dashboards" },
  { label: "Performance Metrics", href: "/admin/performance", icon: Star, group: "Dashboards" },
  { label: "Conversion Dashboard", href: "/admin/conversions", icon: BarChart3, group: "Dashboards" },
  { label: "Cohort Analysis", href: "/admin/cohort-analysis", icon: BarChart3, group: "Dashboards" },
  { label: "Geo Insights", href: "/admin/geo-insights", icon: MapPin, group: "Dashboards" },
  { label: "Bookings Console", href: "/admin/bookings", icon: BookOpen, group: "Operations" },
  { label: "Disputes", href: "/admin/disputes", icon: MessageSquare, group: "Operations" },
  { label: "Fraud Alerts", href: "/admin/fraud-alerts", icon: AlertTriangle, group: "Operations" },
  { label: "Client Risk", href: "/admin/client-risk", icon: Shield, group: "Operations" },
  { label: "ID Verifications", href: "/admin/id-verifications", icon: Fingerprint, group: "Operations" },
  { label: "Trust & Safety", href: "/admin/trust-safety", icon: Shield, group: "Operations" },
  { label: "Bulk Communications", href: "/admin/bulk-comms", icon: MessageSquare, group: "Operations" },
  { label: "Pricing Management", href: "/admin/pricing", icon: Tag, group: "Settings" },
  { label: "Platform Config", href: "/admin/platform-config", icon: Settings, group: "Settings" },
];

const groups = ["Dashboards", "Operations", "Settings"] as const;

export function AdminCommandPalette() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inspectorUser, setInspectorUser] = useState<{ userId: string; role: "client" | "cleaner" } | null>(null);
  const navigate = useNavigate();

  const isUserSearch = inputValue.startsWith("@");
  const userQuery = isUserSearch ? inputValue.slice(1).trim() : "";

  const { data: userResults } = useQuery({
    queryKey: ["admin-user-search", userQuery],
    enabled: isUserSearch && userQuery.length >= 2,
    queryFn: async () => {
      const [cleaners, clients] = await Promise.all([
        supabase.from("cleaner_profiles")
          .select("id, first_name, last_name, user_id, tier")
          .or(`first_name.ilike.%${userQuery}%,last_name.ilike.%${userQuery}%`)
          .limit(5),
        supabase.from("client_profiles")
          .select("id, first_name, last_name, user_id")
          .or(`first_name.ilike.%${userQuery}%,last_name.ilike.%${userQuery}%`)
          .limit(5),
      ]);
      return [
        ...(cleaners.data || []).map(c => ({ ...c, role: "cleaner" as const })),
        ...(clients.data || []).map(c => ({ ...c, role: "client" as const })),
      ];
    },
    staleTime: 10_000,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    setInputValue("");
    navigate(href);
  };

  const handleUserSelect = (userId: string, role: "client" | "cleaner") => {
    setOpen(false);
    setInputValue("");
    setInspectorUser({ userId, role });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <span>Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-xs font-medium">
          <span>⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setInputValue(""); }}>
        <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
          <Command className="rounded-xl">
            <CommandInput
              placeholder={isUserSearch ? "Search users by name..." : "Search admin pages... (type @ to search users)"}
              className="h-12"
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandEmpty>
              {isUserSearch && userQuery.length < 2
                ? <p className="py-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2"><AtSign className="h-4 w-4" />Type at least 2 characters to search users</p>
                : "No results found."}
            </CommandEmpty>

            {/* User Search Results */}
            {isUserSearch && userResults && userResults.length > 0 && (
              <CommandGroup heading="Users">
                {userResults.map((user) => {
                  const name = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown";
                  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <CommandItem
                      key={`${user.role}-${user.id}`}
                      value={name}
                      onSelect={() => handleUserSelect(user.user_id, user.role)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="flex-1">{name}</span>
                      <Badge variant="outline" className="text-xs capitalize">{user.role}</Badge>
                      {(user as any).tier && <Badge variant="secondary" className="text-xs capitalize">{(user as any).tier}</Badge>}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {/* Route Search */}
            {!isUserSearch && groups.map((group, gi) => {
              const items = ADMIN_ROUTES.filter((r) => r.group === group);
              return (
                <CommandGroup key={group} heading={group}>
                  {items.map((route) => (
                    <CommandItem
                      key={route.href}
                      value={route.label}
                      onSelect={() => handleSelect(route.href)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <route.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span>{route.label}</span>
                      <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground" />
                    </CommandItem>
                  ))}
                  {gi < groups.length - 1 && <CommandSeparator />}
                </CommandGroup>
              );
            })}
          </Command>
        </DialogContent>
      </Dialog>

      <UserInspectorPanel
        userId={inspectorUser?.userId || null}
        userRole={inspectorUser?.role || null}
        open={!!inspectorUser}
        onOpenChange={(v) => { if (!v) setInspectorUser(null); }}
      />
    </>
  );
}
