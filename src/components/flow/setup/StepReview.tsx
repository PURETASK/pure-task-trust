import { ReactNode } from "react";
import { Pencil, CheckCircle2 } from "lucide-react";
import {
  FlowCard,
  FlowProgress,
  FlowNav,
} from "@/components/flow";
import type { SetupState } from "@/hooks/useClientSetup";

interface Props {
  step: number;
  total: number;
  state: SetupState;
  saving: boolean;
  onBack: () => void;
  onConfirm: () => void;
  onEdit: (target: "contact" | "home" | "access" | "preferences") => void;
}

function Section({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-aero bg-aero-bg/40 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-poppins font-semibold text-base">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 text-sm text-aero-trust hover:underline"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      </div>
      <div className="text-sm text-foreground/90 space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-3">
      <span className="text-aero-soft min-w-32 sm:min-w-36">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

export function StepReview({ step, total, state, saving, onBack, onConfirm, onEdit }: Props) {
  const { contact, home, access, prefs } = state;
  const fullAddr = [
    home.line1,
    home.line2,
    `${home.city}${home.state ? `, ${home.state}` : ""} ${home.postal_code}`.trim(),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-6">
      <FlowProgress current={step} total={total} />
      <FlowCard
        title="Review your home profile"
        description="Make sure this looks right. You can edit any section later."
      >
        <Section title="Contact" onEdit={() => onEdit("contact")}>
          <Row label="Name" value={`${contact.first_name} ${contact.last_name}`.trim()} />
          <Row label="Phone" value={contact.phone} />
          <Row label="Email" value={contact.email} />
          {contact.alternate_email && <Row label="Alt email" value={contact.alternate_email} />}
          {contact.preferred_contact_method && (
            <Row label="Prefers" value={contact.preferred_contact_method} />
          )}
        </Section>

        <Section title="Home" onEdit={() => onEdit("home")}>
          <Row label="Address" value={fullAddr} />
          {home.address_confirmed && <Row label="Confirmed" value="Yes" />}
        </Section>

        <Section title="Access & pets" onEdit={() => onEdit("access")}>
          {access.parking_notes && <Row label="Parking" value={access.parking_notes} />}
          {access.access_instructions && (
            <Row label="Entry" value={access.access_instructions} />
          )}
          {access.gate_code && <Row label="Gate code" value={access.gate_code} />}
          {access.doorman_notes && <Row label="Doorman" value={access.doorman_notes} />}
          <Row label="Pets" value={access.has_pets ? "Yes" : "No"} />
          {access.has_pets && access.pet_info && (
            <Row label="Pet info" value={access.pet_info} />
          )}
          {access.pet_friendly_required && (
            <Row label="Pet-friendly" value="Required" />
          )}
        </Section>

        <Section title="Cleaning preferences" onEdit={() => onEdit("preferences")}>
          {prefs.extra_attention_notes && (
            <Row label="Extra attention" value={prefs.extra_attention_notes} />
          )}
          {prefs.avoid_notes && <Row label="Avoid" value={prefs.avoid_notes} />}
          {prefs.product_preferences && (
            <Row label="Products" value={prefs.product_preferences} />
          )}
          {prefs.allergy_notes && <Row label="Allergies" value={prefs.allergy_notes} />}
        </Section>

        <div className="flex items-start gap-2 rounded-2xl bg-gradient-aero-soft border border-aero p-4 text-sm">
          <CheckCircle2 className="h-5 w-5 text-aero-trust shrink-0 mt-0.5" />
          <p className="text-foreground/80">
            Your profile is saved. You&apos;ll be able to book a cleaning next, and we&apos;ll prefill
            everything for you.
          </p>
        </div>
      </FlowCard>

      <FlowNav
        onBack={onBack}
        onNext={onConfirm}
        nextLabel="Finish setup"
        loading={saving}
      />
    </div>
  );
}
