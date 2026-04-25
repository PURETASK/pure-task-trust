import { useCleanerOnboarding } from '@/hooks/useCleanerOnboarding';
import { AgreementPhase } from '@/components/onboarding/phases/AgreementPhase';
import { ProfilePhase } from '@/components/onboarding/phases/ProfilePhase';
import { VerificationPhase } from '@/components/onboarding/phases/VerificationPhase';
import { WorkSetupPhase } from '@/components/onboarding/phases/WorkSetupPhase';
import { LaunchPhase } from '@/components/onboarding/phases/LaunchPhase';
import { PersonalInfoStep } from '@/components/onboarding/PersonalInfoStep';
import { SpecialtiesStep } from '@/components/onboarding/SpecialtiesStep';
import { EmergencyContactStep } from '@/components/onboarding/EmergencyContactStep';
import { PayoutSetupStep } from '@/components/onboarding/PayoutSetupStep';
import { FlowShell } from '@/components/flow/FlowShell';
import { Card } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const PHASE_LABELS: Record<string, string> = {
  agreement: 'Agreement',
  profile: 'Profile',
  personal: 'Personal',
  verification: 'Verify',
  'work-setup': 'Work',
  specialties: 'Specialties',
  emergency: 'Safety',
  payout: 'Payout',
  launch: 'Activate',
};

