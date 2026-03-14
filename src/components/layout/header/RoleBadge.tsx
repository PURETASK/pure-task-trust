import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: string;
}

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  admin:   { label: "Admin",   className: "bg-destructive/10 text-destructive border-destructive/20" },
  cleaner: { label: "Cleaner", className: "bg-success/10 text-success border-success/20" },
  client:  { label: "Client",  className: "bg-primary/10 text-primary border-primary/20" },
};

/**
 * Small role indicator pill shown in the user dropdown header.
 */
export function RoleBadge({ role }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role] ?? { label: role, className: "bg-muted text-muted-foreground border-border" };

  return (
    <span
      className={cn(
        "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
