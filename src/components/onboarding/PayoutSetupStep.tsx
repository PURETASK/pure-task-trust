import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2, Banknote, ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  alreadyOnboarded: boolean;
  onComplete: () => void;
  onBack: () => void;
}

export function PayoutSetupStep({ alreadyOnboarded, onComplete, onBack }: Props) {
  const [loading, setLoading] = useState(false);

  const launchStripe = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding');
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Could not get Stripe onboarding link');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Could not start Stripe onboarding');
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="font-poppins text-2xl font-semibold text-aero-trust">Set up payouts</h2>
        <p className="text-sm text-aero-text-soft mt-1.5">
          We use Stripe to send your weekly earnings directly to your bank account. Required to activate your profile.
        </p>
      </div>

      <Card className="p-5 bg-gradient-to-br from-aero-card to-aero-card-border/40 border-aero-card-border space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-aero flex items-center justify-center">
            <Banknote className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-poppins font-semibold text-aero-trust text-base">Stripe Connect</p>
            <p className="text-xs text-aero-text-soft">Trusted by millions of businesses worldwide</p>
          </div>
        </div>

        <ul className="space-y-2.5 text-sm text-aero-trust">
          {[
            'Direct deposit every Friday',
            'Bank-level encryption (256-bit SSL)',
            'Tax docs (1099) generated automatically',
            'Track every payout in your earnings dashboard',
          ].map(line => (
            <li key={line} className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-aero-cyan flex-shrink-0 mt-0.5" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-3 bg-aero-card-border/30 border-aero-card-border flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-aero-trust flex-shrink-0 mt-0.5" />
        <p className="text-xs text-aero-text-soft leading-relaxed">
          You'll be redirected to Stripe to verify your identity and add your bank details. Takes about 3–5 minutes. PureTask never sees your bank info.
        </p>
      </Card>

      {alreadyOnboarded ? (
        <Card className="p-4 bg-aero-cyan/10 border-aero-cyan flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-aero-trust" />
          <div className="flex-1">
            <p className="font-medium text-aero-trust">Payout setup complete</p>
            <p className="text-xs text-aero-text-soft">Your bank account is connected and verified.</p>
          </div>
        </Card>
      ) : null}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading} className="h-12 px-5">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {alreadyOnboarded ? (
          <Button onClick={onComplete} className="flex-1 h-12 bg-gradient-aero text-white font-semibold">
            Continue <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={launchStripe} disabled={loading} className="flex-1 h-12 bg-gradient-aero text-white font-semibold">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin motion-reduce:animate-none" /> : <ExternalLink className="h-4 w-4 mr-2" />}
            Set up with Stripe
          </Button>
        )}
      </div>
    </motion.div>
  );
}
