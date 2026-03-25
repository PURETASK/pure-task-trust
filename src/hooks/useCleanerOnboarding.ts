import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCleanerProfile } from '@/hooks/useCleanerProfile';
import { AvailabilityData } from '@/components/onboarding/AvailabilityStep';

export type OnboardingStep = 
  | 'terms'
  | 'basic-info' 
  | 'phone-verification'
  | 'face-verification' 
  | 'id-verification' 
  | 'background-consent'
  | 'service-areas'
  | 'availability'
  | 'rates' 
  | 'review';

const STEPS: OnboardingStep[] = [
  'terms',
  'basic-info',
  'phone-verification',
  'face-verification',
  'id-verification',
  'background-consent',
  'service-areas',
  'availability',
  'rates',
  'review',
];

export interface BasicInfoData {
  firstName: string;
  lastName: string;
  bio: string;
}

export interface RatesData {
  hourlyRate: number;
  travelRadius: number;
}

export interface ServiceAreaData {
  travelRadius: number;
  selectedAreas: string[];
}

// Shared query key — must match useCleanerProfile's key
const CLEANER_PROFILE_KEY = 'cleaner-profile';

export function useCleanerOnboarding() {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useCleanerProfile();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStepLocal] = useState<OnboardingStep>('terms');
  const [isInitialized, setIsInitialized] = useState(false);

  // Track completed data for review step
  const [completedData, setCompletedData] = useState({
    serviceAreasCount: 0,
    availableDays: 0,
  });

  // Load saved step from database on mount
  useEffect(() => {
    if (profile && !isInitialized) {
      const savedStep = profile.onboarding_current_step as OnboardingStep | null;
      if (savedStep && STEPS.includes(savedStep)) {
        setCurrentStepLocal(savedStep);
      }
      setIsInitialized(true);
    }
  }, [profile, isInitialized]);

  const currentStepIndex = STEPS.indexOf(currentStep);
  const totalSteps = STEPS.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  // Save step to database
  const saveStepToDatabase = async (step: OnboardingStep) => {
    if (!profile?.id) return;
    await supabase
      .from('cleaner_profiles')
      .update({ onboarding_current_step: step })
      .eq('id', profile.id);
  };

  const setCurrentStep = (step: OnboardingStep) => {
    setCurrentStepLocal(step);
    saveStepToDatabase(step);
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      const nextStep = STEPS[nextIndex];
      setCurrentStepLocal(nextStep);
      saveStepToDatabase(nextStep);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      const prevStep = STEPS[prevIndex];
      setCurrentStepLocal(prevStep);
      saveStepToDatabase(prevStep);
    }
  };

  // Invalidate all profile-related queries
  const invalidateProfile = () => {
    // Invalidate both with and without user ID suffix
    queryClient.invalidateQueries({ queryKey: [CLEANER_PROFILE_KEY] });
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
  };

  // Step 1: Terms & Agreements
  const saveTermsMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      // Ensure cleaner profile exists before saving agreements
      let cleanerProfileId = profile?.id;
      if (!cleanerProfileId) {
        // Try to fetch it fresh (may have been created by DB trigger)
        const { data: freshProfile } = await supabase
          .from('cleaner_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (freshProfile?.id) {
          cleanerProfileId = freshProfile.id;
          queryClient.invalidateQueries({ queryKey: ['cleaner-profile'] });
        } else {
          // Create profile if it still doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from('cleaner_profiles')
            .insert({ user_id: user.id })
            .select('id')
            .single();
          if (createError) throw createError;
          cleanerProfileId = newProfile.id;
          queryClient.invalidateQueries({ queryKey: ['cleaner-profile'] });
          queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        }
      }

      const agreements = [
        {
          cleaner_id: cleanerProfileId,
          agreement_type: 'terms_of_service',
          version: '1.0',
          user_agent: navigator.userAgent,
        },
        {
          cleaner_id: cleanerProfileId,
          agreement_type: 'independent_contractor',
          version: '1.0',
          user_agent: navigator.userAgent,
        },
      ];

      // Use upsert-style: skip if already exists (ignore duplicate key errors)
      const { error } = await supabase
        .from('cleaner_agreements')
        .insert(agreements);
      if (error && !error.message.includes('duplicate')) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-agreements'] });
      goToNextStep();
    },
  });

  // Step 2: Basic Info
  const saveBasicInfoMutation = useMutation({
    mutationFn: async (data: BasicInfoData) => {
      if (!profile?.id) throw new Error('No cleaner profile found');

      const { error } = await supabase
        .from('cleaner_profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          bio: data.bio,
        })
        .eq('id', profile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateProfile();
      goToNextStep();
    },
  });

  // Step 3: Phone Verification - handled in component, just advance
  const completePhoneVerification = () => {
    goToNextStep();
  };

  // Step 4: Face Photo
  const saveFacePhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id || !profile?.id) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/face-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('cleaner_profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      invalidateProfile();
      goToNextStep();
    },
  });

  // Step 5: ID Verification
  const saveIdDocumentMutation = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      if (!user?.id || !profile?.id) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('identity-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: verifyError } = await supabase
        .from('id_verifications')
        .insert({
          cleaner_id: profile.id,
          document_type: documentType,
          status: 'pending',
          document_url: fileName,
        });

      if (verifyError) throw verifyError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['id-verifications'] });
      goToNextStep();
    },
  });

  // Step 6: Background Check Consent
  const saveBackgroundConsentMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error('No cleaner profile found');

      // Save consent agreement — skip if duplicate
      const { error: agreementError } = await supabase.from('cleaner_agreements').insert({
        cleaner_id: profile.id,
        agreement_type: 'background_check_consent',
        version: '1.0',
        user_agent: navigator.userAgent,
      });
      if (agreementError && !agreementError.message.includes('duplicate')) throw agreementError;

      // Only create background check if one doesn't already exist
      const { data: existing } = await supabase
        .from('background_checks')
        .select('id')
        .eq('cleaner_id', profile.id)
        .maybeSingle();

      if (!existing) {
        const { error: checkError } = await supabase.from('background_checks').insert({
          cleaner_id: profile.id,
          status: 'pending',
          provider: 'checkr',
        });
        if (checkError) throw checkError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-agreements'] });
      queryClient.invalidateQueries({ queryKey: ['background-checks'] });
      goToNextStep();
    },
  });

  // Step 7: Service Areas
  const saveServiceAreasMutation = useMutation({
    mutationFn: async (data: ServiceAreaData) => {
      if (!profile?.id) throw new Error('No cleaner profile found');

      // Update travel radius on profile
      const { error: profileError } = await supabase
        .from('cleaner_profiles')
        .update({ travel_radius_km: data.travelRadius })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // Delete existing service areas
      await supabase
        .from('cleaner_service_areas')
        .delete()
        .eq('cleaner_id', profile.id);

      // Insert new service areas
      if (data.selectedAreas.length > 0) {
        const serviceAreas = data.selectedAreas.map((zipCode) => ({
          cleaner_id: profile.id,
          zip_code: zipCode,
        }));

        const { error: areasError } = await supabase
          .from('cleaner_service_areas')
          .insert(serviceAreas);

        if (areasError) throw areasError;
      }

      setCompletedData((prev) => ({ ...prev, serviceAreasCount: data.selectedAreas.length }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-service-areas'] });
      invalidateProfile();
      goToNextStep();
    },
  });

  // Map day name to number for database
  const dayToNumber: Record<string, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 0,
  };

  // Step 8: Availability
  const saveAvailabilityMutation = useMutation({
    mutationFn: async (data: AvailabilityData) => {
      if (!profile?.id) throw new Error('No cleaner profile found');

      // Delete existing availability blocks
      await supabase
        .from('availability_blocks')
        .delete()
        .eq('cleaner_id', profile.id);

      // Insert new blocks for enabled days
      const blocks = Object.entries(data.schedule)
        .filter(([_, schedule]) => schedule.enabled)
        .map(([day, schedule]) => ({
          cleaner_id: profile.id,
          day_of_week: dayToNumber[day] ?? 1,
          start_time: schedule.startTime,
          end_time: schedule.endTime,
          is_active: true,
        }));

      if (blocks.length > 0) {
        const { error } = await supabase.from('availability_blocks').insert(blocks);
        if (error) throw error;
      }

      setCompletedData((prev) => ({ ...prev, availableDays: blocks.length }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-blocks'] });
      goToNextStep();
    },
  });

  // Step 9: Rates
  const saveRatesMutation = useMutation({
    mutationFn: async (data: RatesData) => {
      if (!profile?.id) throw new Error('No cleaner profile found');

      const { error } = await supabase
        .from('cleaner_profiles')
        .update({
          hourly_rate_credits: data.hourlyRate,
          travel_radius_km: data.travelRadius,
        })
        .eq('id', profile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateProfile();
      goToNextStep();
    },
  });

  // Step 10: Complete Onboarding
  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error('No cleaner profile found');

      const { error } = await supabase
        .from('cleaner_profiles')
        .update({
          onboarding_completed_at: new Date().toISOString(),
          onboarding_current_step: 'review',
        })
        .eq('id', profile.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      // Invalidate and wait for refetch so needsOnboarding clears before navigation
      await queryClient.invalidateQueries({ queryKey: [CLEANER_PROFILE_KEY] });
      await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  return {
    currentStep,
    currentStepIndex,
    totalSteps,
    progress,
    // Only block on loading if we don't yet know whether profile exists.
    // Once the query has settled (even to null), show the onboarding form immediately.
    isLoading: profileLoading && !isInitialized && profile === undefined,
    profile,
    completedData,
    goToNextStep,
    goToPreviousStep,
    setCurrentStep,
    // Step mutations
    saveTerms: saveTermsMutation.mutateAsync,
    isSavingTerms: saveTermsMutation.isPending,
    saveBasicInfo: saveBasicInfoMutation.mutateAsync,
    isSavingBasicInfo: saveBasicInfoMutation.isPending,
    completePhoneVerification,
    saveFacePhoto: saveFacePhotoMutation.mutateAsync,
    isSavingFacePhoto: saveFacePhotoMutation.isPending,
    saveIdDocument: saveIdDocumentMutation.mutateAsync,
    isSavingIdDocument: saveIdDocumentMutation.isPending,
    saveBackgroundConsent: saveBackgroundConsentMutation.mutateAsync,
    isSavingBackgroundConsent: saveBackgroundConsentMutation.isPending,
    saveServiceAreas: saveServiceAreasMutation.mutateAsync,
    isSavingServiceAreas: saveServiceAreasMutation.isPending,
    saveAvailability: saveAvailabilityMutation.mutateAsync,
    isSavingAvailability: saveAvailabilityMutation.isPending,
    saveRates: saveRatesMutation.mutateAsync,
    isSavingRates: saveRatesMutation.isPending,
    completeOnboarding: completeOnboardingMutation.mutateAsync,
    isCompletingOnboarding: completeOnboardingMutation.isPending,
  };
}
