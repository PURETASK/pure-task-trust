import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCleanerProfile } from '@/hooks/useCleanerProfile';

export type OnboardingStep = 'basic-info' | 'face-verification' | 'id-verification' | 'rates' | 'complete';

const STEPS: OnboardingStep[] = ['basic-info', 'face-verification', 'id-verification', 'rates', 'complete'];

export interface BasicInfoData {
  firstName: string;
  lastName: string;
  bio: string;
}

export interface RatesData {
  hourlyRate: number;
  travelRadius: number;
}

export function useCleanerOnboarding() {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useCleanerProfile();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('basic-info');

  const currentStepIndex = STEPS.indexOf(currentStep);
  const totalSteps = STEPS.length - 1; // Exclude 'complete' from count
  const progress = (currentStepIndex / totalSteps) * 100;

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

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
      queryClient.invalidateQueries({ queryKey: ['cleanerProfile'] });
      goToNextStep();
    },
  });

  const saveFacePhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id || !profile?.id) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/face-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Update profile with photo URL
      const { error: updateError } = await supabase
        .from('cleaner_profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleanerProfile'] });
      goToNextStep();
    },
  });

  const saveIdDocumentMutation = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      if (!user?.id || !profile?.id) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType}-${Date.now()}.${fileExt}`;

      // Upload to private identity-documents bucket
      const { error: uploadError } = await supabase.storage
        .from('identity-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Create verification record
      const { error: verifyError } = await supabase
        .from('id_verifications')
        .insert({
          cleaner_id: profile.id,
          document_type: documentType,
          status: 'pending',
          document_url: fileName, // Store path, not public URL (private bucket)
        });

      if (verifyError) throw verifyError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['id-verifications'] });
      goToNextStep();
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['cleanerProfile'] });
      goToNextStep();
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error('No cleaner profile found');

      const { error } = await supabase
        .from('cleaner_profiles')
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleanerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  return {
    currentStep,
    currentStepIndex,
    totalSteps,
    progress,
    isLoading: profileLoading,
    profile,
    goToNextStep,
    goToPreviousStep,
    setCurrentStep,
    saveBasicInfo: saveBasicInfoMutation.mutateAsync,
    isSavingBasicInfo: saveBasicInfoMutation.isPending,
    saveFacePhoto: saveFacePhotoMutation.mutateAsync,
    isSavingFacePhoto: saveFacePhotoMutation.isPending,
    saveIdDocument: saveIdDocumentMutation.mutateAsync,
    isSavingIdDocument: saveIdDocumentMutation.isPending,
    saveRates: saveRatesMutation.mutateAsync,
    isSavingRates: saveRatesMutation.isPending,
    completeOnboarding: completeOnboardingMutation.mutateAsync,
    isCompletingOnboarding: completeOnboardingMutation.isPending,
  };
}
