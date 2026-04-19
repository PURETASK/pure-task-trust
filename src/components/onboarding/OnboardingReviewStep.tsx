import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Loader2, ArrowLeft, User, Phone, Camera, IdCard, ShieldCheck, MapPin, Calendar, DollarSign, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingReviewStepProps {
  profileData: {
    firstName?: string | null; lastName?: string | null; bio?: string | null;
    profilePhotoUrl?: string | null; hourlyRate?: number | null; travelRadius?: number | null;
    phoneVerified?: boolean; serviceAreasCount?: number; availableDays?: number;
  };
  onComplete: () => Promise<void>;
  onBack: () => void;
  isCompleting: boolean;
}

const CHECKLIST = [
  { icon: User, label: 'Basic Info', key: 'info' },
  { icon: Phone, label: 'Phone Verified', key: 'phone' },
  { icon: Camera, label: 'Profile Photo', key: 'photo' },
  { icon: IdCard, label: 'ID Uploaded', key: 'id' },
  { icon: ShieldCheck, label: 'Background Check', key: 'bg' },
  { icon: MapPin, label: 'Service Areas', key: 'areas' },
  { icon: Calendar, label: 'Availability Set', key: 'avail' },
  { icon: DollarSign, label: 'Rates Configured', key: 'rates' },
];

export function OnboardingReviewStep({ profileData, onComplete, onBack, isCompleting }: OnboardingReviewStepProps) {
  const { firstName, lastName, bio, profilePhotoUrl, hourlyRate, travelRadius, phoneVerified, serviceAreasCount = 0, availableDays = 0 } = profileData;
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Your Name';
  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U';

  const completedMap: Record<string, boolean> = {
    info: !!firstName && !!lastName && !!bio, phone: !!phoneVerified, photo: !!profilePhotoUrl,
    id: true, bg: true, areas: serviceAreasCount > 0, avail: availableDays > 0, rates: !!hourlyRate,
  };
  const completedCount = Object.values(completedMap).filter(Boolean).length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div>
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Step 10 of 10</p>
        <h2 className="text-2xl font-bold text-white">You're almost live!</h2>
        <p className="text-white/60 text-sm mt-1">Review your profile before we activate you on the platform.</p>
      </div>

      {/* Profile preview */}
      <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(74,222,128,0.03))', border: '1px solid rgba(74,222,128,0.25)' }}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2" style={{ borderColor: 'rgba(74,222,128,0.4)' }}>
              <AvatarImage src={profilePhotoUrl || undefined} alt={fullName} />
              <AvatarFallback className="text-xl font-bold" style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-white">{fullName}</h3>
            <p className="text-sm text-white/50 line-clamp-1">{bio || 'No bio yet'}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {hourlyRate && <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-success" style={{ background: 'rgba(74,222,128,0.15)' }}>${hourlyRate}/hr</span>}
              {travelRadius && <span className="text-xs px-2 py-0.5 rounded-full text-white/60" style={{ background: 'rgba(255,255,255,0.08)' }}>{travelRadius}km</span>}
              {availableDays > 0 && <span className="text-xs px-2 py-0.5 rounded-full text-white/60" style={{ background: 'rgba(255,255,255,0.08)' }}>{availableDays}d/wk</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-xs font-semibold uppercase tracking-wide">Setup checklist</span>
          <span className="text-xs text-success font-medium">{completedCount}/{CHECKLIST.length} complete</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CHECKLIST.map(({ icon: Icon, label, key }, i) => (
            <motion.div key={key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: completedMap[key] ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${completedMap[key] ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
              {completedMap[key] ? <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" /> : <Icon className="h-4 w-4 text-white/30 flex-shrink-0" />}
              <span className={`text-xs font-medium ${completedMap[key] ? 'text-white/80' : 'text-white/35'}`}>{label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* What's next */}
      <div className="p-4 rounded-2xl space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-sm font-semibold text-white/80">What happens after you activate</p>
        {['Background check initiated (3–5 days)', 'Job offers start appearing in your area', 'Accept jobs, complete them, get paid weekly'].map((step, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-white/40">
            <span className="font-bold text-success mt-0.5">{i + 1}.</span>{step}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isCompleting} className="h-12 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 px-5"><ArrowLeft className="h-4 w-4" /></Button>
        <Button onClick={onComplete} disabled={isCompleting} className="flex-1 h-12 font-semibold rounded-xl bg-success hover:bg-success text-white border-0 text-base">
          {isCompleting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Activating…</> : <><Rocket className="h-4 w-4 mr-2" />Activate My Profile</>}
        </Button>
      </div>
    </motion.div>
  );
}
