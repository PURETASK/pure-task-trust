import { format } from "date-fns";
import { Link } from "react-router-dom";
import { FlowField } from "@/components/flow/FlowField";
import { FlowTextarea } from "@/components/flow/FlowInput";
import { Shield, Edit2, MapPin, Calendar, Clock, User, Sparkles, UserCheck, Sparkle } from "lucide-react";
import type { CleanerListing } from "@/hooks/useCleaners";
import type { Address } from "@/hooks/useAddresses";
import type { CleaningType } from "@/hooks/useBooking";
import { ADD_ONS } from "./StepScope";
import { SERVICE_OPTIONS } from "./StepService";

interface StepReviewProps {
  serviceType: CleaningType | null;
  hours: number;
  date: Date | undefined;
  time: string | undefined;
  address: Address | undefined;
  cleaner: CleanerListing | null | undefined;
  selectedAddOns: string[];
  notes: string;
  onNotesChange: (v: string) => void;
  onEditStep: (step: number) => void;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  notesAutofilled?: boolean;
}

function ReviewBlock({
  icon: Icon, label, value, onEdit,
}: { icon: typeof MapPin; label: string; value: React.ReactNode; onEdit: () => void }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-aero last:border-0">
      <div className="h-9 w-9 rounded-xl bg-aero-bg text-aero-trust flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide text-aero-soft font-medium">{label}</p>
        <div className="text-sm font-medium text-foreground mt-0.5">{value}</div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-xs text-aero-trust hover:text-aero-cyan font-medium inline-flex items-center gap-1"
      >
        <Edit2 className="h-3 w-3" /> Edit
      </button>
    </div>
  );
}

export function StepReview({
  serviceType, hours, date, time, address, cleaner, selectedAddOns, notes, onNotesChange, onEditStep,
  clientName, clientEmail, clientPhone, notesAutofilled,
}: StepReviewProps) {
  const service = SERVICE_OPTIONS.find((s) => s.cleaningType === serviceType);
  const hasContact = !!(clientName || clientEmail || clientPhone);

  return (
    <div className="space-y-5">
      {hasContact && (
        <div className="rounded-2xl border border-aero bg-aero-card p-4 flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-aero-bg text-aero-trust flex items-center justify-center flex-shrink-0">
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0 text-sm">
            <p className="text-xs uppercase tracking-wide text-aero-soft font-medium">Booking as</p>
            <p className="font-medium text-foreground mt-0.5 truncate">{clientName || "—"}</p>
            <p className="text-xs text-aero-soft mt-0.5 truncate">
              {[clientEmail, clientPhone].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
          <Link
            to="/account"
            className="text-xs text-aero-trust hover:text-aero-cyan font-medium inline-flex items-center gap-1"
          >
            <Edit2 className="h-3 w-3" /> Edit
          </Link>
        </div>
      )}

      <div className="rounded-2xl border border-aero bg-aero-card overflow-hidden">
        <div className="px-5 py-1">
          <ReviewBlock
            icon={Sparkles}
            label="Service"
            value={`${service?.name || "—"} · ${hours} hrs`}
            onEdit={() => onEditStep(1)}
          />
          <ReviewBlock
            icon={Calendar}
            label="When"
            value={
              date && time
                ? `${format(date, "EEE, MMM d")} · ${time}`
                : "Not selected"
            }
            onEdit={() => onEditStep(2)}
          />
          <ReviewBlock
            icon={MapPin}
            label="Where"
            value={address ? `${address.line1}, ${address.city}` : "Not selected"}
            onEdit={() => onEditStep(2)}
          />
          <ReviewBlock
            icon={User}
            label="Cleaner"
            value={cleaner?.name || "Not selected"}
            onEdit={() => onEditStep(4)}
          />
          {selectedAddOns.length > 0 && (
            <ReviewBlock
              icon={Clock}
              label="Add-ons"
              value={
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedAddOns.map((id) => {
                    const a = ADD_ONS.find((x) => x.id === id);
                    return a ? (
                      <span
                        key={id}
                        className="text-xs px-2 py-0.5 rounded-full bg-aero-bg text-foreground border border-aero"
                      >
                        {a.icon} {a.name}
                      </span>
                    ) : null;
                  })}
                </div>
              }
              onEdit={() => onEditStep(3)}
            />
          )}
        </div>
      </div>

      <FlowField
        label="Notes for your cleaner"
        helper={notesAutofilled ? "Pre-filled from your saved profile — edit anything you'd like to change for this visit." : undefined}
        optional
      >
        <FlowTextarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Anything specific to mention? Alarm code, pets, parking, areas to focus on…"
          rows={notesAutofilled ? 6 : 3}
        />
      </FlowField>

      <div className="flex items-start gap-3 rounded-2xl border border-aero-cyan/30 bg-gradient-to-br from-aero-bg to-transparent p-4">
        <Shield className="h-5 w-5 text-aero-trust flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground">Held in escrow until you approve</p>
          <p className="text-xs text-aero-soft mt-1 leading-relaxed">
            Your credits are held securely. We only release them after the job is complete and you approve.
            Final charge reflects actual hours worked — unused credits are returned automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
