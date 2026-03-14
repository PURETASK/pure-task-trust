/**
 * Minimal standalone header used ONLY by pages that render outside MainLayout
 * (ForgotPassword, ResetPassword, CleanerOnboarding).
 * All authenticated pages use the header embedded in MainLayout.
 */
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/90 backdrop-blur-xl border-b border-border/50 flex items-center px-6">
      <div className="flex w-full items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-xl gradient-brand flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground">PureTask</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex h-11 px-4 touch-target font-medium">
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button size="sm" asChild className="h-11 px-5 touch-target rounded-full font-semibold">
            <Link to="/auth?mode=signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
