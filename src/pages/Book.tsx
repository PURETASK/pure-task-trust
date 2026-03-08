import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Home, Building, Clock, Plus, Minus, Shield, ArrowRight, ArrowLeft, Loader2, AlertCircle, Zap, CalendarOff, Calendar, MapPin, CreditCard } from "lucide-react";
import { BookingServicesPicker } from "@/components/booking/BookingServicesPicker";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useBooking, CleaningType } from "@/hooks/useBooking";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { useCleaner } from "@/hooks/useCleaners";
import { Link } from "react-router-dom";
import { DateTimePicker } from "@/components/booking/DateTimePicker";
import { AddressSelector } from "@/components/booking/AddressSelector";
import { AddressVerification } from "@/components/booking/AddressVerification";
import { Address, useAddresses } from "@/hooks/useAddresses";
import { setHours as setDateHours, setMinutes as setDateMinutes, getDay } from "date-fns";
import { 
  isSameDayBooking, 
  isCleaningTypeAllowedSameDay, 
  calculateRushFee,
  validateSameDayBooking,
  SAME_DAY_CONFIG 
} from "@/lib/same-day-booking";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const cleaningTypes = [
  {
    id: "basic" as CleaningType,
    name: "Standard Clean",
    description: "Regular maintenance cleaning for a tidy home",
    baseCredits: 35,
    icon: Home,
  },
  {
    id: "deep" as CleaningType,
    name: "Deep Clean",
    description: "Thorough cleaning including hard-to-reach areas",
    baseCredits: 55,
    icon: Sparkles,
  },
  {
    id: "move_out" as CleaningType,
    name: "Move-out Clean",
    description: "Complete cleaning for end of lease",
    baseCredits: 75,
    icon: Building,
  },
];

const addOns = [
  { id: "fridge", name: "Inside Fridge", credits: 15 },
  { id: "oven", name: "Inside Oven", credits: 20 },
  { id: "windows", name: "Interior Windows", credits: 25 },
  { id: "laundry", name: "Laundry (wash & fold)", credits: 20 },
  { id: "organizing", name: "Closet Organizing", credits: 30 },
];

