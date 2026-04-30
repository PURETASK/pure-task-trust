import { useState, useEffect, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format, setHours as setDateHours, setMinutes as setDateMinutes, getDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking, type CleaningType } from "@/hooks/useBooking";
import { useWallet } from "@/hooks/useWallet";
import { useCleaners, useCleaner } from "@/hooks/useCleaners";
import { useAddresses, type Address } from "@/hooks/useAddresses";
import { useClientProfile, buildDefaultNotes } from "@/hooks/useClientProfile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { usePlatformConfig } from "@/hooks/usePlatformConfig";
import { useFunnel } from "@/hooks/useFunnel";

import { FlowShell } from "@/components/flow/FlowShell";
import { FlowProgress } from "@/components/flow/FlowProgress";
import { FlowCard } from "@/components/flow/FlowCard";
import { FlowNav } from "@/components/flow/FlowNav";
import { FlowSummary, SummaryRow } from "@/components/flow/FlowSummary";
import { AddressSelector } from "@/components/booking/AddressSelector";
import { FlowField } from "@/components/flow/FlowField";

import { StepService, SERVICE_OPTIONS } from "@/components/flow/booking/StepService";
import { StepDateTime } from "@/components/flow/booking/StepDateTime";
import { StepScope, ADD_ONS } from "@/components/flow/booking/StepScope";
import { StepCleaner } from "@/components/flow/booking/StepCleaner";
import { StepReview } from "@/components/flow/booking/StepReview";
import { StepPayment } from "@/components/flow/booking/StepPayment";

import {
  isSameDayBooking,
  isCleaningTypeAllowedSameDay,
  calculateRushFee,
} from "@/lib/same-day-booking";

const STEPS = [
  { id: 1, label: "Service" },
  { id: 2, label: "When & Where" },
  { id: 3, label: "Scope" },
  { id: 4, label: "Cleaner" },
  { id: 5, label: "Review" },
  { id: 6, label: "Payment" },
] as const;

const TOTAL_STEPS = STEPS.length;

const BOOKING_FUNNEL_STEPS = [
  "service",
  "datetime",
  "scope",
  "cleaner",
  "review",
  "payment",
] as const;

