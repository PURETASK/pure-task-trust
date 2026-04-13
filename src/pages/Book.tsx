import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Sparkles, Home, Building, Clock, Plus, Minus, Shield, ArrowRight, ArrowLeft,
  Loader2, AlertCircle, Zap, Calendar, MapPin, CreditCard, ExternalLink, Wallet,
  Star, Users, Heart, RotateCcw, User, Search, CalendarOff
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useBooking, CleaningType } from "@/hooks/useBooking";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { useCleaners, useCleaner, CleanerListing } from "@/hooks/useCleaners";
import { useFavorites } from "@/hooks/useFavorites";
import { DateTimePicker } from "@/components/booking/DateTimePicker";
import { AddressSelector } from "@/components/booking/AddressSelector";
import { Address, useAddresses } from "@/hooks/useAddresses";
import { setHours as setDateHours, setMinutes as setDateMinutes, getDay, format } from "date-fns";
import {
  isSameDayBooking,
  isCleaningTypeAllowedSameDay,
  calculateRushFee,
  validateSameDayBooking,
} from "@/lib/same-day-booking";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientJobs } from "@/hooks/useJob";

const SERVICE_CHARGE_PCT = 0.15;

const STEPS = ["Service", "Property", "Date & Time", "Cleaner", "Extras", "Review"];

const cleaningTypes = [
  { id: "basic" as CleaningType, name: "Standard Cleaning", description: "Regular maintenance cleaning for a tidy home", baseCredits: 35, icon: Home, estimate: "$35–$140" },
  { id: "deep" as CleaningType, name: "Deep Cleaning", description: "Thorough cleaning including hard-to-reach areas", baseCredits: 55, icon: Sparkles, estimate: "$55–$220" },
  { id: "move_out" as CleaningType, name: "Move-Out Cleaning", description: "Complete cleaning for end of lease", baseCredits: 75, icon: Building, estimate: "$75–$300" },
];

const addOns = [
  { id: "fridge", name: "Inside Fridge", credits: 15, icon: "🧊" },
  { id: "oven", name: "Inside Oven", credits: 20, icon: "🔥" },
  { id: "windows", name: "Interior Windows", credits: 25, icon: "🪟" },
  { id: "laundry", name: "Laundry (wash & fold)", credits: 20, icon: "👕" },
  { id: "pet_hair", name: "Pet Hair Treatment", credits: 15, icon: "🐾" },
  { id: "supplies", name: "Cleaning Supplies Needed", credits: 10, icon: "🧹" },
];

