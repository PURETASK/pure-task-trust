import { useCleanerOnboarding } from '@/hooks/useCleanerOnboarding';
import { AgreementPhase } from '@/components/onboarding/phases/AgreementPhase';
import { ProfilePhase } from '@/components/onboarding/phases/ProfilePhase';
import { VerificationPhase } from '@/components/onboarding/phases/VerificationPhase';
import { WorkSetupPhase } from '@/components/onboarding/phases/WorkSetupPhase';
import { LaunchPhase } from '@/components/onboarding/phases/LaunchPhase';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Shield, User, ScanFace, Briefcase, Rocket,
  CheckCircle2, Sparkles,
} from 'lucide-react';

const PHASE_META = [
  { key: 'agreement', label: 'Agreement', icon: Shield, color: '#38bdf8' },
  { key: 'profile', label: 'Profile', icon: User, color: '#a78bfa' },
  { key: 'verification', label: 'Verify', icon: ScanFace, color: '#f472b6' },
  { key: 'work-setup', label: 'Setup', icon: Briefcase, color: '#34d399' },
  { key: 'launch', label: 'Launch', icon: Rocket, color: '#fbbf24' },
] as const;

export default function CleanerOnboarding() {
  const navigate = useNavigate();
  const onboarding = useCleanerOnboarding();
  const { currentPhase, currentPhaseIndex, totalPhases, isLoading, profile, advancePhase, goBack } = onboarding;

  // Auto-redirect if onboarding already completed
  useEffect(() => {
    if (!isLoading && profile?.onboarding_completed_at) {
      navigate('/cleaner/dashboard', { replace: true });
    }
  }, [isLoading, profile?.onboarding_completed_at, navigate]);

  const handleComplete = async () => {
    try {
      await onboarding.completeOnboarding();
      navigate('/cleaner/dashboard', { replace: true });
    } catch (err: any) {
      console.error('[CleanerOnboarding] completeOnboarding failed:', err);
      toast.error(err?.message || 'Failed to activate. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080c18' }}>
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-cyan-400"
          />
          <span className="text-white/40 text-sm font-medium">Preparing your workspace…</span>
        </div>
      </div>
    );
  }

  const meta = PHASE_META[currentPhaseIndex] ?? PHASE_META[0];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: '#080c18' }}>
      {/* ── Animated background ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]" style={{ background: meta.color }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]" style={{ background: '#6366f1' }} />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]" style={{ background: '#ec4899' }} />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Top bar ── */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)' }}>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">PureTask</span>
          <span className="text-white/20 text-sm ml-1">Pro Setup</span>
        </div>
      </header>

      {/* ── Phase stepper ── */}
      <nav className="relative z-10 px-6 md:px-10 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-0">
          {PHASE_META.map((pm, i) => {
            const Icon = pm.icon;
            const isComplete = i < currentPhaseIndex;
            const isCurrent = i === currentPhaseIndex;
            const isUpcoming = i > currentPhaseIndex;

            return (
              <div key={pm.key} className="flex items-center flex-1 last:flex-none">
                {/* Node */}
                <motion.div
                  className={cn(
                    'relative flex items-center justify-center rounded-full transition-all duration-300',
                    isCurrent ? 'h-11 w-11' : 'h-9 w-9',
                  )}
                  style={{
                    background: isComplete
                      ? pm.color
                      : isCurrent
                        ? `${pm.color}22`
                        : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${isComplete ? pm.color : isCurrent ? pm.color : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: isCurrent ? `0 0 20px ${pm.color}40` : 'none',
                  }}
                  animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : (
                    <Icon className={cn('h-4 w-4', isCurrent ? 'text-white' : 'text-white/30')} />
                  )}
                </motion.div>

                {/* Connector line */}
                {i < PHASE_META.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: isComplete ? pm.color : 'transparent' }}
                      initial={false}
                      animate={{ width: isComplete ? '100%' : '0%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Phase label */}
        <div className="max-w-2xl mx-auto mt-3 flex items-center justify-between">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: meta.color }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: meta.color }}>{meta.label}</span>
          </motion.div>
          <span className="text-white/30 text-xs font-medium">
            Phase {currentPhaseIndex + 1} of {totalPhases}
          </span>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="relative z-10 flex-1 flex items-start justify-center px-4 md:px-10 pb-8 pt-2">
        <div className="w-full max-w-xl">
          {/* Glass card */}
          <motion.div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: `1px solid ${meta.color}20`,
              boxShadow: `0 0 60px ${meta.color}08, 0 20px 60px rgba(0,0,0,0.4)`,
            }}
            layout
          >
            {/* Top accent bar */}
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${meta.color}, transparent)` }} />

            <div className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhase}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
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
                        try { await onboarding.saveBasicInfo(data); } catch (err: any) { toast.error(err?.message || 'Failed to save info.'); throw err; }
                      }}
                      isSavingBasicInfo={onboarding.isSavingBasicInfo}
                      onSaveFacePhoto={async (file) => {
                        try { return await onboarding.saveFacePhoto(file) ?? ''; } catch (err: any) { toast.error(err?.message || 'Failed to upload photo.'); return ''; }
                      }}
                      isSavingFacePhoto={onboarding.isSavingFacePhoto}
                      onCompletePhone={(phone) => { onboarding.savePhone(phone); }}
                      onComplete={advancePhase}
                      onBack={goBack}
                    />
                  )}
                  {currentPhase === 'verification' && (
                    <VerificationPhase
                      onSaveIdDocument={async (data) => {
                        try { await onboarding.saveIdDocument(data); } catch (err: any) { toast.error(err?.message || 'Failed to upload ID.'); throw err; }
                      }}
                      isSavingIdDocument={onboarding.isSavingIdDocument}
                      onSaveBackgroundConsent={async () => {
                        try { await onboarding.saveBackgroundConsent(); } catch (err: any) { toast.error(err?.message || 'Failed to save consent.'); throw err; }
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
                        try { await onboarding.saveServiceAreas(data); } catch (err: any) { toast.error(err?.message || 'Failed to save areas.'); throw err; }
                      }}
                      isSavingServiceAreas={onboarding.isSavingServiceAreas}
                      onSaveAvailability={async (data) => {
                        try { await onboarding.saveAvailability(data); } catch (err: any) { toast.error(err?.message || 'Failed to save availability.'); throw err; }
                      }}
                      isSavingAvailability={onboarding.isSavingAvailability}
                      onSaveRates={async (data) => {
                        try { await onboarding.saveRates(data); } catch (err: any) { toast.error(err?.message || 'Failed to save rates.'); throw err; }
                      }}
                      isSavingRates={onboarding.isSavingRates}
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
            </div>
          </motion.div>

          <p className="text-center text-white/20 text-xs mt-4 font-medium">
            Progress saved automatically • Pick up anytime
          </p>
        </div>
      </main>
    </div>
  );
}
