import {
  FlowCard,
  FlowProgress,
  FlowField,
  FlowTextarea,
  FlowNav,
  FlowChip,
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

const PRIORITIES = [
  "Deep Cleaning",
  "Speed / Efficiency",
  "Attention to Detail",
  "Sanitization",
  "Organization",
  "Eco-Friendly Products",
  "Pet Hair Focus",
  "Kitchen Focus",
  "Bathroom Focus",
];

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
  const togglePriority = (p: string) => {
    const next = data.priorities.includes(p)
      ? data.priorities.filter((x) => x !== p)
      : [...data.priorities, p];
    onChange({ priorities: next });
  };

  return (
    <div className="space-y-6">
      <FlowProgress current={step} total={total} />
      <FlowCard
        title="Cleaning preferences"
        description="What matters most to you? This personalizes every visit."
      >
        <FlowField label="Cleaning priorities" helper="Select any that apply." optional>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((p) => (
              <FlowChip
                key={p}
                selected={data.priorities.includes(p)}
                onClick={() => togglePriority(p)}
              >
                {p}
              </FlowChip>
            ))}
          </div>
        </FlowField>

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

        <FlowField label="Scent preference" optional>
          <div className="flex flex-wrap gap-2">
            {["Fragrance-free", "Light & clean", "Citrus", "Lavender"].map((s) => (
              <FlowChip
                key={s}
                selected={data.scent_preference === s}
                onClick={() =>
                  onChange({ scent_preference: data.scent_preference === s ? "" : s })
                }
              >
                {s}
              </FlowChip>
            ))}
          </div>
        </FlowField>

        <FlowField label="Eco-friendly products only?" optional>
          <div className="flex gap-2">
            <FlowChip
              selected={!!data.eco_preference}
              onClick={() => onChange({ eco_preference: true })}
            >
              Yes please
            </FlowChip>
            <FlowChip
              selected={data.eco_preference === false}
              onClick={() => onChange({ eco_preference: false })}
            >
              No preference
            </FlowChip>
          </div>
        </FlowField>
      </FlowCard>

      <FlowNav onBack={onBack} onNext={onNext} onSkip={onSkip} loading={saving} />
    </div>
  );
}
