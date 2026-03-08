import { Link } from "react-router-dom";
import { forwardRef } from "react";

// Forward ref to fix React warning about function components being given refs
const FooterLink = forwardRef<HTMLAnchorElement, { to: string; children: React.ReactNode; className?: string }>(
  ({ to, children, className }, ref) => {
    const handleClick = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };
    return (
      <Link to={to} onClick={handleClick} className={className} ref={ref}>
        {children}
      </Link>
    );
  }
);
FooterLink.displayName = "FooterLink";

export function MobileFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="md:hidden py-4 px-4 border-t border-border bg-background text-center">
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span>© {currentYear} PureTask</span>
        <FooterLink to="/legal" className="hover:text-foreground transition-colors">
          Privacy
        </FooterLink>
        <FooterLink to="/legal" className="hover:text-foreground transition-colors">
          Terms
        </FooterLink>
        <FooterLink to="/help" className="hover:text-foreground transition-colors">
          Help
        </FooterLink>
      </div>
    </footer>
  );
}
