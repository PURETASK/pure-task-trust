import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

function FooterLink({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  return (
    <Link to={to} onClick={() => window.scrollTo({ top: 0, behavior: "instant" })} className={className}>
      {children}
    </Link>
  );
}

export function MobileFooter() {
  const { user, isAuthenticated } = useAuth();
  const currentYear = new Date().getFullYear();

  const roleColor = !isAuthenticated
    ? "text-primary"
    : user?.role === "admin"
    ? "text-destructive"
    : user?.role === "cleaner"
    ? "text-success"
    : "text-primary";

  return (
    <footer className="md:hidden py-4 px-4 border-t border-border bg-background/95 text-center">
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground flex-wrap">
        <span>© {currentYear} PureTask</span>
        <FooterLink to="/legal" className={cn("hover:text-foreground transition-colors", roleColor + "/70 hover:" + roleColor)}>
          Privacy
        </FooterLink>
        <FooterLink to="/legal" className="hover:text-foreground transition-colors">
          Terms
        </FooterLink>
        <FooterLink to="/help" className="hover:text-foreground transition-colors">
          Help
        </FooterLink>
        {!isAuthenticated && (
          <FooterLink to="/about" className="hover:text-foreground transition-colors">
            About
          </FooterLink>
        )}
      </div>
    </footer>
  );
}
