import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { FlowShell } from "@/components/flow";
import { useClientSetup, SETUP_STEPS, type SetupStep } from "@/hooks/useClientSetup";
import { StepWelcome } from "@/components/flow/setup/StepWelcome";
import { StepContact } from "@/components/flow/setup/StepContact";
import { StepHome } from "@/components/flow/setup/StepHome";
import { StepAccess } from "@/components/flow/setup/StepAccess";
import { StepPreferences } from "@/components/flow/setup/StepPreferences";
import { StepReview } from "@/components/flow/setup/StepReview";
import { Skeleton } from "@/components/ui/skeleton";

const TOTAL = SETUP_STEPS.length;

export default function ClientSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, saving, updateContact, updateHome, updateAccess, updatePrefs, saveStep } =
    useClientSetup();
  const [step, setStep] = useState<SetupStep>("welcome");

  // Resume where the user left off
  useEffect(() => {
    if (state.loading) return;
    if (state.setupCompleted) {
      const dest = (location.state as any)?.from?.pathname ?? "/book";
      navigate(dest, { replace: true });
    }
  }, [state.loading, state.setupCompleted, location.state, navigate]);

  const stepIndex = SETUP_STEPS.indexOf(step);

  const goNext = async () => {
    const nextIdx = Math.min(stepIndex + 1, SETUP_STEPS.length - 1);
    const nextStep = SETUP_STEPS[nextIdx];
    if (step !== "welcome") {
      const ok = await saveStep(nextStep);
      if (!ok) {
        toast.error("Couldn't save. Please try again.");
        return;
      }
    }
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    const prev = SETUP_STEPS[Math.max(0, stepIndex - 1)];
    setStep(prev);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToStep = (s: SetupStep) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const finish = async () => {
    const ok = await saveStep("complete");
    if (!ok) {
      toast.error("Couldn't finish setup. Please try again.");
      return;
    }
    toast.success("Profile saved! Let's book your first cleaning.");
    const dest = (location.state as any)?.from?.pathname ?? "/book";
    navigate(dest, { replace: true });
  };

  if (state.loading) {
    return (
      <FlowShell>
        <Skeleton className="h-96 w-full rounded-3xl" />
      </FlowShell>
    );
  }

  return (
    <FlowShell>
      <Helmet>
        <title>Set up your profile · PureTask</title>
        <meta name="description" content="Set up your PureTask home profile and preferences in just a few quick steps." />
      </Helmet>

      {step === "welcome" && <StepWelcome total={TOTAL} onStart={goNext} />}

      {step === "contact" && (
        <StepContact
          step={2}
          total={TOTAL}
          data={state.contact}
          saving={saving}
          onChange={updateContact}
          onBack={goBack}
          onNext={goNext}
        />
      )}

      {step === "home" && (
        <StepHome
          step={3}
          total={TOTAL}
          data={state.home}
          saving={saving}
          onChange={updateHome}
          onBack={goBack}
          onNext={goNext}
        />
      )}

      {step === "access" && (
        <StepAccess
          step={4}
          total={TOTAL}
          data={state.access}
          saving={saving}
          onChange={updateAccess}
          onBack={goBack}
          onNext={goNext}
          onSkip={goNext}
        />
      )}

      {step === "preferences" && (
        <StepPreferences
          step={5}
          total={TOTAL}
          data={state.prefs}
          saving={saving}
          onChange={updatePrefs}
          onBack={goBack}
          onNext={goNext}
          onSkip={goNext}
        />
      )}

      {step === "review" && (
        <StepReview
          step={6}
          total={TOTAL}
          state={state}
          saving={saving}
          onBack={goBack}
          onConfirm={finish}
          onEdit={(target) => {
            const map: Record<string, SetupStep> = {
              contact: "contact",
              home: "home",
              access: "access",
              preferences: "preferences",
            };
            goToStep(map[target]);
          }}
        />
      )}
    </FlowShell>
  );
}
