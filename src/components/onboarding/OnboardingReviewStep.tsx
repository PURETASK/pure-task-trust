import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CheckCircle2, Loader2, ArrowLeft, User, Phone, Camera, IdCard,
  ShieldCheck, MapPin, Calendar, DollarSign, Rocket
} from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingReviewStepProps {
  profileData: {
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
    profilePhotoUrl?: string | null;
    hourlyRate?: number | null;
    travelRadius?: number | null;
    phoneVerified?: boolean;
    serviceAreasCount?: number;
    availableDays?: number;
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
    info: !!firstName && !!lastName && !!bio,
    phone: !!phoneVerified,
    photo: !!profilePhotoUrl,
    id: true,
    bg: true,
    areas: serviceAreasCount > 0,
    avail: availableDays > 0,
    rates: !!hourlyRate,
  };

  const completedCount = Object.values(completedMap).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground">You're almost live!</h2>
        <p className="text-muted-foreground mt-1">Review your profile before we activate you on the platform.</p>
      </div>

      {/* Profile card preview */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-primary/30">
              <AvatarImage src={profilePhotoUrl || undefined} alt={fullName} />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-success flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5 text-success-foreground" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg">{fullName}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{bio || 'No bio yet'}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {hourlyRate && (
                <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                  ${hourlyRate}/hr
                </span>
              )}
              {travelRadius && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {travelRadius}km radius
                </span>
              )}
              {availableDays > 0 && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {availableDays}d/wk
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Setup checklist</span>
          <span className="text-xs text-muted-foreground font-medium">{completedCount}/{CHECKLIST.length} complete</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CHECKLIST.map(({ icon: Icon, label, key }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-2 p-2.5 rounded-xl transition-colors ${completedMap[key] ? 'bg-success/5 border border-success/20' : 'bg-muted/40 border border-border'}`}
            >
              {completedMap[key]
                ? <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                : <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              }
              <span className={`text-xs font-medium ${completedMap[key] ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* What's next */}
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 space-y-2">
        <p className="text-sm font-semibold">What happens after you activate</p>
        <div className="space-y-1.5">
          {[
            'Background check initiated (3–5 days)',
            'Job offers start appearing in your area',
            'Accept jobs, complete them, get paid weekly',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="font-bold text-primary mt-0.5">{i + 1}.</span>
              {step}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isCompleting} className="h-12 rounded-xl px-5">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={onComplete}
          disabled={isCompleting}
          className="flex-1 h-12 text-base font-semibold rounded-xl"
        >
          {isCompleting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Activating…</>
          ) : (
            <><Rocket className="h-4 w-4 mr-2" /><span>Activate My Profile</span></>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
