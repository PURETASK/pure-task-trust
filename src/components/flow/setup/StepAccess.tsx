import {
  FlowCard,
  FlowProgress,
  FlowField,
  FlowInput,
  FlowTextarea,
  FlowNav,
  FlowChip,
} from "@/components/flow";
import type { AccessData } from "@/hooks/useClientSetup";

interface Props {
  step: number;
  total: number;
  data: AccessData;
  saving: boolean;
  onChange: (patch: Partial<AccessData>) => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export function StepAccess({ step, total, data, saving, onChange, onBack, onNext, onSkip }: Props) {
  return (
    <div className="space-y-6">
      <FlowProgress current={step} total={total} />
      <FlowCard
        title="Access, parking & pets"
        description="Helping your cleaner arrive prepared. Only share what's needed for the visit."
      >
        <FlowField label="Parking instructions" optional>
          <FlowTextarea
            value={data.parking_notes ?? ""}
            onChange={(e) => onChange({ parking_notes: e.target.value })}
            placeholder="Free street parking on Elm. Visitor lot in back if full."
          />
        </FlowField>

        <FlowField
          label="Entry instructions"
          helper="How to enter the home — door codes, lockbox, key location."
          optional
        >
          <FlowTextarea
            value={data.access_instructions ?? ""}
            onChange={(e) => onChange({ access_instructions: e.target.value })}
            placeholder="Side door is unlocked. Lockbox code 4-2-1-7."
          />
        </FlowField>

        <div className="grid sm:grid-cols-2 gap-5">
          <FlowField label="Gate / callbox code" optional>
            <FlowInput
              value={data.gate_code ?? ""}
              onChange={(e) => onChange({ gate_code: e.target.value })}
              placeholder="#1234"
            />
          </FlowField>
          <FlowField label="Doorman / front desk" optional>
            <FlowInput
              value={data.doorman_notes ?? ""}
              onChange={(e) => onChange({ doorman_notes: e.target.value })}
              placeholder="Tell the desk you're with PureTask"
            />
          </FlowField>
        </div>

        <FlowField label="Pets in the home?">
          <div className="flex gap-2">
            <FlowChip
              selected={data.has_pets === true}
              onClick={() => onChange({ has_pets: true })}
            >
              Yes
            </FlowChip>
            <FlowChip
              selected={data.has_pets === false}
              onClick={() => onChange({ has_pets: false, pet_info: "", pet_friendly_required: false })}
            >
              No pets
            </FlowChip>
          </div>
        </FlowField>

        {data.has_pets && (
          <div className="space-y-5 rounded-2xl bg-aero-bg border border-aero p-4 sm:p-5">
            <FlowField label="Pet details" optional helper="Type, name, temperament, where they'll be during the visit.">
              <FlowTextarea
                value={data.pet_info ?? ""}
                onChange={(e) => onChange({ pet_info: e.target.value })}
                placeholder="Friendly golden retriever, will be in the bedroom."
              />
            </FlowField>
            <FlowField label="Need a pet-friendly cleaner?" optional>
              <div className="flex gap-2">
                <FlowChip
                  selected={!!data.pet_friendly_required}
                  onClick={() => onChange({ pet_friendly_required: true })}
                >
                  Yes, please
                </FlowChip>
                <FlowChip
                  selected={data.pet_friendly_required === false}
                  onClick={() => onChange({ pet_friendly_required: false })}
                >
                  Not required
                </FlowChip>
              </div>
            </FlowField>
          </div>
        )}
      </FlowCard>

      <FlowNav onBack={onBack} onNext={onNext} onSkip={onSkip} loading={saving} />
    </div>
  );
}
