import { useCleanerOnboarding } from '@/hooks/useCleanerOnboarding';
import { TermsAgreementStep } from '@/components/onboarding/TermsAgreementStep';
import { BasicInfoStep } from '@/components/onboarding/BasicInfoStep';
import { PhoneVerificationStep } from '@/components/onboarding/PhoneVerificationStep';
import { FaceVerificationStep } from '@/components/onboarding/FaceVerificationStep';
import { IDVerificationStep } from '@/components/onboarding/IDVerificationStep';
import { BackgroundCheckConsentStep } from '@/components/onboarding/BackgroundCheckConsentStep';
import { ServiceAreaStep } from '@/components/onboarding/ServiceAreaStep';
import { AvailabilityStep } from '@/components/onboarding/AvailabilityStep';
import { RatesStep } from '@/components/onboarding/RatesStep';
import { OnboardingReviewStep } from '@/components/onboarding/OnboardingReviewStep';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import onboardingBg from '@/assets/onboarding-bg.jpg';

const STEPS = [
  { key: 'terms',               label: 'Terms',        num: '01' },
  { key: 'basic-info',          label: 'Profile',      num: '02' },
  { key: 'phone-verification',  label: 'Phone',        num: '03' },
  { key: 'face-verification',   label: 'Photo',        num: '04' },
  { key: 'id-verification',     label: 'ID',           num: '05' },
  { key: 'background-consent',  label: 'Background',   num: '06' },
  { key: 'service-areas',       label: 'Areas',        num: '07' },
  { key: 'availability',        label: 'Hours',        num: '08' },
  { key: 'rates',               label: 'Rates',        num: '09' },
  { key: 'review',              label: 'Review',       num: '10' },
];

