import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Home, Building, Shield, AlertCircle, Zap, Wallet, CreditCard,
  Users, Heart, RotateCcw, ExternalLink, Loader2, Check, CalendarOff,
  ArrowLeft, ChevronRight,
} from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useBooking, CleaningType } from "@/hooks/useBooking";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { useCleaners, useCleaner } from "@/hooks/useCleaners";
import { useFavorites } from "@/hooks/useFavorites";
import { useClientJobs } from "@/hooks/useJob";
import { Address, useAddresses } from "@/hooks/useAddresses";
import { DateTimePicker } from "@/components/booking/DateTimePicker";
import { AddressSelector } from "@/components/booking/AddressSelector";
import { BookingStepper, StepDef } from "@/components/booking/BookingStepper";
import { BookingSummary, SummaryLine } from "@/components/booking/BookingSummary";
import { HoursSelector } from "@/components/booking/HoursSelector";
import { ServiceTypeCard } from "@/components/booking/ServiceTypeCard";
import { AddOnPill } from "@/components/booking/AddOnPill";
import { BookingCleanerCard } from "@/components/booking/BookingCleanerCard";
import { PaymentMethodCard } from "@/components/booking/PaymentMethodCard";
import { setHours as setDateHours, setMinutes as setDateMinutes, getDay, format } from "date-fns";
import {
  isSameDayBooking,
  isCleaningTypeAllowedSameDay,
  calculateRushFee,
  validateSameDayBooking,
} from "@/lib/same-day-booking";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SERVICE_CHARGE_PCT = 0.15;

const STEPS: StepDef[] = [
  { label: "Service", palette: "blue" },
  { label: "When & Where", palette: "green" },
  { label: "Cleaner", palette: "amber" },
  { label: "Review & Pay", palette: "purple" },
];

const STEP_PALETTE_VAR = ["pt-blue", "pt-green", "pt-amber", "pt-purple"] as const;

const cleaningTypes = [
  { id: "basic" as CleaningType, name: "Standard Cleaning", description: "Regular maintenance for a tidy home", baseCredits: 35, icon: Home, estimate: "$35–140" },
  { id: "deep" as CleaningType, name: "Deep Cleaning", description: "Thorough cleaning, hard-to-reach areas", baseCredits: 55, icon: Sparkles, estimate: "$55–220" },
  { id: "move_out" as CleaningType, name: "Move-Out Cleaning", description: "Complete end-of-lease cleaning", baseCredits: 75, icon: Building, estimate: "$75–300" },
];

const addOns = [
  { id: "fridge", name: "Inside Fridge", credits: 15, icon: "🧊" },
  { id: "oven", name: "Inside Oven", credits: 20, icon: "🔥" },
  { id: "windows", name: "Interior Windows", credits: 25, icon: "🪟" },
  { id: "laundry", name: "Laundry (wash & fold)", credits: 20, icon: "👕" },
  { id: "pet_hair", name: "Pet Hair Treatment", credits: 15, icon: "🐾" },
  { id: "supplies", name: "Cleaning Supplies", credits: 10, icon: "🧹" },
];

