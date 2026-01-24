import { useCallback, useRef } from "react";
import { useAnalytics } from "./useAnalytics";

export type FunnelType = "booking" | "signup" | "cleaner_onboarding";

export interface FunnelStep {
  name: string;
  startedAt: number;
}

const FUNNEL_STEPS: Record<FunnelType, string[]> = {
  booking: ["start", "address", "datetime", "cleaner", "payment", "confirm", "complete"],
  signup: ["landing", "auth_start", "credentials", "role_selection", "profile", "complete"],
  cleaner_onboarding: ["start", "basic_info", "verification", "rates", "availability", "complete"],
};

export function useFunnelTracking(funnelType: FunnelType) {
  const { trackEvent } = useAnalytics();
  const currentStep = useRef<FunnelStep | null>(null);
  const completedSteps = useRef<string[]>([]);
  const funnelStartTime = useRef<number | null>(null);

  const startFunnel = useCallback(() => {
    funnelStartTime.current = Date.now();
    completedSteps.current = [];
    
    trackEvent("funnel_started", {
      funnel_type: funnelType,
      total_steps: FUNNEL_STEPS[funnelType].length,
    });
  }, [funnelType, trackEvent]);

  const startStep = useCallback(
    (stepName: string) => {
      // Complete previous step if exists
      if (currentStep.current) {
        const timeOnStep = Date.now() - currentStep.current.startedAt;
        trackEvent("funnel_step_completed", {
          funnel_type: funnelType,
          step_name: currentStep.current.name,
          time_on_step_ms: timeOnStep,
        });
        completedSteps.current.push(currentStep.current.name);
      }

      // Start new step
      currentStep.current = {
        name: stepName,
        startedAt: Date.now(),
      };

      const stepIndex = FUNNEL_STEPS[funnelType].indexOf(stepName);
      trackEvent("funnel_step_started", {
        funnel_type: funnelType,
        step_name: stepName,
        step_index: stepIndex,
        total_steps: FUNNEL_STEPS[funnelType].length,
      });
    },
    [funnelType, trackEvent]
  );

  const completeStep = useCallback(
    (stepName: string, metadata?: Record<string, unknown>) => {
      if (currentStep.current?.name === stepName) {
        const timeOnStep = Date.now() - currentStep.current.startedAt;
        trackEvent("funnel_step_completed", {
          funnel_type: funnelType,
          step_name: stepName,
          time_on_step_ms: timeOnStep,
          ...metadata,
        });
        completedSteps.current.push(stepName);
        currentStep.current = null;
      }
    },
    [funnelType, trackEvent]
  );

  const completeFunnel = useCallback(
    (conversionValue?: number, metadata?: Record<string, unknown>) => {
      const totalTime = funnelStartTime.current
        ? Date.now() - funnelStartTime.current
        : 0;

      trackEvent("funnel_completed", {
        funnel_type: funnelType,
        total_time_ms: totalTime,
        steps_completed: completedSteps.current.length,
        conversion_value: conversionValue,
        ...metadata,
      });

      // Reset
      currentStep.current = null;
      completedSteps.current = [];
      funnelStartTime.current = null;
    },
    [funnelType, trackEvent]
  );

  const abandonFunnel = useCallback(
    (reason?: string) => {
      const totalTime = funnelStartTime.current
        ? Date.now() - funnelStartTime.current
        : 0;

      trackEvent("funnel_abandoned", {
        funnel_type: funnelType,
        total_time_ms: totalTime,
        steps_completed: completedSteps.current.length,
        last_step: currentStep.current?.name,
        reason,
      });

      // Reset
      currentStep.current = null;
      completedSteps.current = [];
      funnelStartTime.current = null;
    },
    [funnelType, trackEvent]
  );

  return {
    startFunnel,
    startStep,
    completeStep,
    completeFunnel,
    abandonFunnel,
    currentStepName: currentStep.current?.name,
    completedStepsCount: completedSteps.current.length,
    funnelSteps: FUNNEL_STEPS[funnelType],
  };
}
