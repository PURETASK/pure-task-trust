import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Phone, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PhoneVerificationProps {
  onVerified?: () => void;
  showSkip?: boolean;
  onSkip?: () => void;
}

export function PhoneVerification({ onVerified, showSkip, onSkip }: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'verified'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatPhoneForDisplay = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as US phone: (XXX) XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const formatPhoneForE164 = (value: string) => {
    const digits = value.replace(/\D/g, '');
    // Assume US number if no country code
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    return `+${digits}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneForDisplay(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSendOTP = async () => {
    const e164Phone = formatPhoneForE164(phoneNumber);
    
    if (e164Phone.length < 12) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid 10-digit phone number.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone_number: e164Phone },
      });

      if (error) throw error;

      toast({
        title: 'Code sent!',
        description: 'Check your phone for the verification code.',
      });
      setStep('otp');
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast({
        title: 'Failed to send code',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter the 6-digit code.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const e164Phone = formatPhoneForE164(phoneNumber);

    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone_number: e164Phone, otp_code: otpCode },
      });

      if (error) throw error;

      toast({
        title: 'Phone verified!',
        description: 'Your phone number has been verified successfully.',
      });
      setStep('verified');
      onVerified?.();
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      toast({
        title: 'Verification failed',
        description: error.message || 'Invalid or expired code.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'verified') {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Phone Verified</h3>
          <p className="text-muted-foreground text-sm">
            Your phone number has been verified successfully.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Verify Phone Number
        </CardTitle>
        <CardDescription>
          {step === 'phone'
            ? 'Add your phone number for account security and notifications.'
            : 'Enter the 6-digit code we sent to your phone.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'phone' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={handlePhoneChange}
                maxLength={14}
              />
              <p className="text-xs text-muted-foreground">US phone numbers only</p>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleSendOTP}
                disabled={isLoading || phoneNumber.replace(/\D/g, '').length < 10}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
              {showSkip && onSkip && (
                <Button variant="outline" onClick={onSkip}>
                  Skip
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={(value) => setOtpCode(value)}
                >
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
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('phone');
                  setOtpCode('');
                }}
              >
                Change Number
              </Button>
              <Button
                className="flex-1"
                onClick={handleVerifyOTP}
                disabled={isLoading || otpCode.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </Button>
            </div>
            <Button
              variant="link"
              className="w-full text-muted-foreground"
              onClick={handleSendOTP}
              disabled={isLoading}
            >
              Resend code
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
