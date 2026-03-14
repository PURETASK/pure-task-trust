import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle2, ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setIsValidSession(true);
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsValidSession(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'Minimum 8 characters required.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Both passwords must be identical.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setIsReset(true);
      toast({ title: 'Password updated!', description: 'Your password has been reset successfully.' });
      setTimeout(() => navigate('/auth'), 2000);
    } catch (error: any) {
      toast({ title: 'Failed to reset password', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const strength = password.length >= 12 ? 3 : password.length >= 8 ? 2 : password.length >= 4 ? 1 : 0;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-destructive', 'bg-warning', 'bg-success'][strength];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet><title>Create New Password | PureTask</title></Helmet>
      <Header />
      <main className="flex-1 flex items-center justify-center py-20 pt-32 px-4">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Logo area */}
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Reset Password</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {isReset ? 'Your password has been updated' : 'Create a new secure password'}
              </p>
            </div>

            <Card className="shadow-card border-border/60">
              <CardContent className="p-7">
                {isReset ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                    <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-7 w-7 text-success" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Password Updated!</h3>
                    <p className="text-sm text-muted-foreground mb-1">Redirecting you to sign in...</p>
                  </motion.div>
                ) : !isValidSession ? (
                  <div className="text-center py-4">
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                      <Lock className="h-6 w-6 text-destructive" />
                    </div>
                    <h3 className="font-semibold mb-2">Link Expired</h3>
                    <p className="text-sm text-muted-foreground mb-5">This reset link may have expired or is invalid.</p>
                    <Button onClick={() => navigate('/forgot-password')} className="rounded-xl w-full">
                      Request New Link <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="password" type={showPass ? "text" : "password"} placeholder="Min. 8 characters"
                          className="pl-10 pr-10 rounded-xl h-11" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {password && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-1 flex-1">
                            {[1,2,3].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-muted'}`} />)}
                          </div>
                          <span className={`text-xs font-medium ${strength === 3 ? 'text-success' : strength === 2 ? 'text-warning' : 'text-destructive'}`}>{strengthLabel}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Repeat your password"
                          className="pl-10 pr-10 rounded-xl h-11" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-destructive mt-1">Passwords don't match</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full rounded-xl h-11 font-semibold" size="lg" disabled={isLoading || !password || password !== confirmPassword}>
                      {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>) : (<><ShieldCheck className="mr-2 h-4 w-4" />Set New Password</>)}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