export default function Book() {
  const [searchParams] = useSearchParams();
  const preselectedCleanerId = searchParams.get('cleaner');

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

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { createBooking, isCreating } = useBooking();
  const { account, isLoadingAccount } = useWallet();
  const { data: allCleaners, isLoading: cleanersLoading } = useCleaners({ onlyAvailable: true });
  const { data: favorites } = useFavorites();
  const { data: pastJobs } = useClientJobs();
  const { data: selectedCleaner } = useCleaner(selectedCleanerId || '');
  const { data: savedAddresses } = useAddresses();

  // Fetch cleaner availability blocks
  const { data: availabilityBlocks } = useQuery({
    queryKey: ['cleaner-availability-blocks', selectedCleanerId],
    queryFn: async () => {
      if (!selectedCleanerId) return [];
      const { data } = await supabase
        .from('availability_blocks')
        .select('day_of_week, start_time, end_time, is_active')
        .eq('cleaner_id', selectedCleanerId)
        .eq('is_active', true);
      return data || [];
    },
    enabled: !!selectedCleanerId,
  });

  useEffect(() => {
    if (savedAddresses?.length && !selectedAddress) {
      setSelectedAddress(savedAddresses.find(a => a.is_default) || savedAddresses[0]);
    }
  }, [savedAddresses, selectedAddress]);

  const selectedCleaningType = cleaningTypes.find(t => t.id === selectedType);
  const addOnCredits = selectedAddOns.reduce((sum, id) => sum + (addOns.find(a => a.id === id)?.credits || 0), 0);
  const rushFee = calculateRushFee(selectedDate);
  const isSameDay = selectedDate ? isSameDayBooking(selectedDate) : false;
  const baseCredits = selectedCleaningType ? selectedCleaningType.baseCredits * hours + addOnCredits : 0;
  const totalCredits = baseCredits + rushFee;
  const availableCredits = (account?.current_balance || 0) - (account?.held_balance || 0);
  const hasEnoughCredits = availableCredits >= totalCredits;
  const serviceCharge = Math.round(totalCredits * SERVICE_CHARGE_PCT);
  const directPayTotal = totalCredits + serviceCharge;

  const isDateBlockedByCleaner = (() => {
    if (!selectedDate || !selectedCleanerId || !availabilityBlocks?.length) return false;
    const dayOfWeek = getDay(selectedDate);
    return !availabilityBlocks.some(b => b.day_of_week === dayOfWeek);
  })();

  const isCleaningTypeAllowed = !isSameDay || !selectedType || isCleaningTypeAllowedSameDay(selectedType);

  const getScheduledDateTime = () => {
    if (!selectedDate || !selectedTime) return undefined;
    const [h, m] = selectedTime.split(':');
    return setDateMinutes(setDateHours(selectedDate, parseInt(h)), parseInt(m)).toISOString();
  };

  // Book Again cleaners (unique cleaners from past completed jobs)
  const bookAgainCleaners = (() => {
    if (!pastJobs?.length) return [];
    const seen = new Set<string>();
    return pastJobs
      .filter(j => j.status === "completed" && j.cleaner_id && j.cleaner)
      .filter(j => { if (seen.has(j.cleaner_id!)) return false; seen.add(j.cleaner_id!); return true; })
      .slice(0, 10)
      .map(j => ({
        id: j.cleaner_id!,
        name: `${j.cleaner?.first_name || ''} ${j.cleaner?.last_name || ''}`.trim() || 'Cleaner',
        rating: j.cleaner?.avg_rating,
        reliability: j.cleaner?.reliability_score || 100,
        lastBooking: j.scheduled_start_at || j.created_at,
      }));
  })();

  // Favorite cleaners mapped to listing format
  const favCleanerIds = new Set(favorites?.map(f => f.cleaner_id) || []);

  const [isDirectPaying, setIsDirectPaying] = useState(false);

  const handleConfirmWithCredits = async () => {
    if (!selectedType || !user) return;
    if (!hasEnoughCredits) { toast({ title: "Insufficient credits", variant: "destructive" }); return; }
    try {
      await createBooking({
        cleaningType: selectedType, hours, addOns: selectedAddOns, totalCredits,
        cleanerId: selectedCleanerId || undefined,
        scheduledDate: getScheduledDateTime(),
        address: selectedAddress ? `${selectedAddress.line1}, ${selectedAddress.city}` : undefined,
        notes: specialInstructions || undefined,
      });
    } catch (error: any) {
      toast({ title: "Booking failed", description: error?.message, variant: "destructive" });
    }
  };

  const handlePayDirectly = async () => {
    if (!selectedType || !user) return;
    setIsDirectPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-direct-payment', {
        body: {
          baseCredits: totalCredits, hours, cleaningType: selectedType, addOns: selectedAddOns, rushFee,
          cleanerId: selectedCleanerId || null, scheduledDate: getScheduledDateTime(),
          address: selectedAddress ? `${selectedAddress.line1}, ${selectedAddress.city}` : null, notes: specialInstructions || null,
        },
      });
      if (error) throw error;
      if (data?.url) { window.open(data.url, '_blank'); }
    } catch (error: any) {
      toast({ title: "Payment failed", description: error.message, variant: "destructive" });
    } finally { setIsDirectPaying(false); }
  };

  const toggleAddOn = (id: string) => setSelectedAddOns(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);

  return (
    <main className="flex-1 py-0">
      <Helmet><title>Book a Cleaning | PureTask</title></Helmet>

      <div className="container px-4 sm:px-6 max-w-4xl py-6 sm:py-10">
        {/* ── STEPPER ────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-1">
            {STEPS.map((label, i) => {
              const s = i + 1;
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      s < step ? "bg-primary text-primary-foreground" :
                      s === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                      "bg-muted text-muted-foreground"
                    }`}>{s < step ? <Check className="h-4 w-4" /> : s}</div>
                    <span className={`text-[10px] sm:text-xs font-medium hidden sm:block ${s <= step ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-2 rounded-full ${s < step ? "bg-primary" : "bg-border"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── MAIN STEP CONTENT ─────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* STEP 1: SERVICE TYPE */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-xl sm:text-2xl font-bold mb-1">What type of cleaning?</h2>
                  <p className="text-sm text-muted-foreground mb-6">Choose the service that fits your needs</p>
                  <div className="space-y-3">
                    {cleaningTypes.map(type => (
                      <Card key={type.id} className={`cursor-pointer transition-all ${selectedType === type.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/30"}`} onClick={() => setSelectedType(type.id)}>
                        <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <type.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{type.name}</h3>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-primary">{type.estimate}</p>
                            <p className="text-[10px] text-muted-foreground">est. range</p>
                          </div>
                          {selectedType === type.id && <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0"><Check className="h-4 w-4 text-primary-foreground" /></div>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Button className="w-full mt-6" size="lg" disabled={!selectedType} onClick={() => setStep(2)}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {/* STEP 2: PROPERTY */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-xl sm:text-2xl font-bold mb-1">Where should we clean?</h2>
                  <p className="text-sm text-muted-foreground mb-6">Select your property or add a new one</p>
                  <AddressSelector selectedAddressId={selectedAddress?.id} onSelect={setSelectedAddress} />
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" size="lg" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                    <Button className="flex-1" size="lg" disabled={!selectedAddress} onClick={() => setStep(3)}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: DATE & TIME */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-xl sm:text-2xl font-bold mb-1">When do you need it?</h2>
                  <p className="text-sm text-muted-foreground mb-6">Pick a date, time, and duration</p>
                  <div className="space-y-6">
                    <DateTimePicker selectedDate={selectedDate} selectedTime={selectedTime} onDateChange={(date) => {
                      setSelectedDate(date);
                      if (date && isSameDayBooking(date) && selectedTime && selectedType) {
                        const { valid } = validateSameDayBooking(date, selectedTime, selectedType);
                        if (!valid) setSelectedTime(undefined);
                      }
                    }} onTimeChange={setSelectedTime} />

                    {/* Hours selector */}
                    <Card>
                      <CardContent className="p-5">
                        <p className="font-semibold mb-4">Estimated hours</p>
                        <div className="flex items-center justify-center gap-6">
                          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" onClick={() => setHours(Math.max(1, hours - 1))} disabled={hours <= 1}><Minus className="h-4 w-4" /></Button>
                          <div className="text-center"><p className="text-4xl font-bold">{hours}</p><p className="text-muted-foreground text-sm">hours</p></div>
                          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" onClick={() => setHours(Math.min(8, hours + 1))} disabled={hours >= 8}><Plus className="h-4 w-4" /></Button>
                        </div>
                      </CardContent>
                    </Card>

                    {isSameDay && !isCleaningTypeAllowed && (
                      <Card className="bg-destructive/10 border-destructive/30"><CardContent className="p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div><p className="font-medium text-sm text-destructive">Move-Out not available same-day</p><p className="text-xs text-muted-foreground mt-1">Please select a future date.</p></div>
                      </CardContent></Card>
                    )}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" size="lg" onClick={() => setStep(2)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                    <Button className="flex-1" size="lg" disabled={!selectedDate || !selectedTime || !isCleaningTypeAllowed} onClick={() => setStep(4)}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: CLEANER */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-xl sm:text-2xl font-bold mb-1">Choose your cleaner</h2>
                  <p className="text-sm text-muted-foreground mb-6">Select a cleaner or let us auto-match</p>

                  <Tabs value={cleanerTab} onValueChange={setCleanerTab} className="mb-4">
                    <TabsList className="w-full bg-muted/50 p-1 rounded-xl">
                      <TabsTrigger value="all" className="gap-1.5 rounded-lg text-xs sm:text-sm"><Users className="h-3.5 w-3.5" /> All</TabsTrigger>
                      <TabsTrigger value="favorites" className="gap-1.5 rounded-lg text-xs sm:text-sm"><Heart className="h-3.5 w-3.5" /> Favorites</TabsTrigger>
                      <TabsTrigger value="again" className="gap-1.5 rounded-lg text-xs sm:text-sm"><RotateCcw className="h-3.5 w-3.5" /> Book Again</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-4">
                      {cleanersLoading ? (
                        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
                      ) : (
                        <div className="space-y-2">
                          {/* Auto-match option */}
                          <Card className={`cursor-pointer transition-all ${!selectedCleanerId ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/30"}`} onClick={() => setSelectedCleanerId(null)}>
                            <CardContent className="p-4 flex items-center gap-4">
                              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center"><Zap className="h-5 w-5 text-primary" /></div>
                              <div className="flex-1"><p className="font-semibold text-sm">Auto-Match Me</p><p className="text-xs text-muted-foreground">We'll find the best available cleaner for you</p></div>
                              {!selectedCleanerId && <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center"><Check className="h-4 w-4 text-primary-foreground" /></div>}
                            </CardContent>
                          </Card>
                          {allCleaners?.map(c => <CleanerCard key={c.id} cleaner={c} selected={selectedCleanerId === c.id} onSelect={() => setSelectedCleanerId(c.id)} isFav={favCleanerIds.has(c.id)} />)}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="favorites" className="mt-4">
                      {!favorites?.length ? (
                        <Card className="border-dashed"><CardContent className="p-8 text-center">
                          <Heart className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                          <p className="text-sm font-medium">No favorites yet</p>
                          <p className="text-xs text-muted-foreground mt-1">Heart cleaners to save them here</p>
                        </CardContent></Card>
                      ) : (
                        <div className="space-y-2">
                          {favorites.map(fav => {
                            if (!fav.cleaner) return null;
                            const c = fav.cleaner;
                            const name = `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Cleaner';
                            return (
                              <Card key={fav.id} className={`cursor-pointer transition-all ${selectedCleanerId === c.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/30"}`} onClick={() => setSelectedCleanerId(c.id)}>
                                <CardContent className="p-4 flex items-center gap-4">
                                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">{name.charAt(0)}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2"><p className="font-semibold text-sm truncate">{name}</p><Heart className="h-3.5 w-3.5 text-destructive fill-destructive" /></div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      {c.avg_rating && <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-warning fill-warning" />{c.avg_rating.toFixed(1)}</span>}
                                      <span>${c.hourly_rate_credits}/hr</span>
                                      <span>{c.jobs_completed} jobs</span>
                                    </div>
                                  </div>
                                  {selectedCleanerId === c.id && <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center"><Check className="h-4 w-4 text-primary-foreground" /></div>}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="again" className="mt-4">
                      {!bookAgainCleaners.length ? (
                        <Card className="border-dashed"><CardContent className="p-8 text-center">
                          <RotateCcw className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                          <p className="text-sm font-medium">No past cleaners</p>
                          <p className="text-xs text-muted-foreground mt-1">Complete a booking to see cleaners here</p>
                        </CardContent></Card>
                      ) : (
                        <div className="space-y-2">
                          {bookAgainCleaners.map(c => (
                            <Card key={c.id} className={`cursor-pointer transition-all ${selectedCleanerId === c.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/30"}`} onClick={() => setSelectedCleanerId(c.id)}>
                              <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">{c.name.charAt(0)}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate">{c.name}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {c.rating && <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-warning fill-warning" />{c.rating.toFixed(1)}</span>}
                                    <span>Last: {format(new Date(c.lastBooking), 'MMM d')}</span>
                                  </div>
                                </div>
                                {selectedCleanerId === c.id && <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center"><Check className="h-4 w-4 text-primary-foreground" /></div>}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  {selectedCleanerId && isDateBlockedByCleaner && selectedDate && (
                    <Card className="bg-warning/10 border-warning/30 mt-3"><CardContent className="p-4 flex items-start gap-3">
                      <CalendarOff className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                      <div><p className="font-medium text-sm">Cleaner unavailable on {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                      <p className="text-xs text-muted-foreground mt-1">Go back to change the date or pick a different cleaner.</p></div>
                    </CardContent></Card>
                  )}

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" size="lg" onClick={() => setStep(3)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                    <Button className="flex-1" size="lg" disabled={selectedCleanerId ? isDateBlockedByCleaner : false} onClick={() => setStep(5)}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: EXTRAS */}
              {step === 5 && (
                <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-xl sm:text-2xl font-bold mb-1">Add extras</h2>
                  <p className="text-sm text-muted-foreground mb-6">Optional add-ons and special instructions</p>
                  <div className="space-y-3 mb-6">
                    {addOns.map(addOn => (
                      <Card key={addOn.id} className={`cursor-pointer transition-all ${selectedAddOns.includes(addOn.id) ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/30"}`} onClick={() => toggleAddOn(addOn.id)}>
                        <CardContent className="flex items-center gap-4 p-4">
                          <span className="text-2xl">{addOn.icon}</span>
                          <div className="flex-1"><p className="font-medium">{addOn.name}</p></div>
                          <span className="text-sm text-muted-foreground">+${addOn.credits}</span>
                          <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center ${selectedAddOns.includes(addOn.id) ? "bg-primary border-primary" : "border-border"}`}>
                            {selectedAddOns.includes(addOn.id) && <Check className="h-4 w-4 text-primary-foreground" />}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Special instructions</label>
                    <Textarea placeholder="Any notes for your cleaner? (e.g., alarm code, pet info)" value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} className="min-h-[80px]" />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" onClick={() => setStep(4)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                    <Button className="flex-1" size="lg" onClick={() => setStep(6)}>Review Booking <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: REVIEW & PAY */}
              {step === 6 && (
                <motion.div key="s6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-xl sm:text-2xl font-bold mb-1">Review & confirm</h2>
                  <p className="text-sm text-muted-foreground mb-6">You only pay for time actually worked. Unused held credits are returned automatically.</p>

                  <Card className="mb-4">
                    <CardContent className="p-5 space-y-4">
                      <SummaryRow label="Service" value={selectedCleaningType?.name || ''} />
                      <SummaryRow label="Duration" value={`${hours} hours`} />
                      {selectedAddress && <SummaryRow label="Property" value={`${selectedAddress.line1}, ${selectedAddress.city}`} />}
                      {selectedDate && selectedTime && (
                        <SummaryRow label="Date & Time" value={`${format(selectedDate, 'EEE, MMM d')} at ${selectedTime}`} badge={isSameDay ? "Today" : undefined} />
                      )}
                      <SummaryRow label="Cleaner" value={selectedCleaner?.name || "Auto-Match"} />
                      {selectedAddOns.length > 0 && (
                        <div className="border-t border-border pt-3 space-y-1.5">
                          {selectedAddOns.map(id => { const a = addOns.find(x => x.id === id); return a ? <SummaryRow key={id} label={a.name} value={`+$${a.credits}`} small /> : null; })}
                        </div>
                      )}
                      {isSameDay && rushFee > 0 && <SummaryRow label="Same-Day Rush Fee" value={`+$${rushFee}`} highlight />}
                      {specialInstructions && <SummaryRow label="Notes" value={specialInstructions} small />}
                      <div className="border-t-2 border-border pt-4 flex items-center justify-between">
                        <span className="font-bold text-lg">Estimated Total</span>
                        <span className="text-2xl font-black text-primary">${totalCredits}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Escrow trust message */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 p-3 rounded-xl bg-success/5 border border-success/20">
                    <Shield className="h-4 w-4 text-success flex-shrink-0" />
                    <span>Credits held in escrow — released only after you approve the work. Protected by 24-Hour Review.</span>
                  </div>

                  {/* Payment options */}
                  <div className="space-y-3 mb-4">
                    <Card className={`border-2 ${hasEnoughCredits ? 'border-primary/40 bg-primary/5' : 'border-border opacity-60'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Wallet className="h-5 w-5 text-primary" />
                          <div className="flex-1"><p className="font-semibold text-sm">Pay with Credits</p>
                            {!isLoadingAccount && <p className="text-xs text-muted-foreground">Balance: <span className={hasEnoughCredits ? 'text-primary font-medium' : 'text-destructive font-medium'}>${availableCredits}</span>
                              {!hasEnoughCredits && <Button variant="link" className="p-0 h-auto text-xs ml-1" asChild><Link to="/wallet">Top up →</Link></Button>}
                            </p>}
                          </div>
                          <span className="text-lg font-bold">${totalCredits}</span>
                        </div>
                        <Button className="w-full" onClick={handleConfirmWithCredits} disabled={isCreating || !hasEnoughCredits}>
                          {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : <><Check className="mr-2 h-4 w-4" />Confirm Booking</>}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1"><p className="font-semibold text-sm">Pay with Card</p>
                            <p className="text-xs text-muted-foreground">Includes 15% service charge (${serviceCharge})</p>
                          </div>
                          <span className="text-lg font-bold">${directPayTotal}</span>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handlePayDirectly} disabled={isDirectPaying || isCreating}>
                          {isDirectPaying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opening Checkout...</> : <><ExternalLink className="mr-2 h-4 w-4" />Pay ${directPayTotal} with Stripe</>}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Button variant="ghost" size="sm" className="w-full" onClick={() => setStep(5)}><ArrowLeft className="mr-2 h-4 w-4" /> Edit Booking</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── STICKY SUMMARY PANEL (Desktop) ───────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Card className="border-2 border-border/50">
                <CardContent className="p-5">
                  <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Booking Summary</h3>
                  <div className="space-y-3 text-sm">
                    <SummaryRow label="Service" value={selectedCleaningType?.name || '—'} small />
                    <SummaryRow label="Property" value={selectedAddress ? selectedAddress.line1 : '—'} small />
                    <SummaryRow label="When" value={selectedDate && selectedTime ? `${format(selectedDate, 'MMM d')} · ${selectedTime}` : '—'} small />
                    <SummaryRow label="Duration" value={`${hours}h`} small />
                    <SummaryRow label="Cleaner" value={selectedCleaner?.name || (selectedCleanerId ? '—' : 'Auto-Match')} small />
                    {selectedAddOns.length > 0 && <SummaryRow label="Extras" value={`${selectedAddOns.length} add-on${selectedAddOns.length > 1 ? 's' : ''}`} small />}
                    <div className="border-t border-border pt-3 flex justify-between font-bold">
                      <span>Est. Total</span>
                      <span className="text-primary">${totalCredits || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Helper Components ──────────────────────────────────────────────

function SummaryRow({ label, value, small, highlight, badge }: { label: string; value: string; small?: boolean; highlight?: boolean; badge?: string }) {
  return (
    <div className={`flex items-start justify-between gap-2 ${small ? 'text-xs' : 'text-sm'}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right ${highlight ? 'text-warning font-medium' : 'font-medium'}`}>
        {value}
        {badge && <Badge variant="outline" className="ml-2 text-[10px] bg-warning/20 text-warning border-warning/30">{badge}</Badge>}
      </span>
    </div>
  );
}

function CleanerCard({ cleaner, selected, onSelect, isFav }: { cleaner: CleanerListing; selected: boolean; onSelect: () => void; isFav: boolean }) {
  return (
    <Card className={`cursor-pointer transition-all ${selected ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/30"}`} onClick={onSelect}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
          {cleaner.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate">{cleaner.name}</p>
            {isFav && <Heart className="h-3 w-3 text-destructive fill-destructive flex-shrink-0" />}
            {cleaner.tier !== 'standard' && <Badge variant="outline" className="text-[10px] h-4 capitalize">{cleaner.tier}</Badge>}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            {cleaner.avgRating && <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-warning fill-warning" />{cleaner.avgRating.toFixed(1)}</span>}
            <span>${cleaner.hourlyRate}/hr</span>
            <span>{cleaner.jobsCompleted} jobs</span>
            <span className="flex items-center gap-0.5"><Shield className="h-3 w-3" />{cleaner.reliabilityScore}%</span>
          </div>
        </div>
        {selected && <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0"><Check className="h-4 w-4 text-primary-foreground" /></div>}
      </CardContent>
    </Card>
  );
}
