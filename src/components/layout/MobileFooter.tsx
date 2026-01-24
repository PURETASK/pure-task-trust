import { Link } from "react-router-dom";

export function MobileFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="md:hidden py-4 px-4 border-t border-border bg-background text-center">
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span>© {currentYear} PureTask</span>
        <Link to="/legal" className="hover:text-foreground transition-colors">
          Privacy
        </Link>
        <Link to="/legal" className="hover:text-foreground transition-colors">
          Terms
        </Link>
        <Link to="/help" className="hover:text-foreground transition-colors">
          Help
        </Link>
      </div>
    </footer>
  );
}
