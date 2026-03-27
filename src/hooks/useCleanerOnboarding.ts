import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCleanerProfile } from '@/hooks/useCleanerProfile';
import { AvailabilityData } from '@/components/onboarding/AvailabilityStep';
import type { Database } from '@/integrations/supabase/types';

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

const REQUIRED_TERMS_AGREEMENTS = ['terms_of_service', 'independent_contractor'] as const;

const isValidOnboardingStep = (step: string | null | undefined): step is OnboardingStep => {
  return !!step && STEPS.includes(step as OnboardingStep);
};

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

type CleanerProfile = Database['public']['Tables']['cleaner_profiles']['Row'];

// Shared query key — must match useCleanerProfile's key
const CLEANER_PROFILE_KEY = 'cleaner-profile';
const PROFILE_LOADING_FALLBACK_MS = 4000;
const DIRECT_PROFILE_FETCH_TIMEOUT_MS = 2500;

async function fetchCleanerProfileWithTimeout(userId: string): Promise<CleanerProfile | null> {
  const request = (async () => {
    try {
      const { data, error } = await supabase
        .from('cleaner_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      return { type: 'data' as const, data: data as CleanerProfile | null };
    } catch (error) {
      return { type: 'error' as const, error };
    }
  })();

  const timeout = new Promise<{ type: 'timeout' }>((resolve) => {
    setTimeout(() => resolve({ type: 'timeout' }), DIRECT_PROFILE_FETCH_TIMEOUT_MS);
  });

  const result = await Promise.race([request, timeout]);

  if (result.type === 'timeout') {
    console.warn('[useCleanerOnboarding] Fallback cleaner profile fetch timed out');
    return null;
  }

  if (result.type === 'error') {
    throw result.error;
  }

  return result.data;
}

export function useCleanerOnboarding() {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useCleanerProfile();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStepLocal] = useState<OnboardingStep>('terms');
  const [isInitialized, setIsInitialized] = useState(false);
  const [fallbackProfile, setFallbackProfile] = useState<CleanerProfile | null>(null);
  const [bypassProfileLoading, setBypassProfileLoading] = useState(false);

  // Track completed data for review step
  const [completedData, setCompletedData] = useState({
    serviceAreasCount: 0,
    availableDays: 0,
  });

  // Keep a ref to the latest profile id so mutations always have the freshest value
  // even if the React state hasn't re-rendered yet.
  const profileIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (profile?.id) profileIdRef.current = profile.id;
  }, [profile?.id]);

  const effectiveProfile = profile ?? fallbackProfile;

  useEffect(() => {
    if (!user?.id || profile?.id || !profileLoading) {
      setBypassProfileLoading(false);
      if (profile?.id) {
        setFallbackProfile(null);
      }
      return;
    }

    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        const directProfile = await fetchCleanerProfileWithTimeout(user.id);
        if (isCancelled) return;

        if (directProfile?.id) {
          profileIdRef.current = directProfile.id;
          setFallbackProfile(directProfile);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('[useCleanerOnboarding] Failed fallback profile fetch:', error);
        }
      } finally {
        if (!isCancelled) {
          setBypassProfileLoading(true);
        }
      }
    }, PROFILE_LOADING_FALLBACK_MS);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [user?.id, profile?.id, profileLoading]);

  // Helper: get the current cleaner profile id — from ref (latest) or a fresh DB fetch
  const getCleanerProfileId = async (): Promise<string> => {
    if (profileIdRef.current) return profileIdRef.current;
    if (!user?.id) throw new Error('Not authenticated');

    // Try a fresh fetch
    const { data, error } = await supabase
      .from('cleaner_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (data?.id) {
      profileIdRef.current = data.id;
      return data.id;
    }
    throw new Error('No cleaner profile found. Please restart onboarding.');
  };

  // Load saved step from database on mount.
  useEffect(() => {
    if (isInitialized || (profileLoading && !bypassProfileLoading)) return;

    let isCancelled = false;

    const initializeStep = async () => {
      if (!effectiveProfile?.id) {
        if (!isCancelled) setIsInitialized(true);
        return;
      }

      const savedStep = isValidOnboardingStep(effectiveProfile.onboarding_current_step)
        ? effectiveProfile.onboarding_current_step
        : null;

      if (savedStep && savedStep !== 'terms') {
        if (!isCancelled) {
          setCurrentStepLocal(savedStep);
          setIsInitialized(true);
        }
        return;
      }

      const { data: agreements, error } = await supabase
        .from('cleaner_agreements')
        .select('agreement_type')
        .eq('cleaner_id', effectiveProfile.id)
        .in('agreement_type', [...REQUIRED_TERMS_AGREEMENTS]);

      const acceptedTypes = new Set((agreements ?? []).map(({ agreement_type }) => agreement_type));
      const hasAcceptedRequiredTerms = REQUIRED_TERMS_AGREEMENTS.every((type) => acceptedTypes.has(type));

      const resolvedStep = effectiveProfile.onboarding_completed_at
        ? 'review'
        : hasAcceptedRequiredTerms
          ? 'basic-info'
          : (savedStep ?? 'terms');

      if (error) {
        console.error('Failed to resolve onboarding step from agreements:', error);
      }

      if (!isCancelled) {
        setCurrentStepLocal(resolvedStep);
        setIsInitialized(true);
      }
    };

    void initializeStep();

    return () => {
      isCancelled = true;
    };
  }, [
    isInitialized,
    effectiveProfile?.id,
    effectiveProfile?.onboarding_completed_at,
    effectiveProfile?.onboarding_current_step,
    bypassProfileLoading,
    profileLoading,
  ]);

  const currentStepIndex = STEPS.indexOf(currentStep);
  const totalSteps = STEPS.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  // Save step to database
  const saveStepToDatabase = async (step: OnboardingStep) => {
    const cleanerProfileId = await getCleanerProfileId();
    const { error } = await supabase
      .from('cleaner_profiles')
      .update({ onboarding_current_step: step })
      .eq('id', cleanerProfileId);

    if (error) throw error;
  };

  const setCurrentStep = (step: OnboardingStep) => {
    setCurrentStepLocal(step);
    void saveStepToDatabase(step).catch((error) => {
      console.error('Failed to persist onboarding step:', error);
    });
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      const nextStep = STEPS[nextIndex];
      setCurrentStepLocal(nextStep);
      void saveStepToDatabase(nextStep).catch((error) => {
        console.error('Failed to persist next onboarding step:', error);
      });
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      const prevStep = STEPS[prevIndex];
      setCurrentStepLocal(prevStep);
      void saveStepToDatabase(prevStep).catch((error) => {
        console.error('Failed to persist previous onboarding step:', error);
      });
    }
  };

  // Invalidate all profile-related queries
  const invalidateProfile = () => {
    queryClient.invalidateQueries({ queryKey: [CLEANER_PROFILE_KEY] });
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
  };

  // ─── STEP 1: Terms & Agreements ───────────────────────────────────────────
  const saveTermsMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      // Ensure cleaner profile exists
      let cleanerProfileId = profileIdRef.current;
      if (!cleanerProfileId) {
        const { data: freshProfile, error: freshProfileError } = await supabase
          .from('cleaner_profiles')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (freshProfileError) throw freshProfileError;

        if (freshProfile?.id) {
          cleanerProfileId = freshProfile.id;
          profileIdRef.current = cleanerProfileId;
        } else {
          const { data: newProfile, error: createError } = await supabase
            .from('cleaner_profiles')
            .insert({ user_id: user.id })
            .select('id')
            .single();
          if (createError) throw createError;
          cleanerProfileId = newProfile.id;
          profileIdRef.current = cleanerProfileId;
        }
        // Refresh cache with the exact key so isLoading stays false
        queryClient.invalidateQueries({ queryKey: [CLEANER_PROFILE_KEY, user.id] });
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      }

      // Upsert agreements — use ON CONFLICT DO NOTHING to be idempotent
      // (no unique constraint exists, so we check first then insert)
      const agreementTypes = ['terms_of_service', 'independent_contractor'];
      for (const agreementType of agreementTypes) {
        const { data: existing, error: existingError } = await supabase
          .from('cleaner_agreements')
          .select('id')
          .eq('cleaner_id', cleanerProfileId)
          .eq('agreement_type', agreementType)
          .limit(1)
          .maybeSingle();

        if (existingError) throw existingError;

        if (!existing) {
          const { error } = await supabase.from('cleaner_agreements').insert({
            cleaner_id: cleanerProfileId,
            agreement_type: agreementType,
            version: '1.0',
            user_agent: navigator.userAgent,
          });
          // Only throw on non-duplicate errors
          if (error && !error.message.toLowerCase().includes('duplicate')) throw error;
        }
      }

      const { error: stepError } = await supabase
        .from('cleaner_profiles')
        .update({ onboarding_current_step: 'basic-info' })
        .eq('id', cleanerProfileId);

      if (stepError) throw stepError;
    },
    onSuccess: () => {
      invalidateProfile();
      queryClient.invalidateQueries({ queryKey: ['cleaner-agreements'] });
      setCurrentStepLocal('basic-info');
    },
  });

  // ─── STEP 2: Basic Info ───────────────────────────────────────────────────
  const saveBasicInfoMutation = useMutation({
    mutationFn: async (data: BasicInfoData) => {
      const cleanerProfileId = await getCleanerProfileId();
      const { error } = await supabase
        .from('cleaner_profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          bio: data.bio,
        })
        .eq('id', cleanerProfileId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateProfile();
      goToNextStep();
    },
  });

  // ─── STEP 3: Phone Verification ───────────────────────────────────────────
  // Saves verified phone number to the profiles table
  const savePhoneToProfile = async (phoneNumber: string) => {
    try {
      if (!user?.id) return;
      await supabase
        .from('profiles')
        .update({ phone_number: phoneNumber, phone_verified: true })
        .eq('id', user.id);
      invalidateProfile();
    } catch {
      // Non-blocking — phone save failure shouldn't block progression
    }
  };

  const completePhoneVerification = (phoneNumber?: string) => {
    if (phoneNumber) savePhoneToProfile(phoneNumber);
    goToNextStep();
  };

  // ─── STEP 4: Face Photo ───────────────────────────────────────────────────
  const saveFacePhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('Not authenticated');
      const cleanerProfileId = await getCleanerProfileId();

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
        .eq('id', cleanerProfileId);
      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      invalidateProfile();
      goToNextStep();
    },
  });

  // ─── STEP 5: ID Verification ──────────────────────────────────────────────
  const saveIdDocumentMutation = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const cleanerProfileId = await getCleanerProfileId();

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('identity-documents')
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      // Check for existing verification to avoid duplicate
      const { data: existing } = await supabase
        .from('id_verifications')
        .select('id')
        .eq('cleaner_id', cleanerProfileId)
        .eq('document_type', documentType)
        .maybeSingle();

      if (!existing) {
        const { error: verifyError } = await supabase
          .from('id_verifications')
          .insert({
            cleaner_id: cleanerProfileId,
            document_type: documentType,
            status: 'pending',
            document_url: fileName,
          });
        if (verifyError) throw verifyError;
      } else {
        // Update the document URL if re-uploading
        await supabase
          .from('id_verifications')
          .update({ document_url: fileName, status: 'pending' })
          .eq('id', existing.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['id-verifications'] });
      goToNextStep();
    },
  });

  // ─── STEP 6: Background Check Consent ────────────────────────────────────
  const saveBackgroundConsentMutation = useMutation({
    mutationFn: async () => {
      const cleanerProfileId = await getCleanerProfileId();

      // Check if consent already exists
      const { data: existingConsent } = await supabase
        .from('cleaner_agreements')
        .select('id')
        .eq('cleaner_id', cleanerProfileId)
        .eq('agreement_type', 'background_check_consent')
        .maybeSingle();

      if (!existingConsent) {
        const { error: agreementError } = await supabase.from('cleaner_agreements').insert({
          cleaner_id: cleanerProfileId,
          agreement_type: 'background_check_consent',
          version: '1.0',
          user_agent: navigator.userAgent,
        });
        if (agreementError && !agreementError.message.toLowerCase().includes('duplicate')) throw agreementError;
      }

      // Only create background check if one doesn't already exist
      const { data: existingCheck } = await supabase
        .from('background_checks')
        .select('id')
        .eq('cleaner_id', cleanerProfileId)
        .maybeSingle();

      if (!existingCheck) {
        const { error: checkError } = await supabase.from('background_checks').insert({
          cleaner_id: cleanerProfileId,
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

  // ─── STEP 7: Service Areas ────────────────────────────────────────────────
  const saveServiceAreasMutation = useMutation({
    mutationFn: async (data: ServiceAreaData) => {
      const cleanerProfileId = await getCleanerProfileId();

      const { error: profileError } = await supabase
        .from('cleaner_profiles')
        .update({ travel_radius_km: data.travelRadius })
        .eq('id', cleanerProfileId);
      if (profileError) throw profileError;

      // Delete existing service areas then insert fresh
      await supabase
        .from('cleaner_service_areas')
        .delete()
        .eq('cleaner_id', cleanerProfileId);

      if (data.selectedAreas.length > 0) {
        const serviceAreas = data.selectedAreas.map((zipCode) => ({
          cleaner_id: cleanerProfileId,
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
    monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
    friday: 5, saturday: 6, sunday: 0,
  };

  // ─── STEP 8: Availability ─────────────────────────────────────────────────
  const saveAvailabilityMutation = useMutation({
    mutationFn: async (data: AvailabilityData) => {
      const cleanerProfileId = await getCleanerProfileId();

      // Delete existing availability blocks
      await supabase
        .from('availability_blocks')
        .delete()
        .eq('cleaner_id', cleanerProfileId);

      const blocks = Object.entries(data.schedule)
        .filter(([_, schedule]) => schedule.enabled)
        .map(([day, schedule]) => ({
          cleaner_id: cleanerProfileId,
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

  // ─── STEP 9: Rates ────────────────────────────────────────────────────────
  const saveRatesMutation = useMutation({
    mutationFn: async (data: RatesData) => {
      const cleanerProfileId = await getCleanerProfileId();
      const { error } = await supabase
        .from('cleaner_profiles')
        .update({
          hourly_rate_credits: data.hourlyRate,
          travel_radius_km: data.travelRadius,
        })
        .eq('id', cleanerProfileId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateProfile();
      goToNextStep();
    },
  });

  // ─── STEP 10: Complete Onboarding ─────────────────────────────────────────
  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const cleanerProfileId = await getCleanerProfileId();
      const { error } = await supabase
        .from('cleaner_profiles')
        .update({
          onboarding_completed_at: new Date().toISOString(),
          onboarding_current_step: 'review',
        })
        .eq('id', cleanerProfileId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [CLEANER_PROFILE_KEY] });
      await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  return {
    currentStep,
    currentStepIndex,
    totalSteps,
    progress,
    // Only block render on the very first load — never re-show spinner on background refetches
    isLoading: (profileLoading && !bypassProfileLoading) || !isInitialized,
    profile: effectiveProfile,
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
