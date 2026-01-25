import { Link } from "react-router-dom";

// Custom Link component that scrolls to top
function FooterLink({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  const handleClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };
  
  return (
    <Link to={to} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}

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
