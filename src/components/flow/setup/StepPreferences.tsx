import {
  FlowCard,
  FlowProgress,
  FlowField,
  FlowTextarea,
  FlowNav,
} from "@/components/flow";
import type { PrefsData } from "@/hooks/useClientSetup";

interface Props {
  step: number;
  total: number;
  data: PrefsData;
  saving: boolean;
  onChange: (patch: Partial<PrefsData>) => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export function StepPreferences({
  step,
  total,
  data,
  saving,
  onChange,
  onBack,
  onNext,
  onSkip,
}: Props) {
  return (
    <div className="space-y-6">
      <FlowProgress current={step} total={total} />
      <FlowCard
        title="Cleaning preferences"
        description="What matters most to you? This personalizes every visit."
      >
        <div className="grid sm:grid-cols-2 gap-5">
          <FlowField label="Areas needing extra attention" optional>
            <FlowTextarea
              value={data.extra_attention_notes ?? ""}
              onChange={(e) => onChange({ extra_attention_notes: e.target.value })}
              placeholder="Kitchen sink, shower glass…"
            />
          </FlowField>
          <FlowField label="Areas to avoid" optional>
            <FlowTextarea
              value={data.avoid_notes ?? ""}
              onChange={(e) => onChange({ avoid_notes: e.target.value })}
              placeholder="Office desk, kids' art table…"
            />
          </FlowField>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <FlowField label="Product preferences" optional>
            <FlowTextarea
              value={data.product_preferences ?? ""}
              onChange={(e) => onChange({ product_preferences: e.target.value })}
              placeholder="Use my supplies under the sink."
            />
          </FlowField>
          <FlowField label="Allergies / sensitivities" optional>
            <FlowTextarea
              value={data.allergy_notes ?? ""}
              onChange={(e) => onChange({ allergy_notes: e.target.value })}
              placeholder="No bleach, fragrance-free only."
            />
          </FlowField>
        </div>
      </FlowCard>

      <FlowNav onBack={onBack} onNext={onNext} onSkip={onSkip} loading={saving} />
    </div>
  );
}