export default function Book() {
  const [searchParams] = useSearchParams();
  const cleanerId = searchParams.get('cleaner');
  
  const [step, setStep] = useState(1);
  const [confirmedJob, setConfirmedJob] = useState<{ id: string; type: string; date?: string; address?: string; credits: number } | null>(null);
  const [selectedType, setSelectedType] = useState<CleaningType | null>(null);
  const [hours, setHours] = useState(3);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { createBooking, isCreating } = useBooking();
  const { account, isLoadingAccount } = useWallet();
  const { data: selectedCleaner } = useCleaner(cleanerId || '');
  const { data: savedAddresses } = useAddresses();

  // Fetch cleaner's availability blocks for validation
  const { data: availabilityBlocks } = useQuery({
    queryKey: ['cleaner-availability-blocks', cleanerId],
    queryFn: async () => {
      if (!cleanerId) return [];
      const { data } = await supabase
        .from('availability_blocks')
        .select('day_of_week, start_time, end_time, is_active')
        .eq('cleaner_id', cleanerId)
        .eq('is_active', true);
      return data || [];
    },
    enabled: !!cleanerId,
  });

  // Auto-select default or first address when addresses load
  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0 && !selectedAddress) {
      const defaultAddress = savedAddresses.find(a => a.is_default) || savedAddresses[0];
      setSelectedAddress(defaultAddress);
    }
  }, [savedAddresses, selectedAddress]);

  const selectedCleaningType = cleaningTypes.find((t) => t.id === selectedType);
  const addOnCredits = selectedAddOns.reduce((sum, id) => {
    const addOn = addOns.find((a) => a.id === id);
    return sum + (addOn?.credits || 0);
  }, 0);
  
  // Calculate rush fee for same-day bookings
  const rushFee = calculateRushFee(selectedDate);
  const isSameDay = selectedDate ? isSameDayBooking(selectedDate) : false;
  
  const baseCredits = selectedCleaningType ? selectedCleaningType.baseCredits * hours + addOnCredits : 0;
  const totalCredits = baseCredits + rushFee;

  const availableCredits = (account?.current_balance || 0) - (account?.held_balance || 0);
  const hasEnoughCredits = availableCredits >= totalCredits;
  
  // Check if the selected date/time is blocked by the cleaner's availability
  const isDateBlockedByCleaner = (() => {
    if (!selectedDate || !cleanerId || !availabilityBlocks || availabilityBlocks.length === 0) return false;
    // day_of_week: 0=Sun, 1=Mon … 6=Sat (same as getDay)
    const dayOfWeek = getDay(selectedDate);
    const hasBlockForDay = availabilityBlocks.some(b => b.day_of_week === dayOfWeek);
    // If cleaner has blocks and none match this day, day is unavailable
    return !hasBlockForDay;
  })();
  
  // Check if selected cleaning type is allowed for same-day booking
  const isCleaningTypeAllowed = !isSameDay || !selectedType || isCleaningTypeAllowedSameDay(selectedType);

  // Combine date and time into a single datetime
  const getScheduledDateTime = () => {
    if (!selectedDate || !selectedTime) return undefined;
    const [hourStr, minuteStr] = selectedTime.split(':');
    let dt = setDateHours(selectedDate, parseInt(hourStr));
    dt = setDateMinutes(dt, parseInt(minuteStr));
    return dt.toISOString();
  };

  const handleConfirm = async () => {
    if (!selectedType) {
      toast({ title: "Please select a cleaning type", variant: "destructive" });
      return;
    }
    
    if (!user) {
      toast({ title: "Please sign in to book", variant: "destructive" });
      navigate('/auth');
      return;
    }

    if (!hasEnoughCredits) {
      toast({ title: "Insufficient credits", description: "Please add more credits to your wallet", variant: "destructive" });
      return;
    }
    
    try {
      const job = await createBooking({
        cleaningType: selectedType,
        hours,
        addOns: selectedAddOns,
        totalCredits,
        cleanerId: cleanerId || undefined,
        scheduledDate: getScheduledDateTime(),
        address: selectedAddress ? `${selectedAddress.line1}, ${selectedAddress.city}` : undefined,
      });
      
      // C2: Show inline confirmation screen instead of just a toast
      setConfirmedJob({
        id: (job as any)?.id || '',
        type: selectedType || 'basic',
        date: getScheduledDateTime(),
        address: selectedAddress ? `${selectedAddress.line1}, ${selectedAddress.city}` : undefined,
        credits: totalCredits,
      });
      toast({ title: "Booking confirmed!", description: "Your credits have been held." });
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({ 
        title: "Booking failed", 
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive" 
      });
    }
  };

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const canProceedToVerification = selectedDate && selectedTime && selectedAddress;
  
  // Helper to show what's missing
  const getMissingRequirements = () => {
    const missing = [];
    if (!selectedDate) missing.push('date');
    if (!selectedTime) missing.push('time');
    if (!selectedAddress) missing.push('address');
    return missing;
  };
  return (
    <main className="flex-1 py-6 sm:py-12">
        <div className="container px-4 sm:px-6 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Selected Cleaner Banner */}
            {selectedCleaner && (
              <Card className="mb-4 sm:mb-6 bg-primary/5 border-primary/20">
                <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm sm:text-base flex-shrink-0">
                    {selectedCleaner.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">Booking with {selectedCleaner.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">${selectedCleaner.hourlyRate}/hr</p>
                  </div>
                  <Badge variant="secondary" className="flex-shrink-0">Selected</Badge>
                </CardContent>
              </Card>
            )}

            {/* Progress Stepper */}
            {(() => {
              const steps = ["Type", "Hours", "Add-ons", "Schedule", "Address", "Confirm"];
              return (
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center gap-1 mb-2">
                    {steps.map((label, i) => {
                      const s = i + 1;
                      return (
                        <div key={s} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center gap-1">
                            <div className={`h-2 w-2 rounded-full transition-all duration-300 ${
                              s < step ? "bg-primary scale-100" :
                              s === step ? "bg-primary ring-2 ring-primary/30 scale-125" :
                              "bg-border"
                            }`} />
                            <span className={`text-[9px] sm:text-[10px] font-medium hidden xs:block transition-colors ${
                              s <= step ? "text-primary" : "text-muted-foreground"
                            }`}>{label}</span>
                          </div>
                          {i < steps.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1 rounded-full transition-colors duration-300 ${
                              s < step ? "bg-primary" : "bg-border"
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Step {step} of {steps.length}</p>
                </div>
              );
            })()}

            <AnimatePresence mode="wait">
              {/* Step 1: Cleaning Type */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">What type of cleaning?</h1>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Choose the service that fits your needs</p>

                  <div className="space-y-3 sm:space-y-4">
                    {cleaningTypes.map((type) => (
                      <Card
                        key={type.id}
                        className={`cursor-pointer transition-all ${
                          selectedType === type.id
                            ? "border-primary ring-2 ring-primary/20"
                            : "hover:border-primary/30"
                        }`}
                        onClick={() => setSelectedType(type.id)}
                      >
                        <CardContent className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <type.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base">{type.name}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{type.description}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-sm sm:text-base">${type.baseCredits}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">/hour</p>
                          </div>
                          {selectedType === type.id && (
                            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Button
                    className="w-full mt-6"
                    size="lg"
                    disabled={!selectedType}
                    onClick={() => setStep(2)}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Hours */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h1 className="text-2xl font-bold mb-2">How many hours?</h1>
                  <p className="text-muted-foreground mb-6">Estimate the time needed for your space</p>

                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center gap-6">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setHours(Math.max(1, hours - 1))}
                          disabled={hours <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="text-center">
                          <p className="text-5xl font-bold">{hours}</p>
                          <p className="text-muted-foreground">hours</p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setHours(Math.min(8, hours + 1))}
                          disabled={hours >= 8}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Typical {selectedCleaningType?.name.toLowerCase()}: 2-4 hours
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button className="flex-1" size="lg" onClick={() => setStep(3)}>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Add-ons */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h1 className="text-2xl font-bold mb-2">Any add-ons?</h1>
                  <p className="text-muted-foreground mb-6">Optional extras for a more thorough clean</p>

                  <div className="space-y-3 mb-6">
                    {addOns.map((addOn) => (
                      <Card
                        key={addOn.id}
                        className={`cursor-pointer transition-all ${
                          selectedAddOns.includes(addOn.id)
                            ? "border-primary ring-2 ring-primary/20"
                            : "hover:border-primary/30"
                        }`}
                        onClick={() => toggleAddOn(addOn.id)}
                      >
                        <CardContent className="flex items-center gap-4 p-4">
                          <div
                            className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                              selectedAddOns.includes(addOn.id)
                                ? "bg-primary border-primary"
                                : "border-border"
                            }`}
                          >
                            {selectedAddOns.includes(addOn.id) && (
                              <Check className="h-4 w-4 text-primary-foreground" />
                            )}
                          </div>
                          <span className="flex-1 font-medium">{addOn.name}</span>
                          <span className="text-muted-foreground">+{addOn.credits} credits</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" onClick={() => setStep(2)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button className="flex-1" size="lg" onClick={() => setStep(4)}>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Date, Time & Address */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h1 className="text-2xl font-bold mb-2">When and where?</h1>
                  <p className="text-muted-foreground mb-6">Choose your preferred date, time and location</p>

                  <div className="space-y-8 mb-6">
                    <DateTimePicker
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      onDateChange={(date) => {
                        setSelectedDate(date);
                        // Reset time if becoming same-day and time slot may be invalid
                        if (date && isSameDayBooking(date) && selectedTime) {
                          const availableSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
                          const { valid } = selectedType ? validateSameDayBooking(date, selectedTime, selectedType) : { valid: true };
                          if (!valid) {
                            setSelectedTime(undefined);
                          }
                        }
                      }}
                      onTimeChange={setSelectedTime}
                    />

                    {/* Same-day restriction warning for move-out cleaning */}
                    {selectedType && isSameDay && !isCleaningTypeAllowed && (
                      <Card className="bg-destructive/10 border-destructive/30">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm text-destructive">Move-Out Cleaning Not Available Same-Day</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Move-out cleaning requires at least 1 day advance notice. Please select a future date or choose a different cleaning type.
                              </p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-3"
                                onClick={() => setStep(1)}
                              >
                                Change Cleaning Type
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Cleaner availability warning */}
                    {cleanerId && selectedDate && isDateBlockedByCleaner && (
                      <Card className="bg-warning/10 border-warning/30">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <CalendarOff className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">Cleaner Unavailable on This Day</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {selectedCleaner?.name || 'This cleaner'} doesn't work on {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}s. Please choose a different date.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <AddressSelector
                      selectedAddressId={selectedAddress?.id}
                      onSelect={setSelectedAddress}
                    />
                  </div>

                  <div className="space-y-4">
                    {!canProceedToVerification && getMissingRequirements().length > 0 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Please select: {getMissingRequirements().join(', ')}
                      </p>
                    )}
                    <div className="flex gap-3">
                      <Button variant="outline" size="lg" onClick={() => setStep(3)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button 
                        className="flex-1" 
                        size="lg" 
                        onClick={() => setStep(5)}
                        disabled={!canProceedToVerification || !isCleaningTypeAllowed || isDateBlockedByCleaner}
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Address Verification */}
              {step === 5 && selectedAddress && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <AddressVerification
                    address={selectedAddress}
                    onConfirm={() => setStep(6)}
                    onBack={() => setStep(4)}
                  />
                </motion.div>
              )}

              {/* Step 6: Summary */}
              {step === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h1 className="text-2xl font-bold mb-2">Confirm your booking</h1>
                  <p className="text-muted-foreground mb-6">Review and place your credit hold</p>

                  <Card className="mb-6">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{selectedCleaningType?.name}</span>
                        <span>{selectedCleaningType?.baseCredits} × {hours} hrs = {(selectedCleaningType?.baseCredits || 0) * hours}</span>
                      </div>
                      {selectedAddOns.length > 0 && (
                        <div className="border-t border-border pt-4 space-y-2">
                          {selectedAddOns.map((id) => {
                            const addOn = addOns.find((a) => a.id === id);
                            return (
                              <div key={id} className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{addOn?.name}</span>
                                <span>+{addOn?.credits} credits</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Rush Fee for Same-Day Booking */}
                      {isSameDay && rushFee > 0 && (
                        <div className="border-t border-border pt-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Zap className="h-4 w-4 text-amber-500" />
                              Same-Day Rush Fee
                            </span>
                            <span className="text-amber-600 font-medium">+{rushFee} credits</span>
                          </div>
                        </div>
                      )}
                      
                      {selectedDate && selectedTime && (
                        <div className="border-t border-border pt-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Scheduled</span>
                            <div className="flex items-center gap-2">
                              <span>
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {selectedTime}
                              </span>
                              {isSameDay && (
                                <Badge variant="outline" className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs">
                                  Today
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedAddress && (
                        <div className="border-t border-border pt-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Location</span>
                            <span className="text-right">{selectedAddress.line1}, {selectedAddress.city}</span>
                          </div>
                          <Badge variant="outline" className="mt-2 text-xs gap-1">
                            <Check className="h-3 w-3" />
                            Address Verified
                          </Badge>
                        </div>
                      )}
                      
                      {/* Subtotal breakdown */}
                      {(rushFee > 0 || selectedAddOns.length > 0) && (
                        <div className="border-t border-border pt-4 space-y-2 text-sm">
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>Base ({selectedCleaningType?.name} × {hours}h)</span>
                            <span>${(selectedCleaningType?.baseCredits || 0) * hours}</span>
                          </div>
                          {selectedAddOns.length > 0 && (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <span>Add-ons</span>
                              <span>+${addOnCredits}</span>
                            </div>
                          )}
                          {rushFee > 0 && (
                            <div className="flex items-center justify-between text-amber-600">
                              <span>Rush fee</span>
                              <span>+${rushFee}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="border-t border-border pt-4 flex items-center justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="text-2xl font-bold">${totalCredits}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Credit Balance Check */}
                  {!isLoadingAccount && (
                    <Card className={`mb-6 ${hasEnoughCredits ? 'bg-accent/30 border-accent' : 'bg-destructive/10 border-destructive/30'}`}>
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {hasEnoughCredits ? (
                            <>
                              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm mb-1">Pay only for time worked</p>
                                <p className="text-xs text-muted-foreground">
                                  Credits are held until you approve the work. Unused credits from shorter jobs are automatically refunded.
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Available balance: <span className="font-medium">${availableCredits}</span>
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm mb-1 text-destructive">Insufficient balance</p>
                                <p className="text-xs text-muted-foreground">
                                  You have ${availableCredits} available but need ${totalCredits} for this booking.
                                </p>
                                <Button variant="link" className="p-0 h-auto text-xs mt-1" asChild>
                                  <Link to="/wallet">Add credits to your wallet →</Link>
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" onClick={() => setStep(5)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      className="flex-1" 
                      size="lg" 
                      onClick={handleConfirm}
                      disabled={isCreating || !hasEnoughCredits}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Booking...
                        </>
                      ) : (
                        'Confirm Booking'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
  );
}
