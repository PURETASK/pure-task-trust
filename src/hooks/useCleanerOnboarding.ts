import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCleanerProfile } from '@/hooks/useCleanerProfile';
import type { Database } from '@/integrations/supabase/types';

// ── Types ───────────────────────────────────────────────────────────────────

export type OnboardingPhase =
  | 'agreement'
  | 'profile'
  | 'personal'
  | 'verification'
  | 'work-setup'
  | 'specialties'
  | 'emergency'
  | 'payout'
  | 'launch';

const PHASES: OnboardingPhase[] = [
  'agreement',
  'profile',
  'personal',
  'verification',
  'work-setup',
  'specialties',
  'emergency',
  'payout',
  'launch',
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

export interface AvailabilityData {
  schedule: Record<string, { enabled: boolean; startTime: string; endTime: string }>;
}

type CleanerProfile = Database['public']['Tables']['cleaner_profiles']['Row'];

const CLEANER_PROFILE_KEY = 'cleaner-profile';

const LEGACY_STEP_MAP: Record<string, OnboardingPhase> = {
  terms: 'agreement', 'basic-info': 'profile', 'phone-verification': 'profile',
  'face-verification': 'profile', 'id-verification': 'verification',
  'background-consent': 'verification', 'service-areas': 'work-setup',
  availability: 'work-setup', rates: 'work-setup', review: 'launch',
};

const DAY_TO_NUM: Record<string, number> = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
  friday: 5, saturday: 6, sunday: 0,
};

