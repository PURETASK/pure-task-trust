import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
  CheckCircle2, Loader2, ArrowLeft, Rocket, Clock, Mail,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LaunchPhaseProps {
  profile: any;
  onComplete: () => Promise<void>;
  onBack: () => void;
  isCompleting: boolean;
}

export function LaunchPhase({ profile, onComplete, onBack, isCompleting }: LaunchPhaseProps) {
  const firstName = profile?.first_name;
  const lastName = profile?.last_name;
  const bio = profile?.bio;
  const photoUrl = profile?.profile_photo_url;
  const hourlyRate = profile?.hourly_rate_credits;
  const stripeOnboarded = !!profile?.stripe_connect_id;
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Your Name';
  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-poppins text-2xl font-semibold text-aero-trust">You're all set, {firstName || 'cleaner'}!</h2>
        <p className="text-sm text-aero-text-soft mt-1.5">
          Activate your profile now. Your background check runs in the background — no need to wait.
        </p>
      </div>

      {/* Profile preview */}
      <Card className="p-5 bg-gradient-to-br from-aero-card to-aero-card-border/40 border-aero-card-border">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-aero-cyan">
            <AvatarImage src={photoUrl || undefined} alt={fullName} />
            <AvatarFallback className="bg-aero-cyan/20 text-aero-trust font-bold text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-poppins font-semibold text-base text-aero-trust">{fullName}</h3>
            <p className="text-sm text-aero-text-soft line-clamp-1">{bio || 'No bio yet'}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {hourlyRate && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-aero-cyan/20 text-aero-trust">
                  ${hourlyRate}/hr
                </span>
              )}
              {stripeOnboarded && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-aero-trust/10 text-aero-trust flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Payouts ready
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* What happens next */}
      <Card className="p-5 space-y-3 border-aero-card-border">
        <p className="font-poppins font-semibold text-aero-trust">What happens after you activate</p>
        <ol className="space-y-3">
          {[
            { icon: Rocket, title: 'You go live immediately', desc: 'Your profile becomes editable from your dashboard.' },
            { icon: Clock, title: 'Background check runs (1–3 days)', desc: 'You can edit your profile and availability in the meantime.' },
            { icon: Mail, title: 'You get notified once verified', desc: 'Job offers start appearing the moment your check clears.' },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={i} className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-aero-cyan/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-aero-trust" />
                </div>
                <div>
                  <p className="text-sm font-medium text-aero-trust">{step.title}</p>
                  <p className="text-xs text-aero-text-soft">{step.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isCompleting} className="h-12 px-5">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button onClick={onComplete} disabled={isCompleting} className="flex-1 h-12 bg-gradient-aero text-white font-semibold text-base">
          {isCompleting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin motion-reduce:animate-none" /> Activating…</>
          ) : (
            <><Rocket className="h-4 w-4 mr-2" /> Activate my profile</>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
