import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Briefcase, Mail, Lock, ArrowRight, Loader2,
  Gift, Sparkles, CheckCircle, Eye, EyeOff, Shield, Star, Camera
} from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useReferrals } from "@/hooks/useReferrals";
import authSplitImg from "@/assets/auth-split.jpg";
import cleanerHeroImg from "@/assets/cleaner-hero.jpg";
import clientHeroImg from "@/assets/client-hero.jpg";

const TRUST_POINTS = [
  { icon: Shield, text: "Background-verified cleaners" },
  { icon: Camera, text: "Photo proof on every clean" },
  { icon: Star, text: "Pay only when you're happy" },
];

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");
  const urlRole = searchParams.get("role") as UserRole | null;

  const [role, setRole] = useState<UserRole | null>(urlRole);
  const [isSignUp, setIsSignUp] = useState(!!referralCode || !!urlRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, signup, loginWithGoogle, user, isAuthenticated, isLoading } = useAuth();
  const { applyReferral } = useReferrals();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate(user.role === "cleaner" ? "/cleaner/dashboard" : "/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  const passwordStrength = password.length === 0 ? null : password.length < 8 ? "weak" : password.length < 12 ? "ok" : "strong";

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        if (!role) {
          toast({ title: "Select a role first", variant: "destructive" });
          return;
        }
        const result = await signup(email, password, role, fullName);
        if (result.error) {
          toast({ title: "Sign up failed", description: result.error, variant: "destructive" });
        } else {
          if (referralCode) {
            const { data: { user: newUser } } = await supabase.auth.getUser();
            if (newUser) applyReferral({ code: referralCode, refereeId: newUser.id, role });
          }
          setSignupEmail(email);
          setSignupComplete(true);
        }
      } else {
        const result = await login(email, password);
        if (result.error) {
          toast({ title: "Sign in failed", description: result.error, variant: "destructive" });
        }
        // Navigation is handled by the useEffect watching isAuthenticated + user
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isSignUp && !role) {
      toast({ title: "Select a role first", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await loginWithGoogle(isSignUp ? role : undefined);
      if (result.error) toast({ title: "Google Sign-In Failed", description: result.error, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleLogin = async () => {
    if (isSignUp && !role) {
      toast({ title: "Select a role first", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      if (result.error) toast({ title: "Apple Sign-In Failed", description: String(result.error), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  // ── Email confirmation screen ──────────────────────────────────────────────
  if (signupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-success/5 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border border-border/50 rounded-3xl p-8 shadow-elevated text-center"
        >
          <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Check your inbox!</h1>
          <p className="text-muted-foreground mb-1">Confirmation sent to:</p>
          <p className="font-bold text-lg text-primary mb-6">{signupEmail}</p>

          <div className="bg-muted/50 rounded-2xl p-5 text-left mb-6 space-y-3">
            {[
              "Open the email from PureTask",
              'Click "Confirm your email"',
              role === "cleaner" ? "Complete your cleaner profile" : "Book your first cleaning!",
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                {s}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            Didn't get it?{" "}
            <button onClick={() => setSignupComplete(false)} className="text-primary hover:underline">Try again</button>
          </p>
          <Button variant="outline" className="w-full rounded-xl" onClick={() => { setIsSignUp(false); setSignupComplete(false); }}>
            Back to Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Role picker (sign-up step 1) ───────────────────────────────────────────
  if (isSignUp && !role) {
    return (
      <div className="min-h-screen flex">
        {/* Left: image panel */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
          <img src={authSplitImg} alt="PureTask verified cleaner in a spotless modern home" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/10 to-background/40" />
          <div className="absolute bottom-12 left-12 right-12">
            <div className="bg-background/80 backdrop-blur-md rounded-2xl p-6 border border-border/50">
              <p className="text-lg font-bold mb-3">Trusted by thousands</p>
              {TRUST_POINTS.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground mb-1.5">
                  <p.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  {p.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: role select */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background">
          <div className="w-full max-w-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Link to="/" className="flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-foreground">PureTask</span>
              </Link>

              {referralCode && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 flex items-center gap-3">
                  <Gift className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">You've been referred!</p>
                    <p className="text-xs text-muted-foreground">Complete signup to claim your $500 credit</p>
                  </div>
                </div>
              )}

              <h1 className="text-3xl font-bold mb-1">Join PureTask</h1>
              <p className="text-muted-foreground mb-8">How would you like to use PureTask?</p>

              <div className="space-y-4">
                {[
                  {
                    role: "client" as UserRole, icon: User, color: "text-primary",
                    bg: "bg-primary/10", border: "hover:border-primary/60 hover:bg-primary/3",
                    title: "I need cleaning", desc: "Book trusted, verified cleaners for your home",
                    image: clientHeroImg
                  },
                  {
                    role: "cleaner" as UserRole, icon: Briefcase, color: "text-success",
                    bg: "bg-success/10", border: "hover:border-success/60 hover:bg-success/3",
                    title: "I'm a cleaner", desc: "Set your own rates and grow your cleaning business",
                    image: cleanerHeroImg
                  },
                ].map((opt) => (
                  <motion.button
                    key={opt.role} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={() => setRole(opt.role)}
                    className={`w-full rounded-2xl border-2 border-border/60 ${opt.border} transition-all text-left overflow-hidden flex items-stretch`}
                  >
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <img src={opt.image} alt={opt.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 px-4 py-4 flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl ${opt.bg} flex items-center justify-center flex-shrink-0`}>
                        <opt.icon className={`h-5 w-5 ${opt.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold">{opt.title}</p>
                        <p className="text-sm text-muted-foreground">{opt.desc}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </motion.button>
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <button onClick={() => setIsSignUp(false)} className="text-primary font-semibold hover:underline">Sign in</button>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main auth form ─────────────────────────────────────────────────────────
  const panelBg = role === "cleaner" ? cleanerHeroImg : authSplitImg;
  const accentColor = role === "cleaner" ? "text-success" : "text-primary";
  const accentBg = role === "cleaner" ? "bg-success/10" : "bg-primary/10";

  return (
    <div className="min-h-screen flex">
      <Helmet><title>Sign In or Create Account | PureTask</title></Helmet>
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img src={panelBg} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-background/50" />
        <div className="absolute top-8 left-8">
          <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg">PureTask</span>
          </Link>
        </div>
        <div className="absolute bottom-12 left-12 right-12">
          <div className="bg-background/80 backdrop-blur-md rounded-2xl p-6 border border-border/50 shadow-elevated">
            <p className="font-bold mb-3">{role === "cleaner" ? "Why cleaners love PureTask" : "Why clients love PureTask"}</p>
            {(role === "cleaner"
              ? ["Set your own hourly rate", "Weekly or instant payouts", "Build your reputation & tier"]
              : ["Verified, background-checked cleaners", "GPS tracking & photo proof", "Pay only when you approve"]
            ).map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground mb-1.5">
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Mobile logo */}
            <div className="lg:hidden mb-6">
              <Link to="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-foreground">PureTask</span>
              </Link>
            </div>

            {isSignUp && role && (
              <button onClick={() => setRole(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
                ← Change role
              </button>
            )}

            {/* Role badge */}
            {isSignUp && role && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${accentBg} ${accentColor} text-sm font-semibold mb-4`}>
                {role === "cleaner" ? <Briefcase className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                {role === "cleaner" ? "Joining as a Cleaner" : "Joining as a Client"}
              </div>
            )}

            <h1 className="text-3xl font-bold mb-1">{isSignUp ? "Create your account" : "Welcome back"}</h1>
            <p className="text-muted-foreground mb-6">
              {isSignUp ? "Start your journey with PureTask today." : "Sign in to your PureTask account."}
            </p>

            {/* Tab switch */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
              {[{ id: "signin", label: "Sign In" }, { id: "signup", label: "Sign Up" }].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setIsSignUp(tab.id === "signup"); if (tab.id === "signup") setRole(null); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    (isSignUp ? "signup" : "signin") === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="name" type="text" placeholder="Jane Smith" className="pl-10 h-12 rounded-xl" value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" className="pl-10 h-12 rounded-xl" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 h-12 rounded-xl" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {isSignUp && passwordStrength && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex gap-1 flex-1">
                      {["weak", "ok", "strong"].map((level, i) => (
                        <div key={level} className={`h-1 flex-1 rounded-full transition-all ${
                          passwordStrength === "strong" ? "bg-success" :
                          passwordStrength === "ok" && i < 2 ? "bg-warning" :
                          passwordStrength === "weak" && i === 0 ? "bg-destructive" : "bg-muted"
                        }`} />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${passwordStrength === "strong" ? "text-success" : passwordStrength === "ok" ? "text-warning" : "text-destructive"}`}>
                      {passwordStrength === "strong" ? "Strong" : passwordStrength === "ok" ? "Good" : "Too short"}
                    </span>
                  </div>
                )}
              </div>

              {!isSignUp && (
                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
                </div>
              )}

              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isSignUp ? "Creating account…" : "Signing in…"}</> : isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="bg-background px-3 text-sm text-muted-foreground">or continue with</span></div>
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full h-12 rounded-xl gap-3 text-sm font-medium" onClick={handleGoogleLogin} disabled={isSubmitting}>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>
              <Button variant="outline" className="w-full h-12 rounded-xl gap-3 text-sm font-medium" onClick={handleAppleLogin} disabled={isSubmitting}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.37c1.33.07 2.25.73 3.02.78 1.14-.24 2.23-.93 3.46-.84 1.46.12 2.56.68 3.28 1.81-3.02 1.81-2.31 5.77.43 6.88-.51 1.37-1.17 2.71-2.19 4.28zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {isSignUp ? "Already have an account? " : "New to PureTask? "}
              <button onClick={() => { setIsSignUp(!isSignUp); setRole(null); }} className="text-primary font-semibold hover:underline">
                {isSignUp ? "Sign in" : "Create account"}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
