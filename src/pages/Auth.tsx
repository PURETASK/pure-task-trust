import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { User, Briefcase, Mail, Lock, ArrowRight, Loader2, Gift, Sparkles } from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useReferrals } from "@/hooks/useReferrals";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  const [role, setRole] = useState<UserRole | null>(null);
  const [isSignUp, setIsSignUp] = useState(!!referralCode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, signup, loginWithGoogle, user, isAuthenticated, isLoading } = useAuth();
  const { applyReferral } = useReferrals();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const redirectPath = user.role === 'cleaner' ? '/cleaner/dashboard' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      if (isSignUp) {
        // For signup, we need a role
        if (!role) {
          toast({
            title: "Error",
            description: "Please select a role first",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        const result = await signup(email, password, role, fullName);
        
        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        } else {
          // Apply referral code if present
          if (referralCode) {
            try {
              const { data: { user: newUser } } = await supabase.auth.getUser();
              if (newUser) {
                applyReferral({ code: referralCode, refereeId: newUser.id, role });
              }
            } catch (err) {
              console.error('Failed to apply referral code:', err);
            }
          }
          
          toast({
            title: "Account created!",
            description: role === "client" 
              ? "Redirecting to your dashboard..." 
              : "Redirecting to cleaner portal...",
          });
          
          // For new signups, redirect based on selected role
          setTimeout(() => {
            navigate(role === "cleaner" ? "/cleaner/dashboard" : "/dashboard");
          }, 500);
        }
      } else {
        // For login, authenticate first then check their stored role
        const result = await login(email, password);
        
        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "Redirecting to your dashboard...",
          });
          
          // Fetch the user's role from the database to redirect correctly
          const { data: { user: authUser } } = await supabase.auth.getUser();
          
          if (authUser) {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', authUser.id)
              .maybeSingle();
            
            const userRole = roleData?.role || 'client';
            
            setTimeout(() => {
              navigate(userRole === "cleaner" ? "/cleaner/dashboard" : "/dashboard");
            }, 500);
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    // For sign-in, we don't require role selection (user already has a role)
    // For sign-up, we need a role selected
    if (isSignUp && !role) {
      toast({
        title: "Select a role",
        description: "Please choose whether you need cleaning or are a cleaner first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Pass undefined for sign-in (existing users), role for sign-up (new users)
      const result = await loginWithGoogle(isSignUp ? role : undefined);
      
      if (result.error) {
        toast({
          title: "Google Sign-In Failed",
          description: result.error,
          variant: "destructive",
        });
      }
      // If successful, the page will redirect to Google
    } catch (error: any) {
      console.error('Google login handler error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate Google Sign-In. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // For sign-in, we don't need role selection first
  // For sign-up, we need to know the role
  if (isSignUp && !role) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-8 sm:py-20 pt-20 sm:pt-32 px-4">
          <div className="container max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Referral Banner */}
              {referralCode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <Card className="border-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Gift className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          You've been referred! <Sparkles className="h-4 w-4" />
                        </p>
                        <p className="text-sm text-white/80">Complete signup to claim your $500 credit</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Join PureTask</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Choose how you'd like to use PureTask</p>
              </div>

              <div className="grid gap-3 sm:gap-4">
                <Card 
                  className="cursor-pointer hover:border-primary/50 hover:shadow-elevated transition-all"
                  onClick={() => setRole("client")}
                >
                  <CardContent className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg">I need cleaning</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Book trusted cleaners for your home</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:border-primary/50 hover:shadow-elevated transition-all"
                  onClick={() => setRole("cleaner")}
                >
                  <CardContent className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-success/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg">I'm a cleaner</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Set your rates and find clients</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </div>

              <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
                Already have an account?{" "}
                <button 
                  onClick={() => setIsSignUp(false)} 
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </p>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-8 sm:py-20 pt-20 sm:pt-32 px-4">
        <div className="container max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isSignUp && role && (
              <button
                onClick={() => setRole(null)}
                className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2"
              >
                ← Back to role selection
              </button>
            )}

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </CardTitle>
                <CardDescription>
                  {isSignUp 
                    ? (role === "client" 
                        ? "Sign up to book cleanings and manage your home" 
                        : "Sign up to manage your cleaning jobs")
                    : "Sign in to your account"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(v) => {
                  setIsSignUp(v === "signup");
                  if (v === "signup") setRole(null); // Reset role when switching to signup
                }}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <form onSubmit={handleAuth}>
                    <div className="space-y-4">
                      {isSignUp && (
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="fullName" 
                              type="text" 
                              placeholder="John Doe"
                              className="pl-10"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="you@example.com"
                            className="pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="password" 
                              type="password" 
                              placeholder="••••••••"
                              className="pl-10"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              minLength={8}
                            />
                          </div>
                          {isSignUp && password.length > 0 && password.length < 8 && (
                            <p className="text-xs text-destructive">Password must be at least 8 characters</p>
                          )}
                          {isSignUp && password.length >= 8 && (
                            <p className="text-xs text-success">
                              {password.length >= 12 ? '✓ Strong password' : '✓ Password meets requirements'}
                            </p>
                          )}
                        </div>

                      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isSignUp ? "Creating Account..." : "Signing In..."}
                          </>
                        ) : (
                          isSignUp ? "Create Account" : "Sign In"
                        )}
                      </Button>
                      
                      {!isSignUp && (
                        <div className="text-center">
                          <Link 
                            to="/forgot-password" 
                            className="text-sm text-muted-foreground hover:text-primary"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                      )}
                    </div>
                  </form>
                </Tabs>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
