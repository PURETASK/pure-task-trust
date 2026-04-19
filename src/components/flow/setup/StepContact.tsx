import {
  FlowCard,
  FlowProgress,
  FlowField,
  FlowInput,
  FlowNav,
  FlowChip,
} from "@/components/flow";
import type { ContactData } from "@/hooks/useClientSetup";

interface Props {
  step: number;
  total: number;
  data: ContactData;
  saving: boolean;
  onChange: (patch: Partial<ContactData>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepContact({ step, total, data, saving, onChange, onBack, onNext }: Props) {
  const valid = data.first_name.trim() && data.last_name.trim() && data.phone.trim() && data.email.trim();

  return (
    <div className="space-y-6">
      <FlowProgress current={step} total={total} />
      <FlowCard
        title="Contact information"
        description="We use these to send booking updates and reach you about your visit."
      >
        <div className="grid sm:grid-cols-2 gap-5">
          <FlowField label="First name">
            <FlowInput
              value={data.first_name}
              onChange={(e) => onChange({ first_name: e.target.value })}
              autoComplete="given-name"
              placeholder="Alex"
            />
          </FlowField>
          <FlowField label="Last name">
            <FlowInput
              value={data.last_name}
              onChange={(e) => onChange({ last_name: e.target.value })}
              autoComplete="family-name"
              placeholder="Morgan"
            />
          </FlowField>
        </div>

        <FlowField
          label="Phone number"
          helper="Used for cleaner arrival updates and urgent support only."
        >
          <FlowInput
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            autoComplete="tel"
            placeholder="(555) 123-4567"
          />
        </FlowField>

        <div className="grid sm:grid-cols-2 gap-5">
          <FlowField label="Email">
            <FlowInput
              type="email"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </FlowField>
          <FlowField label="Alternate email" optional>
            <FlowInput
              type="email"
              value={data.alternate_email ?? ""}
              onChange={(e) => onChange({ alternate_email: e.target.value })}
              placeholder="backup@example.com"
            />
          </FlowField>
        </div>

        <FlowField label="Preferred contact method" optional>
          <div className="flex flex-wrap gap-2">
            {(["email", "sms", "call"] as const).map((m) => (
              <FlowChip
                key={m}
                selected={data.preferred_contact_method === m}
                onClick={() => onChange({ preferred_contact_method: m })}
              >
                {m === "email" ? "Email" : m === "sms" ? "Text message" : "Phone call"}
              </FlowChip>
            ))}
          </div>
        </FlowField>
      </FlowCard>

      <FlowNav
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!valid}
        loading={saving}
      />
    </div>
  );
}
