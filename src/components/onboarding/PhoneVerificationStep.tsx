import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Phone, Loader2, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface PhoneVerificationStepProps {
  onComplete: (phoneNumber?: string) => void;
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
    if (e164Phone.length < 12) { toast({ title: 'Invalid phone number', description: 'Please enter a valid 10-digit phone number.', variant: 'destructive' }); return; }
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-otp', { body: { phone_number: e164Phone } });
      if (error) throw error;
      toast({ title: 'Code sent!', description: 'Check your phone for the 6-digit code.' });
      setSubStep('otp');
    } catch (error: any) {
      toast({ title: 'Failed to send code', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally { setIsSending(false); }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) return;
    setIsVerifying(true);
    try {
      const { error } = await supabase.functions.invoke('verify-otp', { body: { phone_number: formatPhoneForE164(phoneNumber), otp_code: otpCode } });
      if (error) throw error;
      setSubStep('verified');
      setTimeout(() => onComplete(formatPhoneForE164(phoneNumber)), 1200);
    } catch (error: any) {
      toast({ title: 'Verification failed', description: error.message || 'Invalid or expired code.', variant: 'destructive' });
    } finally { setIsVerifying(false); }
  };

  if (subStep === 'verified') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-400/40">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </motion.div>
        <h3 className="text-xl font-bold text-white">Phone Verified!</h3>
        <p className="text-white/50 text-sm">Moving to the next step…</p>
      </motion.div>
    );
  }

  const inputClass = "h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-green-400 text-base";
  const btnBack = "h-12 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 px-5";
  const btnPrimary = "flex-1 h-12 font-semibold rounded-xl bg-green-500 hover:bg-green-400 text-white border-0";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div>
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Step 3 of 10</p>
        <h2 className="text-2xl font-bold text-white">Verify your phone</h2>
        <p className="text-white/60 text-sm mt-1">
          {subStep === 'phone' ? 'Clients and support need a way to reach you instantly.' : `Enter the 6-digit code sent to ${phoneNumber}`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {subStep === 'phone' ? (
          <motion.div key="phone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
              <ShieldCheck className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-white/60">A verified phone builds client trust and protects your account from fraud.</p>
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input type="tel" placeholder="(555) 123-4567" value={phoneNumber} onChange={(e) => setPhoneNumber(formatPhoneForDisplay(e.target.value))} maxLength={14} className={`${inputClass} pl-9`} />
            </div>
            <p className="text-xs text-white/35 pl-1">US phone numbers only</p>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onBack} className={btnBack}><ArrowLeft className="h-4 w-4" /></Button>
              <Button className={btnPrimary} onClick={handleSendOTP} disabled={isSending || phoneNumber.replace(/\D/g, '').length < 10}>
                {isSending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</> : 'Send Code'}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex flex-col items-center gap-4 py-3">
              <p className="text-sm text-white/60">Enter the 6-digit code</p>
              <div className="[&_input]:bg-white/10 [&_input]:border-white/20 [&_input]:text-white [&_input]:text-center [&_input]:text-lg [&_input]:font-bold [&_input:focus]:border-green-400">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                    <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => { setSubStep('phone'); setOtpCode(''); }} className={btnBack}><ArrowLeft className="h-4 w-4" /></Button>
              <Button className={btnPrimary} onClick={handleVerifyOTP} disabled={isVerifying || otpCode.length !== 6}>
                {isVerifying ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying…</> : 'Verify Code'}
              </Button>
            </div>
            <Button variant="link" className="w-full text-white/40 text-sm hover:text-white/70" onClick={handleSendOTP} disabled={isSending}>
              {isSending ? 'Resending…' : 'Resend code'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
