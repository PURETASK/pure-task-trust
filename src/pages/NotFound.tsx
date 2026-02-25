import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Home, ArrowLeft, Search, HelpCircle, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const suggestions = [
    { label: "Go to Dashboard", href: "/dashboard", icon: Home },
    { label: "Discover Cleaners", href: "/discover", icon: Search },
    { label: "Help & Support", href: "/help", icon: HelpCircle },
    { label: "How It Works", href: "/", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md w-full"
      >
        {/* Illustration */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mx-auto mb-8 w-40 h-40"
        >
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-primary/15 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-black gradient-brand-text">404</div>
            </div>
          </div>
          {/* Floating dots */}
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary/30"
          />
          <motion.div
            animate={{ y: [4, -4, 4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute bottom-4 left-0 h-3 w-3 rounded-full bg-accent/40"
          />
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 text-sm sm:text-base">
          The page <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{location.pathname}</span> doesn't exist or has been moved.
        </p>

        {/* Primary actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button asChild size="lg">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Quick nav suggestions */}
        <div className="border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            You might be looking for
          </p>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className="flex items-center gap-2 text-sm p-2.5 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
