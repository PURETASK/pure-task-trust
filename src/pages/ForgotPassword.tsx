
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast({ title: 'Email required', variant: 'destructive' }); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) throw error;
      setIsEmailSent(true);
    } catch (error: any) {
      toast({ title: 'Failed to send reset email', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet><title>Reset Your Password | PureTask</title></Helmet>
      <Header />
      <main className="flex-1 flex items-center justify-center py-20 pt-28 px-4">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />Back to sign in
            </Link>

            <AnimatePresence mode="wait">
              {!isEmailSent ? (
                <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-8">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
                      <Lock className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                    <p className="text-muted-foreground">Enter your email and we'll send you a reset link</p>
                  </div>

                  <div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 shadow-soft">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" placeholder="you@example.com" className="pl-10 h-12 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                      </div>
                      <Button type="submit" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-lg shadow-primary/25" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Sending...</> : 'Send Reset Link'}
                      </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                      Remember your password?{' '}
                      <Link to="/auth" className="text-primary font-semibold hover:underline">Sign in</Link>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <div className="bg-card border border-success/30 rounded-2xl p-6 sm:p-10 text-center shadow-soft">
                    <div className="h-24 w-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-12 w-12 text-success" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Check Your Email!</h2>
                    <p className="text-muted-foreground mb-2">We sent a reset link to</p>
                    <p className="font-bold text-lg text-primary mb-6">{email}</p>
                    <p className="text-sm text-muted-foreground mb-8">Didn't get it? Check your spam folder or try again.</p>
                    <div className="space-y-3">
                      <Button className="w-full" asChild><Link to="/auth">Back to Sign In</Link></Button>
                      <Button variant="ghost" className="w-full" onClick={() => { setIsEmailSent(false); setEmail(''); }}>Try a different email</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