export default function CleanerOnboarding() {
  const navigate = useNavigate();
  const {
    currentStep, currentStepIndex, totalSteps,
    isLoading, profile, completedData,
    goToPreviousStep,
    saveTerms, isSavingTerms,
    saveBasicInfo, isSavingBasicInfo,
    completePhoneVerification,
    saveFacePhoto, isSavingFacePhoto,
    saveIdDocument, isSavingIdDocument,
    saveBackgroundConsent, isSavingBackgroundConsent,
    saveServiceAreas, isSavingServiceAreas,
    saveAvailability, isSavingAvailability,
    saveRates, isSavingRates,
    completeOnboarding, isCompletingOnboarding,
  } = useCleanerOnboarding();

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding();
      navigate('/cleaner/dashboard');
    } catch (err: any) {
      console.error('Failed to complete onboarding:', err);
    }
  };

  // Wrap each step submit so errors don't unmount the page
  const handleSaveTerms = async () => {
    try { await saveTerms(); } catch (err: any) { console.error('Terms save error:', err); }
  };
  const handleSaveBasicInfo = async (data: Parameters<typeof saveBasicInfo>[0]) => {
    try { await saveBasicInfo(data); } catch (err: any) { console.error('Basic info save error:', err); }
  };
  const handleSaveFacePhoto = async (file: Parameters<typeof saveFacePhoto>[0]) => {
    try { await saveFacePhoto(file); } catch (err: any) { console.error('Face photo save error:', err); }
  };
  const handleSaveIdDocument = async (data: Parameters<typeof saveIdDocument>[0]) => {
    try { await saveIdDocument(data); } catch (err: any) { console.error('ID doc save error:', err); }
  };
  const handleSaveBackgroundConsent = async () => {
    try { await saveBackgroundConsent(); } catch (err: any) { console.error('Background consent save error:', err); }
  };
  const handleSaveServiceAreas = async (data: Parameters<typeof saveServiceAreas>[0]) => {
    try { await saveServiceAreas(data); } catch (err: any) { console.error('Service areas save error:', err); }
  };
  const handleSaveAvailability = async (data: Parameters<typeof saveAvailability>[0]) => {
    try { await saveAvailability(data); } catch (err: any) { console.error('Availability save error:', err); }
  };
  const handleSaveRates = async (data: Parameters<typeof saveRates>[0]) => {
    try { await saveRates(data); } catch (err: any) { console.error('Rates save error:', err); }
  };

  const userName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Pro';
  const currentMeta = STEPS[currentStepIndex] ?? STEPS[0];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(145 65% 8%)' }}>
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="h-10 w-10 rounded-full border-2 border-white/20 border-t-white"
          />
          <span className="text-white/60 text-sm">Loading your profile…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* ── FULL-BLEED BACKGROUND ── */}
      <div className="absolute inset-0 z-0">
        <img src={onboardingBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/60" />
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-success/10 blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] translate-y-1/3 -translate-x-1/3" />
      </div>

      {/* ── TOP BAR ── */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6 pb-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">PureTask</span>
        </div>

        {/* Step counter */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-1.5">
          <span className="text-white/60 text-xs font-medium">Step</span>
          <span className="text-white font-bold text-sm">{currentStepIndex + 1}</span>
          <span className="text-white/40 text-xs">/</span>
          <span className="text-white/60 text-xs">{totalSteps}</span>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-stretch px-6 md:px-12 py-8 gap-8 lg:gap-16">

        {/* LEFT: Giant step number + context */}
        <aside className="lg:w-[340px] xl:w-[400px] flex-shrink-0 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Giant number */}
              <div
                className="text-[120px] xl:text-[160px] font-black leading-none select-none"
                style={{
                  WebkitTextStroke: '1px rgba(255,255,255,0.15)',
                  color: 'transparent',
                  letterSpacing: '-4px',
                }}
              >
                {currentMeta.num}
              </div>

              {/* Step label pill */}
              <div className="inline-flex items-center gap-2 bg-success/20 border border-success/30 rounded-full px-4 py-1.5">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-success text-sm font-semibold uppercase tracking-wider">{currentMeta.label}</span>
              </div>

              {/* Step dots — vertical */}
              <div className="flex flex-row lg:flex-col gap-2 flex-wrap lg:flex-nowrap">
                {STEPS.map((step, i) => (
                  <div key={step.key} className="flex items-center gap-2">
                    <div
                      className={cn(
                        'rounded-full transition-all duration-300',
                        i < currentStepIndex
                          ? 'h-2 w-8 bg-success'
                          : i === currentStepIndex
                          ? 'h-2 w-8 bg-white'
                          : 'h-2 w-2 bg-white/20'
                      )}
                    />
                    {i === currentStepIndex && (
                      <span className="hidden lg:block text-xs text-white/70 font-medium">{step.label}</span>
                    )}
                    {i < currentStepIndex && (
                      <CheckCircle2 className="hidden lg:block h-3 w-3 text-success" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </aside>

        {/* RIGHT: Glass form card */}
        <div className="flex-1 flex items-center justify-center lg:justify-start">
          <div className="w-full max-w-lg">
            {/* Glass card */}
            <div
              className="rounded-3xl border border-white/15 shadow-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
              }}
            >
              {/* Progress bar inside card top */}
              <div className="h-1 bg-white/10">
                <motion.div
                  className="h-full bg-success rounded-r-full"
                  initial={false}
                  animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              <div className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    {currentStep === 'terms' && (
                      <TermsAgreementStep onSubmit={saveTerms} isSubmitting={isSavingTerms} />
                    )}
                    {currentStep === 'basic-info' && (
                      <BasicInfoStep
                        initialData={{ firstName: profile?.first_name, lastName: profile?.last_name, bio: profile?.bio }}
                        onSubmit={saveBasicInfo}
                        onBack={goToPreviousStep}
                        isSubmitting={isSavingBasicInfo}
                      />
                    )}
                    {currentStep === 'phone-verification' && (
                      <PhoneVerificationStep onComplete={completePhoneVerification} onBack={goToPreviousStep} />
                    )}
                    {currentStep === 'face-verification' && (
                      <FaceVerificationStep
                        onSubmit={saveFacePhoto}
                        onBack={goToPreviousStep}
                        isSubmitting={isSavingFacePhoto}
                        userName={userName}
                      />
                    )}
                    {currentStep === 'id-verification' && (
                      <IDVerificationStep onSubmit={saveIdDocument} onBack={goToPreviousStep} isSubmitting={isSavingIdDocument} />
                    )}
                    {currentStep === 'background-consent' && (
                      <BackgroundCheckConsentStep onSubmit={saveBackgroundConsent} onBack={goToPreviousStep} isSubmitting={isSavingBackgroundConsent} />
                    )}
                    {currentStep === 'service-areas' && (
                      <ServiceAreaStep
                        initialData={{ travelRadius: profile?.travel_radius_km }}
                        onSubmit={saveServiceAreas}
                        onBack={goToPreviousStep}
                        isSubmitting={isSavingServiceAreas}
                      />
                    )}
                    {currentStep === 'availability' && (
                      <AvailabilityStep onSubmit={saveAvailability} onBack={goToPreviousStep} isSubmitting={isSavingAvailability} />
                    )}
                    {currentStep === 'rates' && (
                      <RatesStep
                        initialData={{ hourlyRate: profile?.hourly_rate_credits, travelRadius: profile?.travel_radius_km }}
                        onSubmit={saveRates}
                        onBack={goToPreviousStep}
                        isSubmitting={isSavingRates}
                      />
                    )}
                    {currentStep === 'review' && (
                      <OnboardingReviewStep
                        profileData={{
                          firstName: profile?.first_name,
                          lastName: profile?.last_name,
                          bio: profile?.bio,
                          profilePhotoUrl: profile?.profile_photo_url,
                          hourlyRate: profile?.hourly_rate_credits,
                          travelRadius: profile?.travel_radius_km,
                          phoneVerified: true,
                          serviceAreasCount: completedData.serviceAreasCount,
                          availableDays: completedData.availableDays,
                        }}
                        onComplete={handleCompleteOnboarding}
                        onBack={goToPreviousStep}
                        isCompleting={isCompletingOnboarding}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Below-card hint */}
            <p className="text-center text-white/35 text-xs mt-4">
              Your progress is saved automatically — pick up where you left off any time.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
