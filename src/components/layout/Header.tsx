/**
 * Minimal standalone header used ONLY by pages that render outside MainLayout
 * (ForgotPassword, ResetPassword, CleanerOnboarding).
 * All authenticated pages use the header embedded in MainLayout.
 */
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import logo from "@/assets/brand/puretask-mark-sm.webp";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-xl border-b border-aero flex items-center px-6">
      <div className="flex w-full items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={logo}
            alt="PureTask"
            className="h-9 w-9 object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-poppins font-bold text-lg tracking-tight text-aero-trust">PureTask</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex h-11 px-4 touch-target font-medium">
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button size="sm" asChild className="h-11 px-5 touch-target rounded-full font-semibold bg-gradient-aero hover:opacity-95 border-0 shadow-aero">
            <Link to="/auth?mode=signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
