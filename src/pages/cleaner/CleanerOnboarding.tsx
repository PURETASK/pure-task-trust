import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Progress } from '@/components/ui/progress';
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
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEP_LABELS = [
  { key: 'terms', label: 'Terms' },
  { key: 'basic-info', label: 'Info' },
  { key: 'phone-verification', label: 'Phone' },
  { key: 'face-verification', label: 'Photo' },
  { key: 'id-verification', label: 'ID' },
  { key: 'background-consent', label: 'Check' },
  { key: 'service-areas', label: 'Areas' },
  { key: 'availability', label: 'Hours' },
  { key: 'rates', label: 'Rates' },
  { key: 'review', label: 'Review' },
];

export default function CleanerOnboarding() {
  const navigate = useNavigate();
  const {
    currentStep,
    currentStepIndex,
    totalSteps,
    progress,
    isLoading,
    profile,
    completedData,
    goToPreviousStep,
    saveTerms,
    isSavingTerms,
    saveBasicInfo,
    isSavingBasicInfo,
    completePhoneVerification,
    saveFacePhoto,
    isSavingFacePhoto,
    saveIdDocument,
    isSavingIdDocument,
    saveBackgroundConsent,
    isSavingBackgroundConsent,
    saveServiceAreas,
    isSavingServiceAreas,
    saveAvailability,
    isSavingAvailability,
    saveRates,
    isSavingRates,
    completeOnboarding,
    isCompletingOnboarding,
  } = useCleanerOnboarding();

  const handleCompleteOnboarding = async () => {
    await completeOnboarding();
    navigate('/cleaner/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 pt-32">
          <div className="container max-w-lg space-y-6">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const userName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'User';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-20 pt-32">
        <div className="container max-w-lg">
          {/* Step indicator */}
          <div className="mb-8">
            {/* Progress bar */}
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Profile Setup</span>
              <span>Step {currentStepIndex + 1} of {totalSteps}</span>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
            
            {/* Step dots - visible on larger screens */}
            <div className="hidden sm:flex justify-between items-center">
              {STEP_LABELS.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                      index < currentStepIndex
                        ? 'bg-primary text-primary-foreground'
                        : index === currentStepIndex
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {index < currentStepIndex ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 hidden lg:block">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step content with animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 'terms' && (
                <TermsAgreementStep
                  onSubmit={saveTerms}
                  isSubmitting={isSavingTerms}
                />
              )}

              {currentStep === 'basic-info' && (
                <BasicInfoStep
                  initialData={{
                    firstName: profile?.first_name,
                    lastName: profile?.last_name,
                    bio: profile?.bio,
                  }}
                  onSubmit={saveBasicInfo}
                  onBack={goToPreviousStep}
                  isSubmitting={isSavingBasicInfo}
                />
              )}

              {currentStep === 'phone-verification' && (
                <PhoneVerificationStep
                  onComplete={completePhoneVerification}
                  onBack={goToPreviousStep}
                />
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
                <IDVerificationStep
                  onSubmit={saveIdDocument}
                  onBack={goToPreviousStep}
                  isSubmitting={isSavingIdDocument}
                />
              )}

              {currentStep === 'background-consent' && (
                <BackgroundCheckConsentStep
                  onSubmit={saveBackgroundConsent}
                  onBack={goToPreviousStep}
                  isSubmitting={isSavingBackgroundConsent}
                />
              )}

              {currentStep === 'service-areas' && (
                <ServiceAreaStep
                  initialData={{
                    travelRadius: profile?.travel_radius_km,
                  }}
                  onSubmit={saveServiceAreas}
                  onBack={goToPreviousStep}
                  isSubmitting={isSavingServiceAreas}
                />
              )}

              {currentStep === 'availability' && (
                <AvailabilityStep
                  onSubmit={saveAvailability}
                  onBack={goToPreviousStep}
                  isSubmitting={isSavingAvailability}
                />
              )}

              {currentStep === 'rates' && (
                <RatesStep
                  initialData={{
                    hourlyRate: profile?.hourly_rate_credits,
                    travelRadius: profile?.travel_radius_km,
                  }}
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
                    phoneVerified: true, // They got here so it's verified
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
      </main>
      <Footer />
    </div>
  );
}
