import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import {
  Loader2, ArrowLeft, ArrowRight, Camera, CheckCircle2,
  RefreshCw, Phone, ShieldCheck, Lightbulb,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { BasicInfoData } from '@/hooks/useCleanerOnboarding';

type SubStep = 'info' | 'photo' | 'phone';

interface ProfilePhaseProps {
  profile: any;
  onSaveBasicInfo: (data: BasicInfoData) => Promise<void>;
  isSavingBasicInfo: boolean;
  onSaveFacePhoto: (file: File) => Promise<string>;
  isSavingFacePhoto: boolean;
  onCompletePhone: (phone: string) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function ProfilePhase({
  profile, onSaveBasicInfo, isSavingBasicInfo,
  onSaveFacePhoto, isSavingFacePhoto,
  onCompletePhone, onComplete, onBack,
}: ProfilePhaseProps) {
  const [sub, setSub] = useState<SubStep>('info');
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [bio, setBio] = useState(profile?.bio || '');

  // Photo state
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp' | 'done'>('input');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const inputCls = 'h-11 rounded-xl bg-white/8 border-white/15 text-white placeholder:text-white/25 focus:border-primary focus:ring-primary/20';
  const btnCls = 'h-12 rounded-xl border-0 font-semibold text-white';
  const gradientBtn = { background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' };
  const backBtn = 'h-12 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 px-5';

  const bioLen = bio.trim().length;
  const infoValid = firstName.trim() && lastName.trim() && bioLen >= 20;

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, '');
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
  };
  const toE164 = (v: string) => {
    const d = v.replace(/\D/g, '');
    return d.length === 10 ? `+1${d}` : d.length === 11 && d.startsWith('1') ? `+${d}` : `+${d}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSendOtp = async () => {
    const e164 = toE164(phoneNumber);
    if (e164.length < 12) { toast.error('Enter a valid 10-digit phone number.'); return; }
    setIsSendingOtp(true);
    try {
      const { error } = await supabase.functions.invoke('send-otp', { body: { phone_number: e164 } });
      if (error) throw error;
      toast.success('Code sent!');
      setPhoneStep('otp');
    } catch (err: any) { toast.error(err.message || 'Failed to send code'); }
    finally { setIsSendingOtp(false); }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;
    setIsVerifyingOtp(true);
    try {
      const { error } = await supabase.functions.invoke('verify-otp', { body: { phone_number: toE164(phoneNumber), otp_code: otpCode } });
      if (error) throw error;
      setPhoneStep('done');
      onCompletePhone(toE164(phoneNumber));
      setTimeout(() => onComplete(), 1200);
    } catch (err: any) { toast.error(err.message || 'Invalid code'); }
    finally { setIsVerifyingOtp(false); }
  };

  // ── Sub-step dots ──
  const SUBS: SubStep[] = ['info', 'photo', 'phone'];
  const subIdx = SUBS.indexOf(sub);

  return (
    <div className="space-y-5">
      {/* Sub-step indicator */}
      <div className="flex items-center gap-3 mb-1">
        {SUBS.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === subIdx ? 32 : i < subIdx ? 32 : 12,
                background: i < subIdx ? '#06b6d4' : i === subIdx ? '#a78bfa' : 'rgba(255,255,255,0.15)',
              }}
            />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── INFO ── */}
        {sub === 'info' && (
          <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Tell us about yourself</h2>
              <p className="text-white/50 text-sm mt-1">Clients pick cleaners who tell a great story.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs font-medium uppercase tracking-wide">First Name</Label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs font-medium uppercase tracking-wide">Last Name</Label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" className={inputCls} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-white/60 text-xs font-medium uppercase tracking-wide">Your Bio</Label>
                <span className={`text-xs font-medium ${bioLen >= 20 ? 'text-primary' : 'text-white/30'}`}>
                  {bioLen < 20 ? `${20 - bioLen} more chars` : `${bioLen} ✓`}
                </span>
              </div>
              <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell clients about your experience…" className="min-h-[90px] resize-none rounded-xl bg-white/8 border-white/15 text-white placeholder:text-white/25 focus:border-primary" />
              <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div className="h-full rounded-full" style={{ background: '#06b6d4' }} animate={{ width: `${Math.min((bioLen / 20) * 100, 100)}%` }} />
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
              <Lightbulb className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-xs text-white/50"><span className="text-white font-semibold">Pro tip: </span>Be specific — "5 years deep-cleaning Airbnb properties" converts 3× better.</p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onBack} className={backBtn}><ArrowLeft className="h-4 w-4" /></Button>
              <Button
                onClick={async () => { await onSaveBasicInfo({ firstName, lastName, bio }); setSub('photo'); }}
                disabled={!infoValid || isSavingBasicInfo}
                className={`flex-1 ${btnCls}`} style={gradientBtn}
              >
                {isSavingBasicInfo ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><span>Next: Photo</span><ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── PHOTO ── */}
        {sub === 'photo' && (
          <motion.div key="photo" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Add your profile photo</h2>
              <p className="text-white/50 text-sm mt-1">Cleaners with photos get <span className="text-accent font-semibold">3× more matches</span>.</p>
            </div>

            <div
              onClick={() => fileRef.current?.click()}
              className="relative flex flex-col items-center justify-center h-48 rounded-2xl cursor-pointer overflow-hidden transition-all"
              style={{ border: `2px dashed ${previewUrl ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.12)'}`, background: previewUrl ? 'rgba(167,139,250,0.06)' : 'rgba(255,255,255,0.03)' }}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-white" /></div>
                    <span className="text-white font-semibold text-sm">Photo selected</span>
                    <span className="text-white/50 text-xs flex items-center gap-1"><RefreshCw className="h-3 w-3" />Click to change</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', border: '2px dashed rgba(255,255,255,0.15)' }}>
                    <Camera className="h-6 w-6 text-white/30" />
                  </div>
                  <p className="text-sm text-white/60 font-medium">Click to upload</p>
                  <p className="text-xs text-white/30">JPG, PNG up to 5MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {['Clear face, good lighting', 'No sunglasses or filters', 'Face the camera directly', 'No group photos'].map(tip => (
                <div key={tip} className="flex items-center gap-2 text-xs text-white/40">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />{tip}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setSub('info')} className={backBtn}><ArrowLeft className="h-4 w-4" /></Button>
              <Button
                onClick={async () => { if (selectedFile) { await onSaveFacePhoto(selectedFile); setSub('phone'); } }}
                disabled={!selectedFile || isSavingFacePhoto}
                className={`flex-1 ${btnCls}`} style={gradientBtn}
              >
                {isSavingFacePhoto ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading…</> : <><span>Next: Phone</span><ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── PHONE ── */}
        {sub === 'phone' && (
          <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            {phoneStep === 'done' ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="h-20 w-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.15)', border: '2px solid rgba(6,182,212,0.4)' }}>
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold text-white">Phone Verified!</h3>
                <p className="text-white/40 text-sm">Moving on…</p>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-white">Verify your phone</h2>
                  <p className="text-white/50 text-sm mt-1">
                    {phoneStep === 'input' ? 'Clients need a way to reach you.' : `Enter the 6-digit code sent to ${phoneNumber}`}
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)' }}>
                  <ShieldCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-white/50">A verified phone builds trust and protects your account.</p>
                </div>

                {phoneStep === 'input' ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <Input type="tel" placeholder="(555) 123-4567" value={phoneNumber} onChange={e => setPhoneNumber(formatPhone(e.target.value))} maxLength={14} className={`${inputCls} pl-9`} />
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setSub('photo')} className={backBtn}><ArrowLeft className="h-4 w-4" /></Button>
                      <Button onClick={handleSendOtp} disabled={isSendingOtp || phoneNumber.replace(/\D/g, '').length < 10} className={`flex-1 ${btnCls}`} style={gradientBtn}>
                        {isSendingOtp ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</> : 'Send Code'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center gap-4 py-2">
                      <div className="[&_input]:bg-white/8 [&_input]:border-white/15 [&_input]:text-white [&_input]:text-center [&_input]:text-lg [&_input]:font-bold [&_input:focus]:border-primary">
                        <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                            <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => { setPhoneStep('input'); setOtpCode(''); }} className={backBtn}><ArrowLeft className="h-4 w-4" /></Button>
                      <Button onClick={handleVerifyOtp} disabled={isVerifyingOtp || otpCode.length !== 6} className={`flex-1 ${btnCls}`} style={gradientBtn}>
                        {isVerifyingOtp ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying…</> : 'Verify Code'}
                      </Button>
                    </div>
                    <Button variant="link" className="w-full text-white/30 text-sm hover:text-white/60" onClick={handleSendOtp} disabled={isSendingOtp}>
                      {isSendingOtp ? 'Resending…' : 'Resend code'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
