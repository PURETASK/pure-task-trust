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
import {
  LayoutDashboard, BarChart3, BookOpen, Shield, TrendingUp,
  DollarSign, Users, Star, AlertTriangle, MessageSquare,
  Fingerprint, Tag, Activity, ChevronRight
} from "lucide-react";

const ADMIN_ROUTES = [
  { label: "Analytics Hub", href: "/admin/analytics", icon: BarChart3, group: "Dashboards" },
  { label: "CEO Dashboard", href: "/admin/ceo", icon: TrendingUp, group: "Dashboards" },
  { label: "Operations Dashboard", href: "/admin/operations", icon: Activity, group: "Dashboards" },
  { label: "Finance Dashboard", href: "/admin/finance", icon: DollarSign, group: "Dashboards" },
  { label: "Growth Dashboard", href: "/admin/growth", icon: Users, group: "Dashboards" },
  { label: "Performance Metrics", href: "/admin/performance", icon: Star, group: "Dashboards" },
  { label: "Conversion Dashboard", href: "/admin/conversions", icon: BarChart3, group: "Dashboards" },
  { label: "Bookings Console", href: "/admin/bookings", icon: BookOpen, group: "Operations" },
  { label: "Disputes", href: "/admin/disputes", icon: MessageSquare, group: "Operations" },
  { label: "Fraud Alerts", href: "/admin/fraud-alerts", icon: AlertTriangle, group: "Operations" },
  { label: "Client Risk", href: "/admin/client-risk", icon: Shield, group: "Operations" },
  { label: "ID Verifications", href: "/admin/id-verifications", icon: Fingerprint, group: "Operations" },
  { label: "Trust & Safety", href: "/admin/trust-safety", icon: Shield, group: "Operations" },
  { label: "Pricing Management", href: "/admin/pricing", icon: Tag, group: "Settings" },
];

const groups = ["Dashboards", "Operations", "Settings"] as const;

export function AdminCommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

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
    navigate(href);
  };

  return (
    <>
      {/* Trigger hint */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <span>Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-xs font-medium">
          <span>⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
          <Command className="rounded-xl">
            <CommandInput placeholder="Search admin pages..." className="h-12" />
            <CommandEmpty>No results found.</CommandEmpty>
            {groups.map((group, gi) => {
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
    </>
  );
}