export default function Book() {
  const [searchParams] = useSearchParams();
  const preselectedCleanerId = searchParams.get("cleaner");

  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState<CleaningType | null>(null);
  const [hours, setHours] = useState(3);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | undefined>();
  const [flexible, setFlexible] = useState(false);
  const [address, setAddress] = useState<Address | undefined>();
  const [cleanerId, setCleanerId] = useState<string | null>(preselectedCleanerId);
  const [notes, setNotes] = useState("");
  const [notesAutofilled, setNotesAutofilled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"credits" | "card">("credits");
  const [isDirectPaying, setIsDirectPaying] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { createBooking, isCreating } = useBooking();
  const { account, isLoadingAccount } = useWallet();
  const { rushFeeCredits, directChargeFeePct } = usePlatformConfig();
  const funnel = useFunnel("booking", BOOKING_FUNNEL_STEPS);
  const lastTrackedStep = useRef<number>(0);
  const { data: allCleaners, isLoading: cleanersLoading } = useCleaners({ onlyAvailable: true });
  const { data: selectedCleaner } = useCleaner(cleanerId || "");
  const { data: savedAddresses } = useAddresses();
  const { data: clientProfile } = useClientProfile();

  // Auto-pick default address from saved profile
  useEffect(() => {
    if (savedAddresses?.length && !address) {
      setAddress(savedAddresses.find((a) => a.is_default) || savedAddresses[0]);
    }
  }, [savedAddresses, address]);

  // Pre-fill notes once with saved profile context (parking, pets, allergies, priorities…)
  useEffect(() => {
    if (notesAutofilled || notes || !clientProfile) return;
    const seeded = buildDefaultNotes(clientProfile);
    if (seeded) {
      setNotes(seeded);
      setNotesAutofilled(true);
    }
  }, [clientProfile, notes, notesAutofilled]);

  // Cleaner availability blocks
  const { data: availabilityBlocks } = useQuery({
    queryKey: ["cleaner-availability-blocks", cleanerId],
    queryFn: async () => {
      if (!cleanerId) return [];
      const { data } = await supabase
        .from("availability_blocks")
        .select("day_of_week, start_time, end_time, is_active")
        .eq("cleaner_id", cleanerId)
        .eq("is_active", true);
      return data || [];
    },
    enabled: !!cleanerId,
  });

  // ── Pricing ──
  const serviceOption = SERVICE_OPTIONS.find((s) => s.cleaningType === serviceType);
  const baseRate = serviceType === "deep" ? 55 : serviceType === "move_out" ? 75 : 35;
  const cleanerRate = selectedCleaner?.hourlyRate ?? baseRate;
  const addOnCredits = selectedAddOns.reduce(
    (sum, id) => sum + (ADD_ONS.find((a) => a.id === id)?.credits || 0),
    0,
  );
  const rushFee = calculateRushFee(date, rushFeeCredits);
  const sameDay = date ? isSameDayBooking(date) : false;
  const subtotal = (serviceType ? cleanerRate * hours : 0) + addOnCredits;
  const totalCredits = subtotal + rushFee;
  const availableCredits = (account?.current_balance || 0) - (account?.held_balance || 0);
  const hasEnoughCredits = availableCredits >= totalCredits;
  const serviceCharge = Math.round(totalCredits * (directChargeFeePct / 100));
  const directPayTotal = totalCredits + serviceCharge;

  const isDateBlockedByCleaner = useMemo(() => {
    if (!date || !cleanerId || !availabilityBlocks?.length) return false;
    const dow = getDay(date);
    return !availabilityBlocks.some((b) => b.day_of_week === dow);
  }, [date, cleanerId, availabilityBlocks]);

  const isCleaningTypeAllowed = !sameDay || !serviceType || isCleaningTypeAllowedSameDay(serviceType);

  const getScheduledDateTime = () => {
    if (!date || !time) return undefined;
    const [h, m] = time.split(":");
    return setDateMinutes(setDateHours(date, parseInt(h)), parseInt(m)).toISOString();
  };

  // ── Validation per step ──
  const canContinue = (() => {
    if (step === 1) return !!serviceType;
    if (step === 2) return !!address && !!date && !!time && isCleaningTypeAllowed;
    if (step === 3) return hours >= 1;
    if (step === 4) return !!cleanerId && !isDateBlockedByCleaner;
    if (step === 5) return true;
    if (step === 6) return paymentMethod === "credits" ? hasEnoughCredits : true;
    return true;
  })();

  // ── Confirm handlers ──
  const handleConfirmCredits = async () => {
    if (!serviceType || !user || !cleanerId) return;
    if (!hasEnoughCredits) {
      funnel.trackEvent("funnel.validation_error", {
        step: "payment",
        reason: "insufficient_credits",
        needed: totalCredits,
        available: availableCredits,
      });
      toast({ title: "Insufficient credits", variant: "destructive" });
      return;
    }
    try {
      // Trigger recurring upsell on the confirmation page
      sessionStorage.setItem("puretask:show-recurring-upsell", "1");
      await createBooking({
        cleaningType: serviceType,
        hours,
        addOns: selectedAddOns,
        totalCredits,
        cleanerId,
        scheduledDate: getScheduledDateTime(),
        address: address ? `${address.line1}, ${address.city}` : undefined,
        notes: notes || undefined,
      });
      funnel.trackComplete({
        payment_method: "credits",
        total_credits: totalCredits,
        cleaning_type: serviceType,
        cleaner_id: cleanerId,
        same_day: sameDay,
        addons_count: selectedAddOns.length,
      });
      // useBooking handles navigation to /booking/:id
    } catch (e: any) {
      sessionStorage.removeItem("puretask:show-recurring-upsell");
      funnel.trackEvent("funnel.error", {
        step: "payment",
        reason: "create_booking_failed",
        message: e?.message,
      });
      toast({ title: "Booking failed", description: e?.message, variant: "destructive" });
    }
  };

  const handlePayDirectly = async () => {
    if (!serviceType || !user) return;
    setIsDirectPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-direct-payment", {
        body: {
          baseCredits: totalCredits,
          hours,
          cleaningType: serviceType,
          addOns: selectedAddOns,
          rushFee,
          cleanerId: cleanerId || null,
          scheduledDate: getScheduledDateTime(),
          address: address ? `${address.line1}, ${address.city}` : null,
          notes: notes || null,
        },
      });
      if (error) throw error;
      if (data?.url) {
        funnel.trackComplete({
          payment_method: "card",
          total_credits: totalCredits,
          service_charge: serviceCharge,
          cleaning_type: serviceType,
          cleaner_id: cleanerId,
        });
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      funnel.trackEvent("funnel.error", {
        step: "payment",
        reason: "direct_payment_failed",
        message: e.message,
      });
      toast({ title: "Payment failed", description: e.message, variant: "destructive" });
    } finally {
      setIsDirectPaying(false);
    }
  };

  const onNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else if (paymentMethod === "credits") handleConfirmCredits();
    else handlePayDirectly();
  };

  const onBack = step > 1 ? () => setStep((s) => s - 1) : undefined;
  const ctaLabel = step === TOTAL_STEPS ? "Confirm Booking" : "Continue";
  const ctaLoading = step === TOTAL_STEPS && (isCreating || isDirectPaying);

  const toggleAddOn = (id: string) =>
    setSelectedAddOns((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const stepTitles: Record<number, { title: string; description: string }> = {
    1: { title: "What kind of clean?", description: "Pick the service that fits your space." },
    2: { title: "When & where?", description: "Choose the property, date and time." },
    3: { title: "Tell us the scope", description: "How long and any extras you'd like." },
    4: { title: "Pick your cleaner", description: "Hand-picked top matches based on your booking." },
    5: { title: "Review before you confirm", description: "Make sure everything looks right." },
    6: { title: "Payment & escrow", description: "Held securely until the job is approved." },
  };

  // ── Sticky summary ──
  const summary = (
    <FlowSummary
      title="Your booking"
      footer={
        <SummaryRow
          label="Estimated total"
          value={
            <span className="text-aero-trust text-lg">
              ${paymentMethod === "card" && step === TOTAL_STEPS ? directPayTotal : totalCredits}
            </span>
          }
          emphasis
        />
      }
    >
      <SummaryRow label="Service" value={serviceOption?.name || "—"} />
      <SummaryRow label="Duration" value={`${hours} hrs`} />
      <SummaryRow
        label="When"
        value={date && time ? `${format(date, "MMM d")} · ${time}` : "—"}
      />
      <SummaryRow label="Property" value={address?.line1 || "—"} />
      <SummaryRow label="Cleaner" value={selectedCleaner?.name || "—"} />
      {selectedAddOns.length > 0 && (
        <SummaryRow label="Add-ons" value={`${selectedAddOns.length} selected`} />
      )}
      {rushFee > 0 && <SummaryRow label="Rush fee" value={`+$${rushFee}`} />}
      {paymentMethod === "card" && step === TOTAL_STEPS && (
        <SummaryRow label="Service charge" value={`+$${serviceCharge}`} />
      )}
    </FlowSummary>
  );

  return (
    <FlowShell summary={step >= 2 ? summary : undefined}>
      <Helmet><title>Book a Cleaning | PureTask</title></Helmet>

      <FlowProgress
        current={step}
        total={TOTAL_STEPS}
        label={`Step ${step} of ${TOTAL_STEPS} · ${STEPS[step - 1].label}`}
        className="mb-5"
      />

      <FlowCard
        title={stepTitles[step].title}
        description={stepTitles[step].description}
      >
        {step === 1 && (
          <StepService value={serviceType} onChange={setServiceType} />
        )}

        {step === 2 && (
          <div className="space-y-6">
            <FlowField label="Property">
              <AddressSelector selectedAddressId={address?.id} onSelect={setAddress} />
            </FlowField>
            <StepDateTime
              date={date}
              time={time}
              onDateChange={setDate}
              onTimeChange={setTime}
              flexible={flexible}
              onFlexibleChange={setFlexible}
            />
            {sameDay && !isCleaningTypeAllowed && (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                Move-Out cleaning is not available same-day. Please pick a future date.
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <StepScope
            hours={hours}
            onHoursChange={setHours}
            selectedAddOns={selectedAddOns}
            onToggleAddOn={toggleAddOn}
          />
        )}

        {step === 4 && (
          <>
            <StepCleaner
              cleaners={allCleaners}
              isLoading={cleanersLoading}
              selectedCleanerId={cleanerId}
              onSelect={setCleanerId}
            />
            {cleanerId && isDateBlockedByCleaner && date && (
              <div className="mt-4 rounded-2xl border border-warning/40 bg-warning/5 p-3 text-sm text-foreground">
                This cleaner isn't available on{" "}
                <strong>{date.toLocaleDateString("en-US", { weekday: "long" })}</strong>.
                Try a different date or pick another cleaner.
              </div>
            )}
          </>
        )}

        {step === 5 && (
          <StepReview
            serviceType={serviceType}
            hours={hours}
            date={date}
            time={time}
            address={address}
            cleaner={selectedCleaner}
            selectedAddOns={selectedAddOns}
            notes={notes}
            onNotesChange={setNotes}
            onEditStep={setStep}
            clientName={clientProfile?.fullName || undefined}
            clientEmail={clientProfile?.email || user?.email || undefined}
            clientPhone={clientProfile?.phone || undefined}
            notesAutofilled={notesAutofilled}
          />
        )}

        {step === 6 && (
          <StepPayment
            paymentMethod={paymentMethod}
            onMethodChange={setPaymentMethod}
            totalCredits={totalCredits}
            serviceCharge={serviceCharge}
            directPayTotal={directPayTotal}
            availableCredits={availableCredits}
            hasEnoughCredits={hasEnoughCredits}
            isLoadingAccount={isLoadingAccount}
          />
        )}

        <FlowNav
          onBack={onBack}
          onNext={onNext}
          nextLabel={ctaLabel}
          nextDisabled={!canContinue}
          loading={ctaLoading}
        />
      </FlowCard>
    </FlowShell>
  );
}
