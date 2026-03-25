import { useState, useEffect, useCallback } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { IntroVideoUpload } from "@/components/profile/IntroVideoUpload";
import { AdditionalServicesSetup } from "@/components/cleaner/AdditionalServicesSetup";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { getTierFromScore, getTierConfig, CleanerTier, TIER_VISUAL, TIER_CONFIGS } from "@/lib/tier-config";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  DollarSign, Clock, MapPin, Briefcase, Save, Sparkles, Home, Building2,
  Dog, Leaf, Package, User, TrendingUp, Award, Info, RefreshCw, Star,
  CheckCircle, Zap, Languages, Heart, Car, Check, X
} from "lucide-react";

// ── PILL MULTI-SELECT ────────────────────────────────────────────────
function PillSelect({
  options, selected, onChange, color = "bg-success/10 text-success border-success/30"
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
  color?: string;
}) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => toggle(o.value)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            selected.includes(o.value)
              ? `${color} shadow-sm`
              : "bg-muted/50 text-muted-foreground border-border/50 hover:border-border"
          }`}
        >
          {selected.includes(o.value) && <Check className="inline h-3 w-3 mr-1" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── BIO SCORE BADGE ──────────────────────────────────────────────────
function BioScoreBadge({ score }: { score: number }) {
  if (score >= 90) return <Badge className="bg-success/10 text-success border-success/30 gap-1">🔥 Top Profile · {score}/100</Badge>;
  if (score >= 75) return <Badge className="bg-primary/10 text-primary border-primary/30 gap-1">✅ Strong Profile · {score}/100</Badge>;
  return <Badge variant="outline" className="gap-1 text-warning border-warning/40">⚠️ Needs Improvement · {score}/100</Badge>;
}

// ── CONSTANTS ────────────────────────────────────────────────────────
const CLEANING_TYPE_OPTIONS = [
  { value: "basic", label: "Basic Cleaning" },
  { value: "deep", label: "Deep Cleaning" },
  { value: "moveout", label: "Move In/Out" },
  { value: "airbnb", label: "Airbnb Turnover" },
  { value: "office", label: "Office Cleaning" },
  { value: "post_construction", label: "Post-Construction" },
];

const SPECIALTY_OPTIONS = [
  { value: "bathrooms", label: "Bathrooms" },
  { value: "kitchens", label: "Kitchens" },
  { value: "windows", label: "Windows" },
  { value: "carpets", label: "Carpets" },
  { value: "appliances", label: "Appliances" },
  { value: "laundry", label: "Laundry" },
  { value: "organizing", label: "Organizing" },
  { value: "garages", label: "Garages" },
];

const WORK_STYLE_OPTIONS = [
  { value: "detail-oriented", label: "Detail-oriented" },
  { value: "fast", label: "Fast" },
  { value: "thorough", label: "Thorough" },
  { value: "systematic", label: "Systematic" },
  { value: "efficient", label: "Efficient" },
];

const PERSONALITY_OPTIONS = [
  { value: "friendly", label: "Friendly" },
  { value: "respectful", label: "Respectful" },
  { value: "quiet", label: "Quiet" },
  { value: "communicative", label: "Communicative" },
  { value: "professional", label: "Professional" },
];

const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Mandarin", label: "Mandarin" },
  { value: "Arabic", label: "Arabic" },
  { value: "Hindi", label: "Hindi" },
  { value: "Russian", label: "Russian" },
];

export default function CleanerProfile() {
  const { toast } = useToast();
  const { profile } = useCleanerProfile();
  const [saving, setSaving] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [manualBioEdit, setManualBioEdit] = useState(false);

  // Tier
  const reliabilityScore = profile?.reliability_score || 0;
  const tier = getTierFromScore(reliabilityScore) as CleanerTier;
  const tierConfig = getTierConfig(tier);
  const hourlyRateRange = tierConfig.hourlyRateRange;

  // Core rates
  const [hourlyRate, setHourlyRate] = useState(hourlyRateRange.min);
  const [travelRadius, setTravelRadius] = useState(15);

  // AI bio fields
  const [yearsExperience, setYearsExperience] = useState(0);
  const [cleaningTypes, setCleaningTypes] = useState<string[]>(["basic"]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [workStyle, setWorkStyle] = useState<string[]>([]);
  const [personality, setPersonality] = useState<string[]>([]);
  const [suppliesProvided, setSuppliesProvided] = useState(true);
  const [hasVehicle, setHasVehicle] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);

  // Bio state
  const [aiBio, setAiBio] = useState("");
  const [bioScore, setBioScore] = useState(0);
  const [bioText, setBioText] = useState(""); // what we display/edit

  useEffect(() => {
    if (!profile) return;
    setHourlyRate(Math.max(hourlyRateRange.min, Math.min(hourlyRateRange.max, profile.hourly_rate_credits || hourlyRateRange.min)));
    setTravelRadius((profile as any).travel_radius_km || 15);
    setYearsExperience((profile as any).years_experience || 0);
    setCleaningTypes((profile as any).cleaning_types || ["basic"]);
    setSpecialties((profile as any).specialties || []);
    setLanguages((profile as any).languages || ["English"]);
    setWorkStyle((profile as any).work_style || []);
    setPersonality((profile as any).personality || []);
    setSuppliesProvided((profile as any).supplies_provided ?? true);
    setHasVehicle((profile as any).has_vehicle ?? false);
    setPetFriendly((profile as any).pet_friendly ?? false);

    const savedBio = (profile as any).ai_bio || profile.bio || "";
    setAiBio(savedBio);
    setBioText(savedBio);
    setBioScore((profile as any).bio_score || 0);
  }, [profile, hourlyRateRange.min, hourlyRateRange.max]);

  const generateBio = useCallback(async () => {
    setGeneratingBio(true);
    setManualBioEdit(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-cleaner-bio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            years_experience: yearsExperience,
            cleaning_types: cleaningTypes,
            specialties,
            jobs_completed: profile?.jobs_completed || 0,
            avg_rating: profile?.avg_rating || 0,
            on_time_rate: 95,
            supplies_provided: suppliesProvided,
            has_vehicle: hasVehicle,
            pet_friendly: petFriendly,
            languages,
            work_style: workStyle,
            personality,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate bio");
      }

      const { bio, bio_score } = await res.json();
      setAiBio(bio);
      setBioText(bio);
      setBioScore(bio_score);
      toast({ title: "✨ Bio generated!", description: `Profile score: ${bio_score}/100` });
    } catch (e: any) {
      toast({ title: "Failed to generate bio", description: e.message, variant: "destructive" });
    } finally {
      setGeneratingBio(false);
    }
  }, [yearsExperience, cleaningTypes, specialties, suppliesProvided, hasVehicle, petFriendly, languages, workStyle, personality, profile, toast]);

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("cleaner_profiles")
        .update({
          hourly_rate_credits: hourlyRate,
          travel_radius_km: travelRadius,
          bio: bioText,
          ai_bio: aiBio,
          bio_score: bioScore,
          years_experience: yearsExperience,
          cleaning_types: cleaningTypes,
          specialties,
          languages,
          work_style: workStyle,
          personality,
          supplies_provided: suppliesProvided,
          has_vehicle: hasVehicle,
          pet_friendly: petFriendly,
          bio_generated_at: aiBio ? new Date().toISOString() : undefined,
        } as any)
        .eq("id", profile.id);

      if (error) throw error;
      toast({ title: "Profile saved ✅", description: "Your profile has been updated." });
    } catch {
      toast({ title: "Error saving profile", description: "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const scoreImprovements = [
    { done: yearsExperience >= 1, label: "Add years of experience", boost: "+15" },
    { done: (profile?.jobs_completed || 0) > 10, label: "Complete 10+ jobs", boost: "+15" },
    { done: (profile?.avg_rating || 0) >= 4.5, label: "Maintain 4.5★ rating", boost: "+15" },
    { done: specialties.length >= 2, label: "Add 2+ specialties", boost: "+15" },
    { done: workStyle.length >= 1, label: "Select work style", boost: "+10" },
    { done: personality.length >= 1, label: "Select personality traits", boost: "+10" },
  ];

  return (
    <CleanerLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Build a high-converting profile with AI-powered bio generation</p>
        </div>

        {/* Tier Status Banner */}
        <Card
          className={`${TIER_VISUAL[tier].bg} ${TIER_VISUAL[tier].border} border-2 rounded-2xl overflow-hidden`}
          style={{ boxShadow: TIER_VISUAL[tier].glow }}
        >
          <CardContent className="p-0">
            {/* Top: tier name + score */}
            <div className={`bg-gradient-to-r ${TIER_VISUAL[tier].gradient} px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{TIER_VISUAL[tier].emoji}</span>
                <div>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Your Tier</p>
                  <h3 className="text-white text-2xl font-black capitalize leading-tight">{tier}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Reliability</p>
                <p className="text-white text-3xl font-black">{reliabilityScore}<span className="text-base font-normal text-white/60">/100</span></p>
              </div>
            </div>
            {/* Bottom: rate + fee stats */}
            <div className="grid grid-cols-3 divide-x divide-border/60 px-0">
              <div className="px-5 py-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Rate Range</p>
                <p className={`text-2xl font-black ${TIER_VISUAL[tier].text}`}>${hourlyRateRange.min}–${hourlyRateRange.max}</p>
                <p className="text-xs text-muted-foreground font-medium">per hour</p>
              </div>
              <div className="px-5 py-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Platform Fee</p>
                <p className={`text-2xl font-black ${TIER_VISUAL[tier].text}`}>{tierConfig.platformFeePercent}%</p>
                <p className="text-xs text-muted-foreground font-medium">you keep {100 - tierConfig.platformFeePercent}%</p>
              </div>
              <div className="px-5 py-4 text-center">
                {tier === "platinum" ? (
                  <>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                    <p className="text-2xl font-black text-foreground">🏆</p>
                    <p className="text-xs text-muted-foreground font-medium">Max tier!</p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Next Tier</p>
                    <p className={`text-2xl font-black ${TIER_VISUAL[tier].text}`}>{Math.max(0, TIER_VISUAL[tier].nextMin - reliabilityScore)}</p>
                    <p className="text-xs text-muted-foreground font-medium">pts to {TIER_VISUAL[tier].next}</p>
                  </>
                )}
              </div>
            </div>
            {bioScore > 0 && (
              <div className="px-5 pb-4">
                <BioScoreBadge score={bioScore} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Photo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><User className="h-5 w-5 text-success" />Profile Photo</CardTitle>
            <CardDescription>Your photo is the first thing clients see — make it count!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfilePhotoUpload userName={`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Cleaner"} />
            {/* Photo tip */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/30">
              <span className="text-2xl flex-shrink-0 mt-0.5">📸</span>
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">Pro tip: Smile into the camera!</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cleaners with a warm, natural smile looking directly at the camera get <span className="font-semibold text-foreground">up to 40% more bookings</span>. Use a close-up face shot with good lighting — no sunglasses, hats, or group photos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intro Video */}
        <IntroVideoUpload cleanerId={profile?.id} />


        {/* Hourly Rate */}
        <Card
          className={`border-2 ${TIER_VISUAL[tier].border}`}
          style={{ boxShadow: TIER_VISUAL[tier].glow }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-5 w-5 text-success" />
              Your Hourly Rate
            </CardTitle>
            <CardDescription>
              Your rate range is determined by your reliability score and tier — the higher you score, the more you can charge.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* How it works explainer */}
            <div className="rounded-xl border border-border/60 overflow-hidden">
              <div className="bg-muted/50 px-4 py-2.5 border-b border-border/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rate Range by Tier & Reliability Score</p>
              </div>
              <div className="divide-y divide-border/40">
                {(["bronze", "silver", "gold", "platinum"] as const).map((t) => {
                  const tc = TIER_CONFIGS[t];
                  const isCurrentTier = t === tier;
                  return (
                    <div
                      key={t}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${isCurrentTier ? `${TIER_VISUAL[t].bg}` : ""}`}
                    >
                      <span className="text-xl w-7 text-center flex-shrink-0">{TIER_VISUAL[t].emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-bold capitalize ${isCurrentTier ? TIER_VISUAL[t].text : "text-muted-foreground"}`}>
                            {tc.label}
                          </span>
                          <span className="text-xs text-muted-foreground">Score {tc.minScore}–{tc.maxScore}</span>
                          {isCurrentTier && (
                            <Badge className={`${TIER_VISUAL[t].badge} text-[10px] h-4 px-1.5`}>You are here</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-base font-black ${isCurrentTier ? TIER_VISUAL[t].text : "text-muted-foreground"}`}>
                          ${tc.hourlyRateRange.min}–${tc.hourlyRateRange.max}
                        </span>
                        <p className="text-[10px] text-muted-foreground">/hr</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current rate slider */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Set Your Rate</Label>
                <div className="text-right">
                  <span className={`text-3xl font-black ${TIER_VISUAL[tier].text}`}>${hourlyRate}</span>
                  <span className="text-sm text-muted-foreground ml-1">/ hr</span>
                </div>
              </div>
              <Slider
                value={[hourlyRate]}
                onValueChange={([v]) => setHourlyRate(v)}
                min={hourlyRateRange.min}
                max={hourlyRateRange.max}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>${hourlyRateRange.min} min</span>
                <span className="text-center text-foreground font-medium">
                  Your {tier} range: <span className={TIER_VISUAL[tier].text}>${hourlyRateRange.min}–${hourlyRateRange.max}</span>
                </span>
                <span>${hourlyRateRange.max} max</span>
              </div>
              <div className={`flex items-start gap-2.5 p-3 rounded-xl ${TIER_VISUAL[tier].bg} border ${TIER_VISUAL[tier].border}`}>
                <TrendingUp className={`h-4 w-4 shrink-0 mt-0.5 ${TIER_VISUAL[tier].text}`} />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className={`font-semibold ${TIER_VISUAL[tier].text}`}>Want to charge more? </span>
                  Increase your reliability score to unlock the next tier.
                  {tier !== "platinum" && (
                    <> You need <span className="font-semibold text-foreground">{Math.max(0, TIER_VISUAL[tier].nextMin - reliabilityScore)} more points</span> to reach {TIER_VISUAL[tier].next} (up to ${TIER_CONFIGS[TIER_VISUAL[tier].next?.toLowerCase() as keyof typeof TIER_CONFIGS]?.hourlyRateRange.max ?? hourlyRateRange.max}/hr).</>
                  )}
                  {tier === "platinum" && <> You're at the top — enjoy the best rates on the platform!</>}
                </p>
              </div>
            </div>

            <Separator />
            <div>
              <Label className="text-sm flex items-center gap-2 mb-2"><MapPin className="h-4 w-4" />Travel Radius</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Slider value={[travelRadius]} onValueChange={([v]) => setTravelRadius(v)} min={5} max={50} step={5} />
                </div>
                <div className="w-20 text-center">
                  <span className="text-xl font-bold">{travelRadius}</span>
                  <span className="text-sm text-muted-foreground ml-1">mi</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── AI BIO BUILDER ── */}
        <Card
          style={{
            border: "2px solid hsl(var(--success))",
            boxShadow: "0 4px 24px 0 hsl(var(--success) / 0.15)",
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-success" />
              AI-Powered Bio Builder
            </CardTitle>
            <CardDescription>
              Fill in your details and let AI craft a high-converting bio that maximises bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Years Experience */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Briefcase className="h-4 w-4 text-success" />
                Years of Experience
                <span className="ml-auto text-xl font-black text-success">{yearsExperience} yr{yearsExperience !== 1 ? "s" : ""}</span>
              </Label>
              <Slider value={[yearsExperience]} onValueChange={([v]) => setYearsExperience(v)} min={0} max={20} step={1} />
              <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>New</span><span>20+ years</span></div>
            </div>

            <Separator />

            {/* Cleaning Types */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Home className="h-4 w-4 text-success" />Cleaning Types
              </Label>
              <PillSelect options={CLEANING_TYPE_OPTIONS} selected={cleaningTypes} onChange={setCleaningTypes} color="bg-success/10 text-success border-success/30" />
            </div>

            {/* Specialties */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-warning" />Specialties
                <span className="text-xs text-muted-foreground font-normal">(pick 2+ for boost)</span>
              </Label>
              <PillSelect options={SPECIALTY_OPTIONS} selected={specialties} onChange={setSpecialties} color="bg-warning/10 text-warning border-warning/30" />
            </div>

            {/* Work Style */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-primary" />Work Style
              </Label>
              <PillSelect options={WORK_STYLE_OPTIONS} selected={workStyle} onChange={setWorkStyle} color="bg-primary/10 text-primary border-primary/30" />
            </div>

            {/* Personality */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-destructive" />Personality
              </Label>
              <PillSelect options={PERSONALITY_OPTIONS} selected={personality} onChange={setPersonality} color="bg-destructive/10 text-destructive border-destructive/30" />
            </div>

            {/* Languages */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Languages className="h-4 w-4 text-[hsl(var(--pt-purple))]" />Languages
              </Label>
              <PillSelect options={LANGUAGE_OPTIONS} selected={languages} onChange={setLanguages} color="bg-[hsl(var(--pt-purple)/0.1)] text-[hsl(var(--pt-purple))] border-[hsl(var(--pt-purple)/0.3)]" />
            </div>

            <Separator />

            {/* Toggles */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
              { icon: Package, label: "Own Supplies", value: suppliesProvided, set: setSuppliesProvided, color: "text-primary" },
                { icon: Car, label: "Has Vehicle", value: hasVehicle, set: setHasVehicle, color: "text-primary" },
                { icon: Dog, label: "Pet Friendly", value: petFriendly, set: setPetFriendly, color: "text-destructive" },
              ].map(t => (
                <div key={t.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                  <div className="flex items-center gap-2">
                    <t.icon className={`h-4 w-4 ${t.color}`} />
                    <span className="text-sm font-medium">{t.label}</span>
                  </div>
                  <Switch checked={t.value} onCheckedChange={t.set} />
                </div>
              ))}
            </div>

            <Separator />

            {/* Score Improvement Tips */}
            <div className="rounded-xl bg-muted/30 p-4 border border-border/50">
              <p className="text-xs font-semibold text-muted-foreground mb-3">PROFILE SCORE BREAKDOWN</p>
              <div className="space-y-2">
                {scoreImprovements.map(item => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    {item.done
                      ? <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
                      : <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground shrink-0" />}
                    <span className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>{item.label}</span>
                    {!item.done && <Badge variant="outline" className="ml-auto text-success border-success/30 text-xs h-4 px-1">{item.boost}</Badge>}
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateBio}
              disabled={generatingBio}
              className="w-full rounded-xl gap-2 bg-success hover:bg-success/90 text-success-foreground h-12 text-base font-semibold"
            >
              {generatingBio ? (
                <><RefreshCw className="h-4 w-4 animate-spin" />Generating your bio…</>
              ) : (
                <><Sparkles className="h-4 w-4" />Generate AI Bio</>
              )}
            </Button>

            {/* Bio Preview */}
            {bioText && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="rounded-xl border-2 border-success/40 bg-success/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-success" />
                      <span className="text-sm font-semibold">AI Bio Preview</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {bioScore > 0 && <BioScoreBadge score={bioScore} />}
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setManualBioEdit(v => !v)}>
                        {manualBioEdit ? <><X className="h-3 w-3" />Cancel</> : "✏ Edit"}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-success" onClick={generateBio} disabled={generatingBio}>
                        <RefreshCw className={`h-3 w-3 ${generatingBio ? "animate-spin" : ""}`} />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                  {manualBioEdit ? (
                    <textarea
                      className="w-full min-h-[180px] rounded-lg bg-background border border-border/60 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-success/30"
                      value={bioText}
                      onChange={e => setBioText(e.target.value)}
                    />
                  ) : (
                    <pre className="text-sm text-foreground whitespace-pre-wrap leading-relaxed font-sans">{bioText}</pre>
                  )}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Additional Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-5 w-5 text-[hsl(var(--pt-purple))]" />Additional Services & Pricing</CardTitle>
            <CardDescription>Set prices for add-on services (ranges based on your tier)</CardDescription>
          </CardHeader>
          <CardContent><AdditionalServicesSetup /></CardContent>
        </Card>

        {/* Save Button */}
        <div className="sticky bottom-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl gap-2 bg-success hover:bg-success/90 text-success-foreground h-12 text-base font-semibold shadow-lg"
          >
            {saving ? <><RefreshCw className="h-4 w-4 animate-spin" />Saving…</> : <><Save className="h-4 w-4" />Save Profile</>}
          </Button>
        </div>
      </div>
    </CleanerLayout>
  );
}
