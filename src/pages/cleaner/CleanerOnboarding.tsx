import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Progress } from '@/components/ui/progress';
import { useCleanerOnboarding } from '@/hooks/useCleanerOnboarding';
import { BasicInfoStep } from '@/components/onboarding/BasicInfoStep';
import { FaceVerificationStep } from '@/components/onboarding/FaceVerificationStep';
import { IDVerificationStep } from '@/components/onboarding/IDVerificationStep';
import { RatesStep } from '@/components/onboarding/RatesStep';
import { OnboardingComplete } from '@/components/onboarding/OnboardingComplete';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

export default function CleanerOnboarding() {
  const {
    currentStep,
    progress,
    isLoading,
    profile,
    saveBasicInfo,
    isSavingBasicInfo,
    saveFacePhoto,
    isSavingFacePhoto,
    saveIdDocument,
    isSavingIdDocument,
    saveRates,
    isSavingRates,
    completeOnboarding,
    isCompletingOnboarding,
    goToPreviousStep,
  } = useCleanerOnboarding();

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
          {/* Progress indicator */}
          {currentStep !== 'complete' && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Profile Setup</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Step content with animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 'basic-info' && (
                <BasicInfoStep
                  initialData={{
                    firstName: profile?.first_name,
                    lastName: profile?.last_name,
                    bio: profile?.bio,
                  }}
                  onSubmit={saveBasicInfo}
                  isSubmitting={isSavingBasicInfo}
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

              {currentStep === 'complete' && (
                <OnboardingComplete
                  onComplete={completeOnboarding}
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
