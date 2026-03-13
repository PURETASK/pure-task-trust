import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Phone, Loader2, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface PhoneVerificationStepProps {
  onComplete: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function PhoneVerificationStep({ onComplete, onBack }: PhoneVerificationStepProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [subStep, setSubStep] = useState<'phone' | 'otp' | 'verified'>('phone');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const formatPhoneForDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const formatPhoneForE164 = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    return `+${digits}`;
  };

  const handleSendOTP = async () => {
    const e164Phone = formatPhoneForE164(phoneNumber);
    if (e164Phone.length < 12) {
      toast({ title: 'Invalid phone number', description: 'Please enter a valid 10-digit phone number.', variant: 'destructive' });
      return;
    }
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-otp', { body: { phone_number: e164Phone } });
      if (error) throw error;
      toast({ title: 'Code sent!', description: 'Check your phone for the 6-digit code.' });
      setSubStep('otp');
    } catch (error: any) {
      toast({ title: 'Failed to send code', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) return;
    setIsVerifying(true);
    const e164Phone = formatPhoneForE164(phoneNumber);
    try {
      const { error } = await supabase.functions.invoke('verify-otp', { body: { phone_number: e164Phone, otp_code: otpCode } });
      if (error) throw error;
      setSubStep('verified');
      setTimeout(() => onComplete(), 1200);
    } catch (error: any) {
      toast({ title: 'Verification failed', description: error.message || 'Invalid or expired code.', variant: 'destructive' });
    } finally {
      setIsVerifying(false);
    }
  };

  if (subStep === 'verified') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center"
        >
          <CheckCircle2 className="h-10 w-10 text-success" />
        </motion.div>
        <h3 className="text-xl font-bold">Phone Verified!</h3>
        <p className="text-muted-foreground text-sm">Moving to the next step…</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground">Verify your phone</h2>
        <p className="text-muted-foreground mt-1">
          {subStep === 'phone'
            ? 'Clients and support may need to reach you about jobs.'
            : `Enter the 6-digit code sent to ${phoneNumber}`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {subStep === 'phone' ? (
          <motion.div key="phone-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                A verified phone builds trust with clients and helps protect your account from fraud.
              </p>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneForDisplay(e.target.value))}
                  maxLength={14}
                  className="pl-9 h-12 rounded-xl text-base"
                />
              </div>
              <p className="text-xs text-muted-foreground pl-1">US phone numbers only</p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onBack} className="h-12 rounded-xl px-5">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                className="flex-1 h-12 text-base font-semibold rounded-xl"
                onClick={handleSendOTP}
                disabled={isSending || phoneNumber.replace(/\D/g, '').length < 10}
              >
                {isSending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</> : 'Send Code'}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="otp-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="flex flex-col items-center gap-4 py-4">
              <p className="text-sm text-muted-foreground">Enter the 6-digit code</p>
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => { setSubStep('phone'); setOtpCode(''); }} className="h-12 rounded-xl px-5">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                className="flex-1 h-12 text-base font-semibold rounded-xl"
                onClick={handleVerifyOTP}
                disabled={isVerifying || otpCode.length !== 6}
              >
                {isVerifying ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying…</> : 'Verify'}
              </Button>
            </div>
            <Button variant="link" className="w-full text-muted-foreground text-sm" onClick={handleSendOTP} disabled={isSending}>
              {isSending ? 'Resending…' : 'Resend code'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