function resolvePhase(step: string | null | undefined): OnboardingPhase {
  if (!step) return 'agreement';
  if (PHASES.includes(step as OnboardingPhase)) return step as OnboardingPhase;
  return LEGACY_STEP_MAP[step] ?? 'agreement';
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useCleanerOnboarding() {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useCleanerProfile();
  const queryClient = useQueryClient();

  const [currentPhase, setPhaseLocal] = useState<OnboardingPhase>('agreement');
  const [isInitialized, setIsInitialized] = useState(false);
  const profileIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (profile?.id) profileIdRef.current = profile.id;
  }, [profile?.id]);

  // ── Initialize phase from DB ──────────────────────────────────────────
  useEffect(() => {
    if (isInitialized || profileLoading) return;
    let cancelled = false;

    (async () => {
      if (!profile?.id) {
        if (!cancelled) setIsInitialized(true);
        return;
      }

      if (profile.onboarding_completed_at) {
        if (!cancelled) { setPhaseLocal('launch'); setIsInitialized(true); }
        return;
      }

      const saved = resolvePhase(profile.onboarding_current_step);

      if (saved === 'agreement') {
        const { data: agreements } = await supabase
          .from('cleaner_agreements').select('agreement_type')
          .eq('cleaner_id', profile.id)
          .in('agreement_type', ['terms_of_service', 'independent_contractor']);

        const types = new Set((agreements ?? []).map(a => a.agreement_type));
        if (types.has('terms_of_service') && types.has('independent_contractor')) {
          if (!cancelled) { setPhaseLocal('profile'); setIsInitialized(true); }
          return;
        }
      }

      if (!cancelled) { setPhaseLocal(saved); setIsInitialized(true); }
    })();

    return () => { cancelled = true; };
  }, [isInitialized, profile?.id, profile?.onboarding_completed_at, profile?.onboarding_current_step, profileLoading]);

  // ── Profile ID helpers ────────────────────────────────────────────────
  const getProfileId = async (): Promise<string> => {
    if (profileIdRef.current) return profileIdRef.current;
    if (!user?.id) throw new Error('Not authenticated');
    const { data } = await supabase.from('cleaner_profiles').select('id').eq('user_id', user.id).maybeSingle();
    if (data?.id) { profileIdRef.current = data.id; return data.id; }
    throw new Error('No cleaner profile found');
  };

  const ensureProfileId = async (): Promise<string> => {
    if (profileIdRef.current) return profileIdRef.current;
    if (profile?.id) { profileIdRef.current = profile.id; return profile.id; }
    if (!user?.id) throw new Error('Not authenticated');

    const { data: existing } = await supabase.from('cleaner_profiles').select('id').eq('user_id', user.id).limit(1);
    if (existing?.[0]?.id) { profileIdRef.current = existing[0].id; return existing[0].id; }

    const { data: created, error } = await supabase.from('cleaner_profiles').insert({ user_id: user.id }).select('id').single();
    if (error) throw error;
    profileIdRef.current = created.id;
    return created.id;
  };

  // ── Navigation ────────────────────────────────────────────────────────
  const savePhaseToDb = async (phase: OnboardingPhase) => {
    try {
      const id = await getProfileId();
      await supabase.from('cleaner_profiles').update({ onboarding_current_step: phase }).eq('id', id);
    } catch (e) { console.error('Failed to persist phase:', e); }
  };

  const advancePhase = () => {
    const idx = PHASES.indexOf(currentPhase);
    if (idx < PHASES.length - 1) {
      const next = PHASES[idx + 1];
      setPhaseLocal(next);
      void savePhaseToDb(next);
    }
  };

  const goBack = () => {
    const idx = PHASES.indexOf(currentPhase);
    if (idx > 0) {
      const prev = PHASES[idx - 1];
      setPhaseLocal(prev);
      void savePhaseToDb(prev);
    }
  };

  const invalidateProfile = () => {
    queryClient.invalidateQueries({ queryKey: [CLEANER_PROFILE_KEY] });
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
  };

  // ── Mutations ─────────────────────────────────────────────────────────

  const saveAgreementsMutation = useMutation({
    mutationFn: async () => {
      const id = await ensureProfileId();
      const types = ['terms_of_service', 'independent_contractor'];
      const { data: existing } = await supabase.from('cleaner_agreements').select('agreement_type').eq('cleaner_id', id).in('agreement_type', types);
      const accepted = new Set((existing ?? []).map(a => a.agreement_type));
      const missing = types.filter(t => !accepted.has(t)).map(t => ({
        cleaner_id: id, agreement_type: t, version: '1.0', user_agent: navigator.userAgent,
      }));
      if (missing.length > 0) {
        const { error } = await supabase.from('cleaner_agreements').insert(missing);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cleaner-agreements'] }),
  });

  const saveBasicInfoMutation = useMutation({
    mutationFn: async (data: BasicInfoData) => {
      const id = await getProfileId();
      const { error } = await supabase.from('cleaner_profiles')
        .update({ first_name: data.firstName, last_name: data.lastName, bio: data.bio }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => invalidateProfile(),
  });

  const saveFacePhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('Not authenticated');
      const id = await getProfileId();
      const ext = file.name.split('.').pop();
      const fileName = `${user.id}/face-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('profile-photos').upload(fileName, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from('profile-photos').getPublicUrl(fileName);
      const { error } = await supabase.from('cleaner_profiles').update({ profile_photo_url: publicUrl }).eq('id', id);
      if (error) throw error;
      return publicUrl;
    },
    onSuccess: () => invalidateProfile(),
  });

  const savePhone = async (phone: string) => {
    if (!user?.id) return;
    await supabase.from('profiles').update({ phone_number: phone, phone_verified: true }).eq('id', user.id);
    invalidateProfile();
  };

  const saveIdDocumentMutation = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const id = await getProfileId();
      const ext = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('identity-documents').upload(fileName, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: existing } = await supabase.from('id_verifications').select('id').eq('cleaner_id', id).eq('document_type', documentType).maybeSingle();
      if (!existing) {
        await supabase.from('id_verifications').insert({ cleaner_id: id, document_type: documentType, status: 'pending', document_url: fileName });
      } else {
        await supabase.from('id_verifications').update({ document_url: fileName, status: 'pending' }).eq('id', existing.id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['id-verifications'] }),
  });

  const saveBackgroundConsentMutation = useMutation({
    mutationFn: async () => {
      const id = await getProfileId();
      const { data: ec } = await supabase.from('cleaner_agreements').select('id').eq('cleaner_id', id).eq('agreement_type', 'background_check_consent').maybeSingle();
      if (!ec) {
        const { error } = await supabase.from('cleaner_agreements').insert({ cleaner_id: id, agreement_type: 'background_check_consent', version: '1.0', user_agent: navigator.userAgent });
        if (error && !error.message.toLowerCase().includes('duplicate')) throw error;
      }
      const { data: existingCheck } = await supabase.from('background_checks').select('id').eq('cleaner_id', id).maybeSingle();
      if (!existingCheck) {
        const { error } = await supabase.from('background_checks').insert({ cleaner_id: id, status: 'pending', provider: 'checkr' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-agreements'] });
      queryClient.invalidateQueries({ queryKey: ['background-checks'] });
    },
  });

  const saveServiceAreasMutation = useMutation({
    mutationFn: async (data: ServiceAreaData) => {
      const id = await getProfileId();
      await supabase.from('cleaner_profiles').update({ travel_radius_km: data.travelRadius }).eq('id', id);
      await supabase.from('cleaner_service_areas').delete().eq('cleaner_id', id);
      if (data.selectedAreas.length > 0) {
        const { error } = await supabase.from('cleaner_service_areas')
          .insert(data.selectedAreas.map(zip => ({ cleaner_id: id, zip_code: zip })));
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cleaner-service-areas'] }); invalidateProfile(); },
  });

  const saveAvailabilityMutation = useMutation({
    mutationFn: async (data: AvailabilityData) => {
      const id = await getProfileId();
      await supabase.from('availability_blocks').delete().eq('cleaner_id', id);
      const blocks = Object.entries(data.schedule).filter(([, s]) => s.enabled)
        .map(([day, s]) => ({ cleaner_id: id, day_of_week: DAY_TO_NUM[day] ?? 1, start_time: s.startTime, end_time: s.endTime, is_active: true }));
      if (blocks.length > 0) {
        const { error } = await supabase.from('availability_blocks').insert(blocks);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['availability-blocks'] }),
  });

  const saveRatesMutation = useMutation({
    mutationFn: async (data: RatesData) => {
      const id = await getProfileId();
      const { error } = await supabase.from('cleaner_profiles')
        .update({ hourly_rate_credits: data.hourlyRate, travel_radius_km: data.travelRadius }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => invalidateProfile(),
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const id = await getProfileId();
      const { error } = await supabase.from('cleaner_profiles')
        .update({ onboarding_completed_at: new Date().toISOString(), onboarding_current_step: 'launch' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => invalidateProfile(),
  });

  // ── New: Personal info (DOB + home address) ───────────────────────────
  const savePersonalInfoMutation = useMutation({
    mutationFn: async (data: { date_of_birth: string; home_address: { street: string; city: string; state: string; zip: string } }) => {
      const id = await getProfileId();
      const { error } = await supabase.from('cleaner_profiles')
        .update({ date_of_birth: data.date_of_birth, home_address: data.home_address as any })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => invalidateProfile(),
  });

  // ── New: Specialties / languages / pet-friendly / supplies ────────────
  const saveSpecialtiesMutation = useMutation({
    mutationFn: async (data: { specialties: string[]; languages: string[]; pet_friendly: boolean; brings_supplies: boolean }) => {
      const id = await getProfileId();
      const { error } = await supabase.from('cleaner_profiles')
        .update({
          specialties: data.specialties,
          languages: data.languages,
          pet_friendly: data.pet_friendly,
          brings_supplies: data.brings_supplies,
        } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => invalidateProfile(),
  });

  // ── New: Emergency contact ────────────────────────────────────────────
  const saveEmergencyContactMutation = useMutation({
    mutationFn: async (data: { emergency_contact: { name: string; phone: string; relationship: string } }) => {
      const id = await getProfileId();
      const { error } = await supabase.from('cleaner_profiles')
        .update({ emergency_contact: data.emergency_contact as any })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => invalidateProfile(),
  });

  return {
    currentPhase,
    currentPhaseIndex: PHASES.indexOf(currentPhase),
    totalPhases: PHASES.length,
    isLoading: profileLoading || !isInitialized,
    profile,
    advancePhase,
    goBack,

    saveAgreements: saveAgreementsMutation.mutateAsync,
    isSavingAgreements: saveAgreementsMutation.isPending,
    saveBasicInfo: saveBasicInfoMutation.mutateAsync,
    isSavingBasicInfo: saveBasicInfoMutation.isPending,
    saveFacePhoto: saveFacePhotoMutation.mutateAsync,
    isSavingFacePhoto: saveFacePhotoMutation.isPending,
    savePhone,
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

    savePersonalInfo: savePersonalInfoMutation.mutateAsync,
    isSavingPersonalInfo: savePersonalInfoMutation.isPending,
    saveSpecialties: saveSpecialtiesMutation.mutateAsync,
    isSavingSpecialties: saveSpecialtiesMutation.isPending,
    saveEmergencyContact: saveEmergencyContactMutation.mutateAsync,
    isSavingEmergencyContact: saveEmergencyContactMutation.isPending,
  };
}
