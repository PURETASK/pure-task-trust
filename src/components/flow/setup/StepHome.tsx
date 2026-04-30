import {
  FlowCard,
  FlowProgress,
  FlowField,
  FlowInput,
  FlowNav,
} from "@/components/flow";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useMemo } from "react";
import { MapPin } from "lucide-react";
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

export function StepHome({ step, total, data, saving, onChange, onBack, onNext }: Props) {
  const addressFilled = !!(
    data.line1.trim() &&
    data.city.trim() &&
    data.state.trim() &&
    data.postal_code.trim()
  );
  const valid = addressFilled && !!data.address_confirmed;

  const mapQuery = useMemo(() => {
    if (!addressFilled) return null;
    const q = [data.line1, data.city, data.state, data.postal_code]
      .filter(Boolean)
      .join(", ");
    return encodeURIComponent(q);
  }, [addressFilled, data.line1, data.city, data.state, data.postal_code]);

  return (
    <div className="space-y-6">
      <FlowProgress current={step} total={total} />
      <FlowCard
        title="Where's your home?"
        description="We use this to match nearby cleaners and price your visit accurately."
      >
        <FlowField label="Street address">
          <FlowInput
            value={data.line1}
            onChange={(e) => onChange({ line1: e.target.value, address_confirmed: false })}
            autoComplete="address-line1"
            placeholder="123 Main Street"
          />
        </FlowField>

        <div className="grid sm:grid-cols-2 gap-5">
          <FlowField label="Apartment / Unit" optional>
            <FlowInput
              value={data.line2 ?? ""}
              onChange={(e) => onChange({ line2: e.target.value, address_confirmed: false })}
              autoComplete="address-line2"
              placeholder="Apt 4B"
            />
          </FlowField>
          <FlowField label="City">
            <FlowInput
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value, address_confirmed: false })}
              autoComplete="address-level2"
              placeholder="San Francisco"
            />
          </FlowField>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <FlowField label="State">
            <FlowInput
              value={data.state}
              onChange={(e) => onChange({ state: e.target.value.toUpperCase(), address_confirmed: false })}
              autoComplete="address-level1"
              placeholder="CA"
              maxLength={2}
            />
          </FlowField>
          <FlowField label="ZIP">
            <FlowInput
              value={data.postal_code}
              onChange={(e) => onChange({ postal_code: e.target.value, address_confirmed: false })}
              autoComplete="postal-code"
              placeholder="94110"
              inputMode="numeric"
            />
          </FlowField>
        </div>

        {addressFilled && mapQuery && (
          <FlowField label="Confirm location on map">
            <div className="rounded-2xl overflow-hidden border border-aero bg-aero-bg/40">
              <iframe
                title="Address preview map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=&layer=mapnik&marker=&q=${mapQuery}`}
                className="w-full h-56 sm:h-64"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-aero-soft border-t border-aero">
                <MapPin className="h-3.5 w-3.5 text-aero-trust" />
                {[data.line1, data.city, data.state, data.postal_code].filter(Boolean).join(", ")}
              </div>
            </div>

            <label
              htmlFor="confirm-address"
              className="mt-4 flex items-start gap-3 rounded-2xl border border-aero bg-aero-bg/40 p-3 cursor-pointer hover:bg-aero-bg/60 transition"
            >
              <Checkbox
                id="confirm-address"
                checked={!!data.address_confirmed}
                onCheckedChange={(v) => onChange({ address_confirmed: v === true })}
                className="mt-0.5"
              />
              <div>
                <div className="text-sm font-medium">This is the correct address</div>
                <div className="text-xs text-aero-soft mt-0.5">
                  Confirm the pin matches your home so cleaners arrive at the right place.
                </div>
              </div>
            </label>
          </FlowField>
        )}
      </FlowCard>

      <FlowNav onBack={onBack} onNext={onNext} nextDisabled={!valid} loading={saving} />
    </div>
  );
}
