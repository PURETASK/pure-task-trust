import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { User, Briefcase, ArrowRight, Loader2, CheckCircle, Shield, Camera, Star, Zap } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { UserRole } from "@/contexts/AuthContext";
import clientHeroImg from "@/assets/client-hero.jpg";
import cleanerHeroImg from "@/assets/cleaner-hero.jpg";

const CLIENT_PERKS = [
  { icon: Shield, text: "Background-checked cleaners only" },
  { icon: Camera, text: "Photo proof on every clean" },
  { icon: Star, text: "Pay only when you're happy" },
  { icon: Zap, text: "Book in under 60 seconds" },
];

const CLEANER_PERKS = [
  { icon: Zap, text: "Get jobs matched to you automatically" },
  { icon: Star, text: "Earn $15–$85/hr based on your tier" },
  { icon: Shield, text: "Weekly or instant payouts" },
  { icon: Camera, text: "Build your reputation with reviews" },
];

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setRole, isSettingRole } = useUserProfile();

  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);
    try {
      await setRole(role);
      toast({
        title: role === "client" ? "Welcome to PureTask! 🏠" : "Welcome, cleaner! 🧹",
        description: role === "client" ? "Let's find you the perfect cleaner." : "Let's set up your professional profile.",
      });
      navigate(role === "cleaner" ? "/cleaner/onboarding" : "/dashboard");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to set role.", variant: "destructive" });
      setSelectedRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-success/5 -z-10" />
      
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-4">
            <CheckCircle className="h-4 w-4" />
            One last step
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">How will you use PureTask?</h1>
          <p className="text-xl text-muted-foreground">Choose your role — you can only pick one.</p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CLIENT */}
          <motion.div whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <button
              onClick={() => !isSettingRole && handleRoleSelect("client")}
              disabled={isSettingRole}
              className={`w-full text-left rounded-3xl border-2 overflow-hidden transition-all ${
                selectedRole === "client"
                  ? "border-primary shadow-elevated"
                  : "border-border/60 hover:border-primary/50 hover:shadow-card"
              }`}
            >
              {/* Hero image */}
              <div className="relative h-48 overflow-hidden">
                <img src={clientHeroImg} alt="Client" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-elevated">
                    {selectedRole === "client" && isSettingRole
                      ? <Loader2 className="h-6 w-6 text-primary-foreground animate-spin" />
                      : <User className="h-6 w-6 text-primary-foreground" />
                    }
                  </div>
                </div>
                <Badge className="absolute top-4 right-4 bg-primary/20 text-primary border-primary/30">For Clients</Badge>
              </div>

              {/* Content */}
              <div className="p-6 bg-card">
                <h2 className="text-2xl font-bold mb-1">I need cleaning</h2>
                <p className="text-muted-foreground mb-5">Book verified, background-checked cleaners for your home or property.</p>
                <div className="space-y-2.5 mb-5">
                  {CLIENT_PERKS.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                      <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <perk.icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      {perk.text}
                    </div>
                  ))}
                </div>
                <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${selectedRole === "client" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"} font-semibold transition-all`}>
                  {selectedRole === "client" && isSettingRole ? "Setting up…" : "Get Started as Client"}
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </button>
          </motion.div>

          {/* CLEANER */}
          <motion.div whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <button
              onClick={() => !isSettingRole && handleRoleSelect("cleaner")}
              disabled={isSettingRole}
              className={`w-full text-left rounded-3xl border-2 overflow-hidden transition-all ${
                selectedRole === "cleaner"
                  ? "border-success shadow-elevated"
                  : "border-border/60 hover:border-success/50 hover:shadow-card"
              }`}
            >
              <div className="relative h-48 overflow-hidden">
                <img src={cleanerHeroImg} alt="Cleaner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="h-12 w-12 rounded-2xl bg-success flex items-center justify-center shadow-elevated">
                    {selectedRole === "cleaner" && isSettingRole
                      ? <Loader2 className="h-6 w-6 text-success-foreground animate-spin" />
                      : <Briefcase className="h-6 w-6 text-success-foreground" />
                    }
                  </div>
                </div>
                <Badge className="absolute top-4 right-4 bg-success/20 text-success border-success/30">For Cleaners</Badge>
              </div>

              <div className="p-6 bg-card">
                <h2 className="text-2xl font-bold mb-1">I'm a cleaner</h2>
                <p className="text-muted-foreground mb-5">Join our marketplace and build a sustainable cleaning career on your own terms.</p>
                <div className="space-y-2.5 mb-5">
                  {CLEANER_PERKS.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                      <div className="h-6 w-6 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                        <perk.icon className="h-3.5 w-3.5 text-success" />
                      </div>
                      {perk.text}
                    </div>
                  ))}
                </div>
                <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${selectedRole === "cleaner" ? "bg-success text-success-foreground" : "bg-success/10 text-success"} font-semibold transition-all`}>
                  {selectedRole === "cleaner" && isSettingRole ? "Setting up…" : "Join as a Cleaner"}
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </button>
          </motion.div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Your role cannot be changed after selection.{" "}
          <Link to="/help" className="text-primary hover:underline">Need help?</Link>
        </p>
      </motion.div>
    </div>
  );
}
