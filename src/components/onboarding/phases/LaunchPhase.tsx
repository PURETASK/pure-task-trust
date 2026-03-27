import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CheckCircle2, Loader2, ArrowLeft, Rocket,
  User, Phone, Camera, IdCard, ShieldCheck, MapPin, Calendar, DollarSign,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LaunchPhaseProps {
  profile: any;
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

export function LaunchPhase({ profile, onComplete, onBack, isCompleting }: LaunchPhaseProps) {
  const firstName = profile?.first_name;
  const lastName = profile?.last_name;
  const bio = profile?.bio;
  const photoUrl = profile?.profile_photo_url;
  const hourlyRate = profile?.hourly_rate_credits;
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Your Name';
  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U';

  const checks: Record<string, boolean> = {
    info: !!firstName && !!lastName && !!bio,
    phone: true, photo: !!photoUrl, id: true, bg: true,
    areas: true, avail: true, rates: !!hourlyRate,
  };
  const done = Object.values(checks).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">You're ready for launch! 🚀</h2>
        <p className="text-white/50 text-sm mt-1">Review your profile before we go live.</p>
      </div>

      {/* Profile preview */}
      <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(251,191,36,0.03))', border: '1px solid rgba(251,191,36,0.2)' }}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-14 w-14 border-2" style={{ borderColor: 'rgba(251,191,36,0.4)' }}>
              <AvatarImage src={photoUrl || undefined} alt={fullName} />
              <AvatarFallback className="text-lg font-bold" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-white">{fullName}</h3>
            <p className="text-sm text-white/40 line-clamp-1">{bio || 'No bio yet'}</p>
            {hourlyRate && (
              <span className="inline-block mt-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold text-amber-400" style={{ background: 'rgba(251,191,36,0.12)' }}>
                ${hourlyRate}/hr
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white/50 text-xs font-semibold uppercase tracking-wide">Setup checklist</span>
          <span className="text-xs text-amber-400 font-medium">{done}/{CHECKLIST.length} complete</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CHECKLIST.map(({ icon: Icon, label, key }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{
                background: checks[key] ? 'rgba(251,191,36,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${checks[key] ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {checks[key] ? <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0" /> : <Icon className="h-4 w-4 text-white/25 flex-shrink-0" />}
              <span className={`text-xs font-medium ${checks[key] ? 'text-white/70' : 'text-white/30'}`}>{label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* What happens next */}
      <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-sm font-semibold text-white/70">What happens after launch</p>
        {['Background check initiated (3–5 days)', 'Job offers start appearing in your area', 'Accept jobs, complete them, get paid weekly'].map((step, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-white/35">
            <span className="font-bold text-amber-400 mt-0.5">{i + 1}.</span>{step}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isCompleting} className="h-12 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 px-5">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={onComplete}
          disabled={isCompleting}
          className="flex-1 h-12 font-semibold rounded-xl border-0 text-base text-white"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
        >
          {isCompleting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Activating…</>
          ) : (
            <><Rocket className="h-4 w-4 mr-2" />Launch My Profile</>
          )}
        </Button>
      </div>
    </div>
  );
}
