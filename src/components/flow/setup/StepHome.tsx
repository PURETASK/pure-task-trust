import {
  FlowCard,
  FlowProgress,
  FlowField,
  FlowInput,
  FlowNav,
  FlowChip,
} from "@/components/flow";
import type { HomeData } from "@/hooks/useClientSetup";

interface Props {
  step: number;
  total: number;
  data: HomeData;
  saving: boolean;
  onChange: (patch: Partial<HomeData>) => void;
  onBack: () => void;
  onNext: () => void;
}

const HOME_TYPES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "townhome", label: "Townhome" },
  { value: "other", label: "Other" },
];

export function StepHome({ step, total, data, saving, onChange, onBack, onNext }: Props) {
  const valid =
    data.line1.trim() &&
    data.city.trim() &&
    data.state.trim() &&
    data.postal_code.trim() &&
    data.home_type &&
    data.bedrooms != null &&
    data.bathrooms != null;

  const requiresElevator = data.home_type === "apartment" || data.home_type === "condo";

  return (
    <div className="space-y-6">
      <FlowProgress current={step} total={total} />
      <FlowCard
        title="Tell us about your home"
        description="This helps us match the right cleaner and price your visit accurately."
      >
        <FlowField label="Street address">
          <FlowInput
            value={data.line1}
            onChange={(e) => onChange({ line1: e.target.value })}
            autoComplete="address-line1"
            placeholder="123 Main Street"
          />
        </FlowField>

        <div className="grid sm:grid-cols-2 gap-5">
          <FlowField label="Apartment / Unit" optional>
            <FlowInput
              value={data.line2 ?? ""}
              onChange={(e) => onChange({ line2: e.target.value })}
              autoComplete="address-line2"
              placeholder="Apt 4B"
            />
          </FlowField>
          <FlowField label="City">
            <FlowInput
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              autoComplete="address-level2"
              placeholder="San Francisco"
            />
          </FlowField>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <FlowField label="State">
            <FlowInput
              value={data.state}
              onChange={(e) => onChange({ state: e.target.value.toUpperCase() })}
              autoComplete="address-level1"
              placeholder="CA"
              maxLength={2}
            />
          </FlowField>
          <FlowField label="ZIP">
            <FlowInput
              value={data.postal_code}
              onChange={(e) => onChange({ postal_code: e.target.value })}
              autoComplete="postal-code"
              placeholder="94110"
              inputMode="numeric"
            />
          </FlowField>
        </div>

        <FlowField label="Home type">
          <div className="flex flex-wrap gap-2">
            {HOME_TYPES.map((t) => (
              <FlowChip
                key={t.value}
                selected={data.home_type === t.value}
                onClick={() => onChange({ home_type: t.value })}
              >
                {t.label}
              </FlowChip>
            ))}
          </div>
        </FlowField>

        <div className="grid sm:grid-cols-2 gap-5">
          <FlowField label="Bedrooms">
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <FlowChip
                  key={n}
                  selected={data.bedrooms === n}
                  onClick={() => onChange({ bedrooms: n })}
                >
                  {n === 5 ? "5+" : n === 0 ? "Studio" : n}
                </FlowChip>
              ))}
            </div>
          </FlowField>
          <FlowField label="Bathrooms">
            <div className="flex flex-wrap gap-2">
              {[1, 1.5, 2, 2.5, 3, 4].map((n) => (
                <FlowChip
                  key={n}
                  selected={data.bathrooms === n}
                  onClick={() => onChange({ bathrooms: n })}
                >
                  {n === 4 ? "4+" : n}
                </FlowChip>
              ))}
            </div>
          </FlowField>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <FlowField label="Square footage" optional>
            <FlowInput
              type="number"
              value={data.sq_ft ?? ""}
              onChange={(e) =>
                onChange({ sq_ft: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="1200"
              inputMode="numeric"
            />
          </FlowField>
          <FlowField label="Number of floors" optional>
            <FlowInput
              type="number"
              value={data.floors ?? ""}
              onChange={(e) =>
                onChange({ floors: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="1"
              inputMode="numeric"
            />
          </FlowField>
        </div>

        {requiresElevator && (
          <FlowField label="Elevator access" optional>
            <div className="flex gap-2">
              <FlowChip
                selected={data.has_elevator === true}
                onClick={() => onChange({ has_elevator: true })}
              >
                Yes
              </FlowChip>
              <FlowChip
                selected={data.has_elevator === false}
                onClick={() => onChange({ has_elevator: false })}
              >
                No
              </FlowChip>
            </div>
          </FlowField>
        )}
      </FlowCard>

      <FlowNav onBack={onBack} onNext={onNext} nextDisabled={!valid} loading={saving} />
    </div>
  );
}