export default function CleanerOnboarding() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const onboarding = useCleanerOnboarding();
  const {
    currentPhase, currentPhaseIndex, totalPhases,
    isLoading, profile, advancePhase, goBack,
  } = onboarding;

  // Auto-redirect if already completed
  useEffect(() => {
    if (!isLoading && profile?.onboarding_completed_at) {
      navigate('/cleaner/dashboard', { replace: true });
    }
  }, [isLoading, profile?.onboarding_completed_at, navigate]);

  // Toast on Stripe return
  useEffect(() => {
    if (params.get('stripe_return') === 'true') {
      toast.success('Stripe Connect setup complete!');
    } else if (params.get('stripe_refresh') === 'true') {
      toast.info('Stripe needs more info — please continue setup.');
    }
  }, [params]);

  const handleComplete = async () => {
    try {
      await onboarding.completeOnboarding();
      toast.success("You're activated! Verification is in progress.");
      navigate('/cleaner/dashboard', { replace: true });
    } catch (err: any) {
      console.error('[CleanerOnboarding] completeOnboarding failed:', err);
      toast.error(err?.message || 'Failed to activate. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <FlowShell>
        <Card className="p-8 text-center">
          <div
            className="mx-auto h-10 w-10 rounded-full border-2 border-aero-card-border border-t-aero-trust animate-spin motion-reduce:animate-none"
            aria-label="Loading"
          />
          <p className="mt-4 text-sm text-aero-text-soft">Preparing your workspace…</p>
        </Card>
      </FlowShell>
    );
  }

  // Sticky progress summary (right column on desktop)
  const summary = (
    <Card className="p-5 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-aero-text-soft">Step {currentPhaseIndex + 1} of {totalPhases}</p>
        <p className="font-poppins text-lg font-semibold text-aero-trust mt-0.5">{PHASE_LABELS[currentPhase]}</p>
      </div>

      <div className="h-2 rounded-full bg-aero-card-border overflow-hidden">
        <div
          className="h-full bg-gradient-aero transition-all duration-500"
          style={{ width: `${((currentPhaseIndex + 1) / totalPhases) * 100}%` }}
        />
      </div>

      <ol className="space-y-1.5 text-sm">
        {Object.entries(PHASE_LABELS).map(([key, label], i) => {
          const done = i < currentPhaseIndex;
          const active = i === currentPhaseIndex;
          return (
            <li key={key} className={cn(
              'flex items-center gap-2 py-1',
              active ? 'text-aero-trust font-semibold' : done ? 'text-aero-text-soft' : 'text-aero-text-soft/60'
            )}>
              {done
                ? <CheckCircle2 className="h-4 w-4 text-aero-cyan flex-shrink-0" />
                : <span className={cn(
                    'h-4 w-4 rounded-full border-2 flex-shrink-0',
                    active ? 'border-aero-trust bg-aero-cyan/30' : 'border-aero-card-border'
                  )} />
              }
              <span>{label}</span>
            </li>
          );
        })}
      </ol>

      <div className="pt-3 border-t border-aero-card-border flex items-start gap-2">
        <ShieldCheck className="h-4 w-4 text-aero-trust flex-shrink-0 mt-0.5" />
        <p className="text-xs text-aero-text-soft leading-relaxed">
          Progress saved automatically. Pick up where you left off any time.
        </p>
      </div>
    </Card>
  );

  return (
    <FlowShell summary={summary}>
      <Card className="p-6 md:p-8 shadow-aero">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {currentPhase === 'agreement' && (
              <AgreementPhase
                onComplete={async () => {
                  try { await onboarding.saveAgreements(); advancePhase(); }
                  catch (err: any) { toast.error(err?.message || 'Failed to save agreements.'); }
                }}
                isSaving={onboarding.isSavingAgreements}
              />
            )}

            {currentPhase === 'profile' && (
              <ProfilePhase
                profile={profile}
                onSaveBasicInfo={async (data) => {
                  try { await onboarding.saveBasicInfo(data); }
                  catch (err: any) { toast.error(err?.message || 'Failed to save info.'); throw err; }
                }}
                isSavingBasicInfo={onboarding.isSavingBasicInfo}
                onSaveFacePhoto={async (file) => {
                  try { return await onboarding.saveFacePhoto(file) ?? ''; }
                  catch (err: any) { toast.error(err?.message || 'Failed to upload photo.'); return ''; }
                }}
                isSavingFacePhoto={onboarding.isSavingFacePhoto}
                onCompletePhone={(phone) => { onboarding.savePhone(phone); }}
                onComplete={advancePhase}
                onBack={goBack}
              />
            )}

            {currentPhase === 'personal' && (
              <PersonalInfoStep
                initial={{
                  date_of_birth: (profile as any)?.date_of_birth ?? '',
                  home_address: (profile as any)?.home_address ?? undefined,
                }}
                onSave={async (data) => {
                  try { await onboarding.savePersonalInfo(data); advancePhase(); }
                  catch (err: any) { toast.error(err?.message || 'Failed to save.'); }
                }}
                onBack={goBack}
                isSaving={onboarding.isSavingPersonalInfo}
              />
            )}

            {currentPhase === 'verification' && (
              <VerificationPhase
                onSaveIdDocument={async (data) => {
                  try { await onboarding.saveIdDocument(data); }
                  catch (err: any) { toast.error(err?.message || 'Failed to upload ID.'); throw err; }
                }}
                isSavingIdDocument={onboarding.isSavingIdDocument}
                onSaveBackgroundConsent={async () => {
                  try { await onboarding.saveBackgroundConsent(); }
                  catch (err: any) { toast.error(err?.message || 'Failed to save consent.'); throw err; }
                }}
                isSavingBackgroundConsent={onboarding.isSavingBackgroundConsent}
                onComplete={advancePhase}
                onBack={goBack}
              />
            )}

            {currentPhase === 'work-setup' && (
              <WorkSetupPhase
                profile={profile}
                onSaveServiceAreas={async (data) => {
                  try { await onboarding.saveServiceAreas(data); }
                  catch (err: any) { toast.error(err?.message || 'Failed to save areas.'); throw err; }
                }}
                isSavingServiceAreas={onboarding.isSavingServiceAreas}
                onSaveAvailability={async (data) => {
                  try { await onboarding.saveAvailability(data); }
                  catch (err: any) { toast.error(err?.message || 'Failed to save availability.'); throw err; }
                }}
                isSavingAvailability={onboarding.isSavingAvailability}
                onSaveRates={async (data) => {
                  try { await onboarding.saveRates(data); }
                  catch (err: any) { toast.error(err?.message || 'Failed to save rates.'); throw err; }
                }}
                isSavingRates={onboarding.isSavingRates}
                onComplete={advancePhase}
                onBack={goBack}
              />
            )}

            {currentPhase === 'specialties' && (
              <SpecialtiesStep
                initial={{
                  specialties: (profile as any)?.specialties ?? undefined,
                  languages: (profile as any)?.languages ?? undefined,
                  pet_friendly: (profile as any)?.pet_friendly ?? undefined,
                  brings_supplies: (profile as any)?.brings_supplies ?? undefined,
                }}
                onSave={async (data) => {
                  try { await onboarding.saveSpecialties(data); advancePhase(); }
                  catch (err: any) { toast.error(err?.message || 'Failed to save.'); }
                }}
                onBack={goBack}
                isSaving={onboarding.isSavingSpecialties}
              />
            )}

            {currentPhase === 'emergency' && (
              <EmergencyContactStep
                initial={{ emergency_contact: (profile as any)?.emergency_contact ?? undefined }}
                onSave={async (data) => {
                  try { await onboarding.saveEmergencyContact(data); advancePhase(); }
                  catch (err: any) { toast.error(err?.message || 'Failed to save.'); }
                }}
                onBack={goBack}
                isSaving={onboarding.isSavingEmergencyContact}
              />
            )}

            {currentPhase === 'payout' && (
              <PayoutSetupStep
                alreadyOnboarded={!!(profile as any)?.stripe_connect_id}
                onComplete={advancePhase}
                onBack={goBack}
              />
            )}

            {currentPhase === 'launch' && (
              <LaunchPhase
                profile={profile}
                onComplete={handleComplete}
                onBack={goBack}
                isCompleting={onboarding.isCompletingOnboarding}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </Card>
    </FlowShell>
  );
}
