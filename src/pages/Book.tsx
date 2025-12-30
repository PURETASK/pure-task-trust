import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Home, Building, Clock, Plus, Minus, Shield, ArrowRight, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { BookingServicesPicker } from "@/components/booking/BookingServicesPicker";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useBooking, CleaningType } from "@/hooks/useBooking";
import { useWallet } from "@/hooks/useWallet";
import { useCleaner } from "@/hooks/useCleaners";
import { Link } from "react-router-dom";
import { DateTimePicker } from "@/components/booking/DateTimePicker";
import { AddressSelector } from "@/components/booking/AddressSelector";
import { AddressVerification } from "@/components/booking/AddressVerification";
import { Address } from "@/hooks/useAddresses";
import { setHours as setDateHours, setMinutes as setDateMinutes } from "date-fns";

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
  const [selectedType, setSelectedType] = useState<CleaningType | null>(null);
  const [hours, setHours] = useState(3);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createBooking, isCreating } = useBooking();
  const { account, isLoadingAccount } = useWallet();
  const { data: selectedCleaner } = useCleaner(cleanerId || '');

  const selectedCleaningType = cleaningTypes.find((t) => t.id === selectedType);
  const addOnCredits = selectedAddOns.reduce((sum, id) => {
    const addOn = addOns.find((a) => a.id === id);
    return sum + (addOn?.credits || 0);
  }, 0);
  const totalCredits = selectedCleaningType ? selectedCleaningType.baseCredits * hours + addOnCredits : 0;

  const availableCredits = (account?.current_balance || 0) - (account?.held_balance || 0);
  const hasEnoughCredits = availableCredits >= totalCredits;

  // Combine date and time into a single datetime
  const getScheduledDateTime = () => {
    if (!selectedDate || !selectedTime) return undefined;
    const [hourStr, minuteStr] = selectedTime.split(':');
    let dt = setDateHours(selectedDate, parseInt(hourStr));
    dt = setDateMinutes(dt, parseInt(minuteStr));
    return dt.toISOString();
  };

  const handleConfirm = async () => {
    if (!selectedType) return;
    
    try {
      await createBooking({
        cleaningType: selectedType,
        hours,
        addOns: selectedAddOns,
        totalCredits,
        cleanerId: cleanerId || undefined,
        scheduledDate: getScheduledDateTime(),
        address: selectedAddress ? `${selectedAddress.line1}, ${selectedAddress.city}` : undefined,
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const canProceedToVerification = selectedDate && selectedTime && selectedAddress;

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
                    <p className="text-xs sm:text-sm text-muted-foreground">{selectedCleaner.hourlyRate} credits/hr</p>
                  </div>
                  <Badge variant="secondary" className="flex-shrink-0">Selected</Badge>
                </CardContent>
              </Card>
            )}

            {/* Progress */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 sm:h-2 w-6 sm:w-8 rounded-full transition-colors ${
                    s <= step ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>

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
                            <p className="font-semibold text-sm sm:text-base">{type.baseCredits}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">credits/hr</p>
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
                      onDateChange={setSelectedDate}
                      onTimeChange={setSelectedTime}
                    />

                    <AddressSelector
                      selectedAddressId={selectedAddress?.id}
                      onSelect={setSelectedAddress}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" onClick={() => setStep(3)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      className="flex-1" 
                      size="lg" 
                      onClick={() => setStep(5)}
                      disabled={!canProceedToVerification}
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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
                        <span>{selectedCleaningType?.baseCredits} × {hours} hrs</span>
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
                      {selectedDate && selectedTime && (
                        <div className="border-t border-border pt-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Scheduled</span>
                            <span>
                              {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {selectedTime}
                            </span>
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
                      <div className="border-t border-border pt-4 flex items-center justify-between">
                        <span className="font-semibold">Credit Hold</span>
                        <span className="text-2xl font-bold">{totalCredits} credits</span>
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
                                  Available balance: <span className="font-medium">{availableCredits} credits</span>
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm mb-1 text-destructive">Insufficient credits</p>
                                <p className="text-xs text-muted-foreground">
                                  You have {availableCredits} credits available but need {totalCredits} for this booking.
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
