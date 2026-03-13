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
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Star, Shield, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import cleanerHeroImg from '@/assets/cleaner-hero.jpg';

const STEPS_META = [
  { key: 'terms', label: 'Terms', short: 'T' },
  { key: 'basic-info', label: 'Profile', short: 'P' },
  { key: 'phone-verification', label: 'Phone', short: 'Ph' },
  { key: 'face-verification', label: 'Photo', short: 'Fo' },
  { key: 'id-verification', label: 'ID', short: 'ID' },
  { key: 'background-consent', label: 'Check', short: 'C' },
  { key: 'service-areas', label: 'Areas', short: 'A' },
  { key: 'availability', label: 'Hours', short: 'H' },
  { key: 'rates', label: 'Rates', short: 'R' },
  { key: 'review', label: 'Review', short: 'Rv' },
];

const SIDE_CONTENT: Record<string, { headline: string; sub: string; stat?: { value: string; label: string } }> = {
  terms: { headline: 'Join 1,200+ active cleaners', sub: 'Read the terms once, enjoy the freedom forever.', stat: { value: '4.9★', label: 'avg cleaner rating' } },
  'basic-info': { headline: 'Your profile is your shopfront', sub: 'Cleaners with detailed bios earn 3× more bookings.', stat: { value: '3×', label: 'more bookings with bio' } },
  'phone-verification': { headline: 'Stay connected to your jobs', sub: 'Instant notifications the moment a new job drops near you.', stat: { value: '<2 min', label: 'avg offer response time' } },
  'face-verification': { headline: 'Clients book faces, not names', sub: 'A clear photo increases your match rate by 60%.', stat: { value: '+60%', label: 'match rate with photo' } },
  'id-verification': { headline: 'Build trust before you arrive', sub: 'Verified cleaners get premium job access and higher rates.', stat: { value: '100%', label: 'of top earners verified' } },
  'background-consent': { headline: 'The "Verified Pro" badge changes everything', sub: 'Clients specifically filter for background-checked cleaners.', stat: { value: '4×', label: 'more bookings verified' } },
  'service-areas': { headline: 'More coverage = more income', sub: 'Cleaners with 5+ zip codes earn 40% more per month.', stat: { value: '+40%', label: 'earnings with 5+ areas' } },
  'availability': { headline: 'More hours, more cash', sub: 'Flexible cleaners get first access to high-value same-day jobs.', stat: { value: '$85/hr', label: 'top earner rate' } },
  'rates': { headline: 'Set your price, own your career', sub: 'Bronze cleaners earn $20–35/hr. Platinum cleaners earn up to $100/hr.', stat: { value: '$100/hr', label: 'Platinum ceiling' } },
  'review': { headline: 'You\'re about to go live', sub: 'Check your details one final time — then launch your profile to the world.', stat: { value: '48 hrs', label: 'avg to first booking' } },
};

const TRUST_STATS = [
  { icon: TrendingUp, value: '$1,800', label: 'avg monthly earnings' },
  { icon: Clock, value: '48 hrs', label: 'to first booking' },
  { icon: Star, value: '4.9', label: 'avg review score' },
  { icon: Shield, value: '100%', label: 'background verified' },
];

export default function CleanerOnboarding() {
  const navigate = useNavigate();
  const {
    currentStep, currentStepIndex, totalSteps, progress,
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
    await completeOnboarding();
    navigate('/cleaner/dashboard');
  };

  const sideContent = SIDE_CONTENT[currentStep] || SIDE_CONTENT['terms'];
  const userName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Pro';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-4 p-8">
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* ── LEFT PANEL (desktop) ── */}
      <aside className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-shrink-0 flex-col relative overflow-hidden bg-foreground text-background">
        {/* Hero image */}
        <div className="absolute inset-0">
          <img src={cleanerHeroImg} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/70 to-foreground/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-auto">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-white">PureTask</span>
          </div>

          {/* Dynamic headline */}
          <div className="flex-1 flex flex-col justify-center gap-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-3"
              >
                <p className="text-sm font-semibold uppercase tracking-widest text-primary/80">
                  Step {currentStepIndex + 1} of {totalSteps}
                </p>
                <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
                  {sideContent.headline}
                </h2>
                <p className="text-white/70 text-base leading-relaxed">
                  {sideContent.sub}
                </p>
                {sideContent.stat && (
                  <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20 mt-2">
                    <span className="text-2xl font-bold text-primary">{sideContent.stat.value}</span>
                    <span className="text-sm text-white/70">{sideContent.stat.label}</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Trust stats */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {TRUST_STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-white/8 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <Icon className="h-4 w-4 text-primary mb-1" />
                  <div className="text-lg font-bold text-white">{value}</div>
                  <div className="text-xs text-white/60">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-1.5 mt-8">
            {STEPS_META.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full transition-all',
                  i < currentStepIndex
                    ? 'h-2 w-6 bg-primary'
                    : i === currentStepIndex
                    ? 'h-2 w-6 bg-white'
                    : 'h-2 w-2 bg-white/25'
                )}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL (form) ── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-5 pt-6 pb-4">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-base">PureTask</span>
          <span className="ml-auto text-xs font-medium text-muted-foreground">
            Step {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="px-5 lg:px-10 xl:px-14">
          <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Step labels row — desktop only */}
          <div className="hidden md:flex justify-between mt-3">
            {STEPS_META.map((step, index) => (
              <div key={step.key} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    index < currentStepIndex
                      ? 'bg-primary text-primary-foreground'
                      : index === currentStepIndex
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {index < currentStepIndex ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </div>
                <span className={cn('text-[10px] font-medium hidden xl:block',
                  index === currentStepIndex ? 'text-primary' : 'text-muted-foreground')}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div className="flex-1 flex flex-col justify-center px-5 lg:px-10 xl:px-14 py-8">
          <div className="w-full max-w-lg mx-auto lg:mx-0">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep}>
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
      </main>
    </div>
  );
}
