import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles, Home, PackageOpen, Truck, HelpCircle,
  ArrowRight, Dog,
} from "lucide-react";
import { saveRequestToLocal, type CleaningRequestData } from "@/hooks/useCleaningRequest";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CLEANING_TYPES = [
  { value: "basic" as const, label: "Basic Clean", icon: Home, desc: "Regular upkeep cleaning" },
  { value: "deep" as const, label: "Deep Clean", icon: Sparkles, desc: "Thorough top-to-bottom" },
  { value: "move_out" as const, label: "Move-Out Clean", icon: Truck, desc: "End-of-lease ready" },
  { value: "other" as const, label: "Other", icon: HelpCircle, desc: "Tell us what you need" },
];

const TIME_SLOTS = [
  "Morning (8am–12pm)",
  "Afternoon (12pm–4pm)",
  "Evening (4pm–7pm)",
  "Flexible",
];

export function CleaningRequestForm() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [type, setType] = useState<CleaningRequestData["cleaning_type"] | null>(null);
  const [customDesc, setCustomDesc] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [bedrooms, setBedrooms] = useState<number | "">("");
  const [bathrooms, setBathrooms] = useState<number | "">("");
  const [hasPets, setHasPets] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const buildPayload = (): CleaningRequestData => ({
    cleaning_type: type!,
    custom_description: type === "other" ? customDesc : undefined,
    first_name: firstName.trim(),
    last_name: lastName.trim() || undefined,
    email: email.trim(),
    phone: phone.trim() || undefined,
    address_line1: address1.trim(),
    address_line2: address2.trim() || undefined,
    city: city.trim(),
    state: state.trim() || undefined,
    postal_code: postalCode.trim() || undefined,
    preferred_date: preferredDate || undefined,
    preferred_time: preferredTime || undefined,
    estimated_hours: bedrooms ? Math.max(2, Number(bedrooms)) : 2,
    number_of_bedrooms: bedrooms ? Number(bedrooms) : undefined,
    number_of_bathrooms: bathrooms ? Number(bathrooms) : undefined,
    has_pets: hasPets,
    notes: notes.trim() || undefined,
  });

  const isValid = type && firstName.trim() && email.trim() && address1.trim() && city.trim();

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);

    const payload = buildPayload();

    if (isAuthenticated && user) {
      // Save directly to DB
      const { error } = await supabase.from("cleaning_requests").insert({
        ...payload,
        user_id: user.id,
      });
      setSubmitting(false);
      if (error) {
        toast.error("Something went wrong. Please try again.");
        console.error(error);
        return;
      }
      toast.success("Request submitted! We'll match you with a cleaner.");
      navigate("/discover");
    } else {
      // Save to localStorage, then redirect to auth
      saveRequestToLocal(payload);
      setSubmitting(false);
      toast.info("Create an account to save your request and get matched.");
      navigate("/auth?redirect=/discover");
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-muted/30">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-10"
        >
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
            Get Started
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            Request a cleaning
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Tell us what you need and we'll match you with a verified cleaner.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-border shadow-sm"
        >
          {/* ── Step 1: Cleaning Type ── */}
          <div className="mb-8">
            <Label className="text-base font-semibold mb-3 block">What type of cleaning do you need?</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CLEANING_TYPES.map((ct) => {
                const selected = type === ct.value;
                return (
                  <button
                    key={ct.value}
                    type="button"
                    onClick={() => setType(ct.value)}
                    className={`relative flex flex-col items-center gap-2 p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center ${
                      selected
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center ${
                      selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      <ct.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <span className={`text-sm sm:text-base font-semibold ${selected ? "text-primary" : "text-foreground"}`}>
                      {ct.label}
                    </span>
                    <span className="text-xs text-muted-foreground leading-tight">{ct.desc}</span>
                  </button>
                );
              })}
            </div>

            {type === "other" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
                <Label htmlFor="custom-desc" className="text-sm font-medium mb-1.5 block">Describe what you need</Label>
                <Textarea
                  id="custom-desc"
                  placeholder="e.g. Post-renovation cleanup, garage organization..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  maxLength={500}
                  className="resize-none"
                  rows={3}
                />
              </motion.div>
            )}
          </div>

          {/* ── Step 2: Contact Info ── */}
          <div className="mb-8">
            <Label className="text-base font-semibold mb-3 block">Your contact info</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="first-name" className="text-sm mb-1 block">First name *</Label>
                <Input id="first-name" placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={50} />
              </div>
              <div>
                <Label htmlFor="last-name" className="text-sm mb-1 block">Last name</Label>
                <Input id="last-name" placeholder="Smith" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={50} />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm mb-1 block">Email *</Label>
                <Input id="email" type="email" placeholder="jane@email.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={100} />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm mb-1 block">Phone</Label>
                <Input id="phone" type="tel" placeholder="(555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
              </div>
            </div>
          </div>

          {/* ── Step 3: Address ── */}
          <div className="mb-8">
            <Label className="text-base font-semibold mb-3 block">Cleaning address</Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="addr1" className="text-sm mb-1 block">Address line 1 *</Label>
                <Input id="addr1" placeholder="123 Main St" value={address1} onChange={(e) => setAddress1(e.target.value)} maxLength={200} />
              </div>
              <div>
                <Label htmlFor="addr2" className="text-sm mb-1 block">Address line 2</Label>
                <Input id="addr2" placeholder="Apt 4B" value={address2} onChange={(e) => setAddress2(e.target.value)} maxLength={100} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="city" className="text-sm mb-1 block">City *</Label>
                  <Input id="city" placeholder="Austin" value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} />
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm mb-1 block">State</Label>
                  <Input id="state" placeholder="TX" value={state} onChange={(e) => setState(e.target.value)} maxLength={50} />
                </div>
                <div>
                  <Label htmlFor="zip" className="text-sm mb-1 block">ZIP code</Label>
                  <Input id="zip" placeholder="78701" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} maxLength={10} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Step 4: Details ── */}
          <div className="mb-8">
            <Label className="text-base font-semibold mb-3 block">Home details</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="bedrooms" className="text-sm mb-1 block">Bedrooms</Label>
                <Input id="bedrooms" type="number" min={0} max={20} placeholder="3" value={bedrooms} onChange={(e) => setBedrooms(e.target.value ? Number(e.target.value) : "")} />
              </div>
              <div>
                <Label htmlFor="bathrooms" className="text-sm mb-1 block">Bathrooms</Label>
                <Input id="bathrooms" type="number" min={0} max={20} placeholder="2" value={bathrooms} onChange={(e) => setBathrooms(e.target.value ? Number(e.target.value) : "")} />
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-end pb-1">
                <div className="flex items-center gap-3">
                  <Switch id="pets" checked={hasPets} onCheckedChange={setHasPets} />
                  <Label htmlFor="pets" className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <Dog className="h-4 w-4 text-muted-foreground" /> Pets in home
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* ── Step 5: Scheduling ── */}
          <div className="mb-8">
            <Label className="text-base font-semibold mb-3 block">Preferred schedule</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pref-date" className="text-sm mb-1 block">Preferred date</Label>
                <Input id="pref-date" type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
              </div>
              <div>
                <Label htmlFor="pref-time" className="text-sm mb-1 block">Preferred time</Label>
                <Select value={preferredTime} onValueChange={setPreferredTime}>
                  <SelectTrigger id="pref-time">
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ── Notes ── */}
          <div className="mb-8">
            <Label htmlFor="notes" className="text-sm font-medium mb-1.5 block">Additional notes</Label>
            <Textarea
              id="notes"
              placeholder="Anything else we should know? (e.g. parking instructions, access codes, special requests)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* ── Submit ── */}
          <Button
            size="lg"
            className="w-full text-base h-13 sm:h-14 rounded-2xl shadow-elevated"
            onClick={handleSubmit}
            disabled={!isValid || submitting}
          >
            {submitting ? "Submitting..." : "Choose a Cleaner"}
            {!submitting && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-3">
            {isAuthenticated
              ? "Your request will be saved and we'll help you find the perfect cleaner."
              : "You'll be asked to create a free account so we can save your request."}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
