import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Shield, AlertTriangle, MessageSquare, Users, FileText,
  DollarSign, BarChart3, Settings, Webhook, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WF 55–60 — admin sidebar + right-drawer shell.
 * Provides a consistent left nav for all admin pages plus an optional
 * right-side detail drawer that pages can mount via the `drawer` prop.
 */
const NAV = [
  { to: "/admin/hub", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/operations", label: "Operations", icon: Activity },
  { to: "/admin/bookings", label: "Bookings", icon: FileText },
  { to: "/admin/disputes", label: "Disputes", icon: MessageSquare },
  { to: "/admin/trust-safety", label: "Trust & Safety", icon: Shield },
  { to: "/admin/fraud-alerts", label: "Fraud", icon: AlertTriangle },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/finance", label: "Finance", icon: DollarSign },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/webhook-log", label: "Webhooks", icon: Webhook },
  { to: "/admin/platform-config", label: "Config", icon: Settings },
];

export function AdminShell({
  title,
  subtitle,
  children,
  drawer,
  drawerOpen,
  onDrawerClose,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  drawer?: ReactNode;
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
}) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-app-canvas flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col bg-app-surface border-r border-hairline-soft">
        <div className="px-4 py-4 border-b border-hairline-soft">
          <div className="text-[11px] uppercase tracking-[0.08em] text-ink-faint font-bold">PureTask</div>
          <div className="text-[14px] font-semibold text-ink">Admin Console</div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {NAV.map((n) => {
            const active = pathname === n.to || pathname.startsWith(n.to + "/");
            return (
              <NavLink
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] mb-0.5 transition-colors",
                  active
                    ? "bg-state-info-bg/40 text-primary font-semibold"
                    : "text-ink-muted hover:bg-app-canvas hover:text-ink",
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="bg-app-surface border-b border-hairline-soft px-4 sm:px-6 py-4">
          <h1 className="text-[20px] font-bold text-ink">{title}</h1>
          {subtitle && <p className="text-[12px] text-ink-muted mt-0.5">{subtitle}</p>}
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>

      {/* Right drawer */}
      {drawer && drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-aero-trust/30 backdrop-blur-sm z-40 md:hidden"
            onClick={onDrawerClose}
          />
          <aside className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-app-surface border-l border-hairline-soft shadow-wf-hover z-50 overflow-y-auto">
            {drawer}
          </aside>
        </>
      )}
    </div>
  );
}