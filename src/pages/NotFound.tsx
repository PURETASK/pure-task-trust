import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Home, ArrowLeft, Search, HelpCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

const suggestions = [
  { label: "Go to Dashboard", href: "/dashboard", icon: Home, color: "text-primary" },
  { label: "Discover Cleaners", href: "/discover", icon: Search, color: "text-success" },
  { label: "Help & Support", href: "/help", icon: HelpCircle, color: "text-warning" },
];

export default function NotFound() {
  const location = useLocation();
  useEffect(() => { console.error("404:", location.pathname); }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* BG decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md w-full relative z-10"
      >
        {/* Number animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
          className="relative mx-auto mb-8 w-48 h-48"
        >
          <div className="absolute inset-0 rounded-full bg-primary/8 animate-pulse" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-poppins font-bold text-primary">404</div>
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                <Sparkles className="h-6 w-6 text-accent mx-auto mt-1" />
              </motion.div>
            </div>
          </div>
          {/* Floating elements */}
          {[
            { top: "5%", right: "5%", delay: 0, size: "h-4 w-4", color: "bg-primary/30" },
            { bottom: "10%", left: "0%", delay: 0.5, size: "h-3 w-3", color: "bg-accent/40" },
            { top: "45%", right: "-5%", delay: 0.8, size: "h-2.5 w-2.5", color: "bg-success/40" },
          ].map((dot, i) => (
            <motion.div
              key={i}
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: dot.delay }}
              className={`absolute ${dot.size} rounded-full ${dot.color}`}
              style={{ top: dot.top, right: dot.right, bottom: dot.bottom, left: dot.left }}
            />
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-gradient-aero mb-3">Page Not Found</h1>
          <p className="text-muted-foreground mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <code className="text-xs bg-muted px-2.5 py-1.5 rounded-lg text-muted-foreground font-mono block w-fit mx-auto mb-8">
            {location.pathname}
          </code>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20">
            <Link to="/"><Home className="h-4 w-4" /> Go Home</Link>
          </Button>
          <Button variant="outline" size="lg" className="gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="border border-border rounded-2xl p-4 bg-card/50 backdrop-blur-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Navigation</p>
            <div className="grid grid-cols-3 gap-2">
              {suggestions.map(({ label, href, icon: Icon, color }, i) => (
                <motion.div key={href} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }}>
                  <Link to={href} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors text-center">
                    <Icon className={`h-5 w-5 ${color}`} />
                    <span className="text-xs text-muted-foreground font-medium leading-tight">{label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