export default function Book() {
  const [searchParams] = useSearchParams();
  const preselectedCleanerId = searchParams.get("cleaner");

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<CleaningType | null>(null);
  const [hours, setHours] = useState(3);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>();
  const [selectedCleanerId, setSelectedCleanerId] = useState<string | null>(preselectedCleanerId);
  const [cleanerTab, setCleanerTab] = useState<string>("all");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"credits" | "card">("credits");
  const [isDirectPaying, setIsDirectPaying] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { createBooking, isCreating } = useBooking();
  const { account, isLoadingAccount } = useWallet();
  const { data: allCleaners, isLoading: cleanersLoading } = useCleaners({ onlyAvailable: true });
  const { data: favorites } = useFavorites();
  const { data: pastJobs } = useClientJobs();
  const { data: selectedCleaner } = useCleaner(selectedCleanerId || "");
  const { data: savedAddresses } = useAddresses();

  const { data: availabilityBlocks } = useQuery({
    queryKey: ["cleaner-availability-blocks", selectedCleanerId],
    queryFn: async () => {
      if (!selectedCleanerId) return [];
      const { data } = await supabase
        .from("availability_blocks")
        .select("day_of_week, start_time, end_time, is_active")
        .eq("cleaner_id", selectedCleanerId)
        .eq("is_active", true);
      return data || [];
    },
    enabled: !!selectedCleanerId,
  });

  useEffect(() => {
    if (savedAddresses?.length && !selectedAddress) {
      setSelectedAddress(savedAddresses.find((a) => a.is_default) || savedAddresses[0]);
    }
  }, [savedAddresses, selectedAddress]);

  // ── Pricing math ──
  const selectedCleaningType = cleaningTypes.find((t) => t.id === selectedType);
  const addOnCredits = selectedAddOns.reduce(
    (sum, id) => sum + (addOns.find((a) => a.id === id)?.credits || 0),
    0,
  );
  const rushFee = calculateRushFee(selectedDate);
  const isSameDay = selectedDate ? isSameDayBooking(selectedDate) : false;
  const baseCredits = selectedCleaningType ? selectedCleaningType.baseCredits * hours + addOnCredits : 0;
  const totalCredits = baseCredits + rushFee;
  const availableCredits = (account?.current_balance || 0) - (account?.held_balance || 0);
  const hasEnoughCredits = availableCredits >= totalCredits;
  const serviceCharge = Math.round(totalCredits * SERVICE_CHARGE_PCT);
  const directPayTotal = totalCredits + serviceCharge;

  const isDateBlockedByCleaner = useMemo(() => {
    if (!selectedDate || !selectedCleanerId || !availabilityBlocks?.length) return false;
    const dow = getDay(selectedDate);
    return !availabilityBlocks.some((b) => b.day_of_week === dow);
  }, [selectedDate, selectedCleanerId, availabilityBlocks]);

  const isCleaningTypeAllowed = !isSameDay || !selectedType || isCleaningTypeAllowedSameDay(selectedType);

  const getScheduledDateTime = () => {
    if (!selectedDate || !selectedTime) return undefined;
    const [h, m] = selectedTime.split(":");
    return setDateMinutes(setDateHours(selectedDate, parseInt(h)), parseInt(m)).toISOString();
  };

  const bookAgainCleaners = useMemo(() => {
    if (!pastJobs?.length) return [];
    const seen = new Set<string>();
    return pastJobs
      .filter((j) => j.status === "completed" && j.cleaner_id && j.cleaner)
      .filter((j) => {
        if (seen.has(j.cleaner_id!)) return false;
        seen.add(j.cleaner_id!);
        return true;
      })
      .slice(0, 10)
      .map((j) => ({
        id: j.cleaner_id!,
        name: `${j.cleaner?.first_name || ""} ${j.cleaner?.last_name || ""}`.trim() || "Cleaner",
        rating: j.cleaner?.avg_rating ?? null,
        lastBooking: j.scheduled_start_at || j.created_at,
      }));
  }, [pastJobs]);

  const favCleanerIds = new Set(favorites?.map((f) => f.cleaner_id) || []);

  const toggleAddOn = (id: string) =>
    setSelectedAddOns((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  // ── Validation per step ──
  const canContinue = (() => {
    if (step === 1) return !!selectedType && hours >= 1;
    if (step === 2) return !!selectedAddress && !!selectedDate && !!selectedTime && isCleaningTypeAllowed;
    if (step === 3) return !!selectedCleanerId && !isDateBlockedByCleaner;
    return true;
  })();

  // ── Confirm handlers ──
  const handleConfirmCredits = async () => {
    if (!selectedType || !user) return;
    if (!hasEnoughCredits) {
      toast({ title: "Insufficient credits", variant: "destructive" });
      return;
    }
    try {
      await createBooking({
        cleaningType: selectedType,
        hours,
        addOns: selectedAddOns,
        totalCredits,
        cleanerId: selectedCleanerId || undefined,
        scheduledDate: getScheduledDateTime(),
        address: selectedAddress ? `${selectedAddress.line1}, ${selectedAddress.city}` : undefined,
        notes: specialInstructions || undefined,
      });
    } catch (e: any) {
      toast({ title: "Booking failed", description: e?.message, variant: "destructive" });
    }
  };

  const handlePayDirectly = async () => {
    if (!selectedType || !user) return;
    setIsDirectPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-direct-payment", {
        body: {
          baseCredits: totalCredits,
          hours,
          cleaningType: selectedType,
          addOns: selectedAddOns,
          rushFee,
          cleanerId: selectedCleanerId || null,
          scheduledDate: getScheduledDateTime(),
          address: selectedAddress ? `${selectedAddress.line1}, ${selectedAddress.city}` : null,
          notes: specialInstructions || null,
        },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Payment failed", description: e.message, variant: "destructive" });
    } finally {
      setIsDirectPaying(false);
    }
  };

  // ── Summary lines for sticky panel ──
  const summaryLines: SummaryLine[] = [
    { label: "Service", value: selectedCleaningType?.name || "—" },
    { label: "Duration", value: `${hours}h` },
    { label: "Property", value: selectedAddress ? selectedAddress.line1 : "—" },
    {
      label: "When",
      value: selectedDate && selectedTime ? `${format(selectedDate, "MMM d")} · ${selectedTime}` : "—",
    },
    {
      label: "Cleaner",
      value: selectedCleaner?.name || (selectedCleanerId ? "—" : "Auto-Match"),
    },
    ...(selectedAddOns.length > 0
      ? [{
          label: "Extras",
          value: `${selectedAddOns.length} add-on${selectedAddOns.length > 1 ? "s" : ""}`,
        }]
      : []),
  ];

  const advance = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const ctaLabel = step === 4 ? "Confirm Booking" : "Continue";
  const ctaDisabled = step === 4
    ? (paymentMethod === "credits" ? !hasEnoughCredits || isCreating : isDirectPaying)
    : !canContinue;
  const ctaLoading = step === 4 && (isCreating || isDirectPaying);
  const onCta = () => {
    if (step < 4) advance();
    else if (paymentMethod === "credits") handleConfirmCredits();
    else handlePayDirectly();
  };

  return (
    <main className="flex-1 pb-32 lg:pb-12">
      <Helmet><title>Book a Cleaning | PureTask</title></Helmet>

      <div className="container px-3 sm:px-4 lg:px-6 max-w-6xl py-6 sm:py-10">
        {/* ── Header ── */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black mb-1">Book a Cleaning</h1>
          <p className="text-sm text-muted-foreground">A few quick steps and you're done.</p>
        </div>

        {/* ── Stepper ── */}
        <div className="mb-8">
          <BookingStepper steps={STEPS} current={step} onStepClick={(n) => setStep(n)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ── Main column ── */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* STEP 1: SERVICE */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                  <SectionShell paletteVar="pt-blue" title="What type of cleaning?" subtitle="Pick a service and how long you'll need.">
                    <div className="space-y-3">
                      {cleaningTypes.map((t) => (
                        <ServiceTypeCard
                          key={t.id}
                          id={t.id}
                          name={t.name}
                          description={t.description}
                          estimate={t.estimate}
                          icon={t.icon}
                          selected={selectedType === t.id}
                          onSelect={() => setSelectedType(t.id)}
                          paletteVar="pt-blue"
                        />
                      ))}
                    </div>

                    <div className="mt-6">
                      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "hsl(var(--pt-blue-deep))" }}>
                        How many hours?
                      </p>
                      <HoursSelector value={hours} onChange={setHours} paletteVar="pt-blue" />
                    </div>

                    {selectedType && (
                      <div className="mt-6">
                        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "hsl(var(--pt-blue-deep))" }}>
                          Optional add-ons
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {addOns.map((a) => (
                            <AddOnPill
                              key={a.id}
                              name={a.name}
                              icon={a.icon}
                              credits={a.credits}
                              selected={selectedAddOns.includes(a.id)}
                              onToggle={() => toggleAddOn(a.id)}
                              paletteVar="pt-blue"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </SectionShell>
                </motion.div>
              )}

              {/* STEP 2: WHEN & WHERE */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                  <SectionShell paletteVar="pt-green" title="When & where?" subtitle="Pick the property, date and time.">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "hsl(var(--pt-green-deep))" }}>
                        Property
                      </p>
                      <AddressSelector selectedAddressId={selectedAddress?.id} onSelect={setSelectedAddress} />
                    </div>

                    <div className="mt-6">
                      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "hsl(var(--pt-green-deep))" }}>
                        Date & Time
                      </p>
                      <DateTimePicker
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        onDateChange={(date) => {
                          setSelectedDate(date);
                          if (date && isSameDayBooking(date) && selectedTime && selectedType) {
                            const { valid } = validateSameDayBooking(date, selectedTime, selectedType);
                            if (!valid) setSelectedTime(undefined);
                          }
                        }}
                        onTimeChange={setSelectedTime}
                      />
                    </div>

                    {isSameDay && rushFee > 0 && (
                      <div
                        className="mt-4 rounded-xl border-2 px-4 py-3 flex items-center gap-2 text-sm font-bold"
                        style={{
                          borderColor: "hsl(var(--pt-amber-deep))",
                          backgroundColor: "hsl(var(--pt-amber)/0.10)",
                          color: "hsl(var(--pt-amber-deep))",
                        }}
                      >
                        <Zap className="h-4 w-4" />
                        Same-day booking — +${rushFee} rush fee added
                      </div>
                    )}

                    {isSameDay && !isCleaningTypeAllowed && (
                      <div className="mt-4 rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-destructive">Move-Out not available same-day</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Please pick a future date.</p>
                        </div>
                      </div>
                    )}
                  </SectionShell>
                </motion.div>
              )}

              {/* STEP 3: CLEANER */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                  <SectionShell paletteVar="pt-amber" title="Choose your cleaner" subtitle="Pick a pro you trust, or let us auto-match.">
                    <Tabs value={cleanerTab} onValueChange={setCleanerTab}>
                      <TabsList
                        className="w-full grid grid-cols-3 h-auto p-1 rounded-2xl border-2 bg-background"
                        style={{ borderColor: "hsl(var(--pt-amber-deep))" }}
                      >
                        <TabsTrigger value="all" className="gap-1.5 rounded-xl text-xs sm:text-sm py-2">
                          <Users className="h-3.5 w-3.5" /> All
                        </TabsTrigger>
                        <TabsTrigger value="favorites" className="gap-1.5 rounded-xl text-xs sm:text-sm py-2">
                          <Heart className="h-3.5 w-3.5" /> Favorites
                        </TabsTrigger>
                        <TabsTrigger value="again" className="gap-1.5 rounded-xl text-xs sm:text-sm py-2">
                          <RotateCcw className="h-3.5 w-3.5" /> Book Again
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="all" className="mt-4 space-y-2">
                        {cleanersLoading ? (
                          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
                        ) : (
                          <>
                            {/* Auto-match */}
                            <button
                              type="button"
                              onClick={() => setSelectedCleanerId(null)}
                              className="w-full text-left rounded-2xl border-2 p-4 flex items-center gap-4 transition-all bg-background hover:shadow-md"
                              style={{
                                borderColor: "hsl(var(--pt-amber-deep))",
                                backgroundColor: !selectedCleanerId ? "hsl(var(--pt-amber)/0.10)" : undefined,
                              }}
                            >
                              <div
                                className="h-11 w-11 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: "hsl(var(--pt-amber)/0.18)", color: "hsl(var(--pt-amber-deep))" }}
                              >
                                <Zap className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-sm">Auto-Match Me</p>
                                <p className="text-xs text-muted-foreground">We'll find the best available cleaner</p>
                              </div>
                              {!selectedCleanerId && (
                                <div
                                  className="h-7 w-7 rounded-full flex items-center justify-center text-white"
                                  style={{ backgroundColor: "hsl(var(--pt-amber-deep))" }}
                                >
                                  <Check className="h-4 w-4" />
                                </div>
                              )}
                            </button>
                            {allCleaners?.map((c) => (
                              <BookingCleanerCard
                                key={c.id}
                                name={c.name}
                                rating={c.avgRating}
                                hourlyRate={c.hourlyRate}
                                jobsCompleted={c.jobsCompleted}
                                reliabilityScore={c.reliabilityScore}
                                tier={c.tier}
                                isFavorite={favCleanerIds.has(c.id)}
                                selected={selectedCleanerId === c.id}
                                onSelect={() => setSelectedCleanerId(c.id)}
                                paletteVar="pt-amber"
                              />
                            ))}
                          </>
                        )}
                      </TabsContent>

                      <TabsContent value="favorites" className="mt-4 space-y-2">
                        {!favorites?.length ? (
                          <EmptyState icon={Heart} title="No favorites yet" subtitle="Heart cleaners to save them here" paletteVar="pt-amber" />
                        ) : (
                          favorites.map((fav) => {
                            if (!fav.cleaner) return null;
                            const c = fav.cleaner;
                            const name = `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Cleaner";
                            return (
                              <BookingCleanerCard
                                key={fav.id}
                                name={name}
                                rating={c.avg_rating}
                                hourlyRate={c.hourly_rate_credits}
                                jobsCompleted={c.jobs_completed}
                                isFavorite
                                selected={selectedCleanerId === c.id}
                                onSelect={() => setSelectedCleanerId(c.id)}
                                paletteVar="pt-amber"
                              />
                            );
                          })
                        )}
                      </TabsContent>

                      <TabsContent value="again" className="mt-4 space-y-2">
                        {!bookAgainCleaners.length ? (
                          <EmptyState icon={RotateCcw} title="No past cleaners" subtitle="Complete a booking to see cleaners here" paletteVar="pt-amber" />
                        ) : (
                          bookAgainCleaners.map((c) => (
                            <BookingCleanerCard
                              key={c.id}
                              name={c.name}
                              rating={c.rating}
                              subtitle={`Last: ${format(new Date(c.lastBooking), "MMM d")}`}
                              selected={selectedCleanerId === c.id}
                              onSelect={() => setSelectedCleanerId(c.id)}
                              paletteVar="pt-amber"
                            />
                          ))
                        )}
                      </TabsContent>
                    </Tabs>

                    {selectedCleanerId && isDateBlockedByCleaner && selectedDate && (
                      <div className="mt-4 rounded-xl border-2 border-warning/40 bg-warning/10 px-4 py-3 flex items-start gap-2">
                        <CalendarOff className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold">Cleaner unavailable on {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Go back to change the date or pick a different cleaner.</p>
                        </div>
                      </div>
                    )}
                  </SectionShell>
                </motion.div>
              )}

              {/* STEP 4: REVIEW & PAY */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                  <SectionShell paletteVar="pt-purple" title="Review & confirm" subtitle="You only pay for time actually worked. Unused credits are returned automatically.">
                    {/* Receipt */}
                    <div
                      className="rounded-2xl border-2 p-5 bg-background"
                      style={{ borderColor: "hsl(var(--pt-purple-deep))", backgroundColor: "hsl(var(--pt-purple)/0.04)" }}
                    >
                      <ReceiptRow label="Service" value={selectedCleaningType?.name || "—"} />
                      <ReceiptRow label="Duration" value={`${hours} hours`} />
                      {selectedAddress && <ReceiptRow label="Property" value={`${selectedAddress.line1}, ${selectedAddress.city}`} />}
                      {selectedDate && selectedTime && (
                        <ReceiptRow
                          label="Date & Time"
                          value={`${format(selectedDate, "EEE, MMM d")} at ${selectedTime}`}
                          badge={isSameDay ? "Today" : undefined}
                        />
                      )}
                      <ReceiptRow label="Cleaner" value={selectedCleaner?.name || "Auto-Match"} />
                      {selectedAddOns.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border space-y-1">
                          {selectedAddOns.map((id) => {
                            const a = addOns.find((x) => x.id === id);
                            return a ? <ReceiptRow key={id} label={a.name} value={`+$${a.credits}`} small /> : null;
                          })}
                        </div>
                      )}
                      {isSameDay && rushFee > 0 && (
                        <ReceiptRow label="Same-Day Rush" value={`+$${rushFee}`} highlight />
                      )}
                      <div className="mt-4 pt-4 border-t-2 border-dashed border-border flex items-center justify-between">
                        <span className="font-bold text-base">Estimated Total</span>
                        <span className="text-3xl font-black" style={{ color: "hsl(var(--pt-purple-deep))" }}>
                          ${totalCredits}
                        </span>
                      </div>
                    </div>

                    {/* Special instructions */}
                    <div className="mt-5">
                      <label className="text-xs font-black uppercase tracking-widest mb-2 block" style={{ color: "hsl(var(--pt-purple-deep))" }}>
                        Special instructions
                      </label>
                      <Textarea
                        placeholder="Any notes for your cleaner? (alarm code, pets, parking…)"
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        className="min-h-[80px] border-2 rounded-xl"
                        style={{ borderColor: "hsl(var(--pt-purple-deep))" }}
                      />
                    </div>

                    {/* Trust */}
                    <div
                      className="mt-5 flex items-center gap-2 text-xs font-medium rounded-xl border-2 px-3 py-2.5"
                      style={{
                        borderColor: "hsl(var(--success)/0.5)",
                        backgroundColor: "hsl(var(--success)/0.06)",
                        color: "hsl(var(--success))",
                      }}
                    >
                      <Shield className="h-4 w-4 flex-shrink-0" />
                      <span>Credits held in escrow — released only after you approve the work.</span>
                    </div>

                    {/* Payment method */}
                    <div className="mt-5">
                      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "hsl(var(--pt-purple-deep))" }}>
                        Payment method
                      </p>
                      <div className="space-y-3">
                        <PaymentMethodCard
                          icon={Wallet}
                          title="Pay with Credits"
                          subtitle={
                            !isLoadingAccount && (
                              <span>
                                Balance: <span className={hasEnoughCredits ? "font-bold" : "text-destructive font-bold"}>${availableCredits}</span>
                                {!hasEnoughCredits && (
                                  <Button variant="link" className="p-0 h-auto text-xs ml-1" asChild>
                                    <Link to="/wallet">Top up →</Link>
                                  </Button>
                                )}
                              </span>
                            )
                          }
                          amount={totalCredits}
                          selected={paymentMethod === "credits"}
                          onSelect={() => setPaymentMethod("credits")}
                          disabled={!hasEnoughCredits}
                          paletteVar="pt-green"
                          badge="No fee"
                        />
                        <PaymentMethodCard
                          icon={CreditCard}
                          title="Pay with Card"
                          subtitle={`Includes 15% service charge ($${serviceCharge})`}
                          amount={directPayTotal}
                          selected={paymentMethod === "card"}
                          onSelect={() => setPaymentMethod("card")}
                          paletteVar="pt-purple"
                        />
                      </div>
                      {paymentMethod === "card" && (
                        <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> You'll be redirected to Stripe Checkout.
                        </p>
                      )}
                    </div>
                  </SectionShell>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile back/continue (visible only when summary bar is collapsed bottom on mobile) */}
            <div className="flex gap-3 mt-6 lg:hidden">
              {step > 1 && (
                <Button variant="outline" size="lg" onClick={back} className="border-2">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}
            </div>

            {/* Desktop back link below content */}
            {step > 1 && (
              <div className="hidden lg:block mt-6">
                <Button variant="ghost" size="sm" onClick={back}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to {STEPS[step - 2].label}
                </Button>
              </div>
            )}
          </div>

          {/* ── Sticky summary panel ── */}
          <BookingSummary
            lines={summaryLines}
            subtotal={baseCredits}
            rushFee={rushFee}
            total={paymentMethod === "card" && step === 4 ? directPayTotal : totalCredits}
            walletBalance={paymentMethod === "credits" ? availableCredits : undefined}
            ctaLabel={ctaLabel}
            onCta={onCta}
            ctaDisabled={ctaDisabled}
            ctaLoading={ctaLoading}
          />
        </div>
      </div>
    </main>
  );
}

// ── Helpers ────────────────────────────────────────────────────────

function SectionShell({
  paletteVar, title, subtitle, children,
}: { paletteVar: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-2xl border-2 p-5 sm:p-6 bg-background"
      style={{
        borderColor: `hsl(var(--${paletteVar}-deep))`,
        backgroundColor: `hsl(var(--${paletteVar})/0.04)`,
      }}
    >
      <h2 className="text-xl sm:text-2xl font-black mb-1" style={{ color: `hsl(var(--${paletteVar}-deep))` }}>
        {title}
      </h2>
      {subtitle && <p className="text-sm text-muted-foreground mb-5">{subtitle}</p>}
      {children}
    </section>
  );
}

function ReceiptRow({
  label, value, small, highlight, badge,
}: { label: string; value: string; small?: boolean; highlight?: boolean; badge?: string }) {
  return (
    <div className={`flex items-start justify-between gap-3 py-1 ${small ? "text-xs" : "text-sm"}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right font-semibold ${highlight ? "text-warning" : ""}`}>
        {value}
        {badge && (
          <span
            className="ml-2 text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "hsl(var(--pt-amber)/0.18)", color: "hsl(var(--pt-amber-deep))" }}
          >
            {badge}
          </span>
        )}
      </span>
    </div>
  );
}

function EmptyState({
  icon: Icon, title, subtitle, paletteVar,
}: { icon: any; title: string; subtitle: string; paletteVar: string }) {
  return (
    <div
      className="rounded-2xl border-2 border-dashed p-8 text-center bg-background"
      style={{ borderColor: `hsl(var(--${paletteVar}-deep)/0.5)` }}
    >
      <Icon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
      <p className="text-sm font-bold">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}
