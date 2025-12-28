import { useState, useEffect } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { AdditionalServicesSetup } from "@/components/cleaner/AdditionalServicesSetup";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { getTierFromScore, getTierConfig, CleanerTier } from "@/lib/tier-config";
import { supabase } from "@/integrations/supabase/client";
import { 
  DollarSign, 
  Clock, 
  MapPin, 
  Briefcase, 
  Save,
  Sparkles,
  Home,
  Building2,
  Dog,
  Leaf,
  Package,
  User,
  TrendingUp,
  Award,
  Info
} from "lucide-react";

export default function CleanerProfile() {
  const { toast } = useToast();
  const { profile } = useCleanerProfile();
  const [saving, setSaving] = useState(false);

  // Get tier info
  const reliabilityScore = profile?.reliability_score || 0;
  const tier = getTierFromScore(reliabilityScore) as CleanerTier;
  const tierConfig = getTierConfig(tier);
  const hourlyRateRange = tierConfig.hourlyRateRange;

  // Form state
  const [hourlyRate, setHourlyRate] = useState(hourlyRateRange.min);
  const [travelRadius, setTravelRadius] = useState(15);
  const [bio, setBio] = useState("");
  
  // Initialize from profile
  useEffect(() => {
    if (profile) {
      setHourlyRate(Math.max(hourlyRateRange.min, Math.min(hourlyRateRange.max, profile.hourly_rate_credits || hourlyRateRange.min)));
      setTravelRadius(profile.travel_radius_km || 15);
      setBio(profile.bio || "");
    }
  }, [profile, hourlyRateRange.min, hourlyRateRange.max]);
  
  // Availability
  const [availability, setAvailability] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  // Services
  const [services, setServices] = useState({
    basicCleaning: true,
    deepCleaning: false,
    moveInOut: false,
    petFriendly: true,
    ecoFriendly: false,
    hasOwnSupplies: true,
  });

  const handleSave = async () => {
    if (!profile?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('cleaner_profiles')
        .update({
          hourly_rate_credits: hourlyRate,
          travel_radius_km: travelRadius,
          bio,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: keyof typeof availability) => {
    setAvailability(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const toggleService = (service: keyof typeof services) => {
    setServices(prev => ({ ...prev, [service]: !prev[service] }));
  };

  const days = [
    { key: "monday", label: "Mon" },
    { key: "tuesday", label: "Tue" },
    { key: "wednesday", label: "Wed" },
    { key: "thursday", label: "Thu" },
    { key: "friday", label: "Fri" },
    { key: "saturday", label: "Sat" },
    { key: "sunday", label: "Sun" },
  ] as const;

  return (
    <CleanerLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your rates, availability, and services
          </p>
        </div>

        {/* Tier Status Banner */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">Your Tier: {tier.charAt(0).toUpperCase() + tier.slice(1)}</h3>
                  <Badge variant="outline">{reliabilityScore} points</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  You can charge ${hourlyRateRange.min}-${hourlyRateRange.max}/hr • {tierConfig.platformFeePercent}% platform fee
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {tier === 'platinum' ? 'Max tier!' : 'Keep improving to unlock higher rates'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Photo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Photo
            </CardTitle>
            <CardDescription>
              Upload a professional photo to build trust with clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfilePhotoUpload
              userName={`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Cleaner"}
            />
          </CardContent>
        </Card>

        {/* Rates Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              Hourly Rate
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              Set your rate within your tier's range
              <Badge variant="outline" className="text-xs">
                ${hourlyRateRange.min} - ${hourlyRateRange.max}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300">
                <Info className="h-4 w-4 shrink-0" />
                <p className="text-sm">
                  Your rate range is based on your <strong>{tier}</strong> tier. Improve your reliability score to unlock higher rates!
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Slider
                      value={[hourlyRate]}
                      onValueChange={([value]) => setHourlyRate(value)}
                      min={hourlyRateRange.min}
                      max={hourlyRateRange.max}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>${hourlyRateRange.min}</span>
                      <span>${hourlyRateRange.max}</span>
                    </div>
                  </div>
                  <div className="w-24 text-right">
                    <div className="flex items-center justify-end gap-1 text-2xl font-bold text-success">
                      <span>$</span>
                      <span>{hourlyRate}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">per hour</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Travel Radius
                </Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1">
                    <Slider
                      value={[travelRadius]}
                      onValueChange={([value]) => setTravelRadius(value)}
                      min={5}
                      max={50}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="w-24 text-center">
                    <span className="text-2xl font-bold">{travelRadius}</span>
                    <span className="text-sm text-muted-foreground ml-1">miles</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Services Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              Additional Services & Pricing
            </CardTitle>
            <CardDescription>
              Set prices for add-on services (ranges based on your tier)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdditionalServicesSetup />
          </CardContent>
        </Card>

        {/* Availability Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Weekly Availability
            </CardTitle>
            <CardDescription>
              Select the days you're available to work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {days.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleDay(key)}
                  className={`
                    px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base
                    ${availability[key] 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              You can set specific hours in the Schedule page
            </p>
          </CardContent>
        </Card>

        {/* Services Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-violet-500" />
              Cleaning Types
            </CardTitle>
            <CardDescription>
              Choose the cleaning services you provide
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Home className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Basic Cleaning</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Regular maintenance cleaning</p>
                  </div>
                </div>
                <Switch 
                  checked={services.basicCleaning}
                  onCheckedChange={() => toggleService("basicCleaning")}
                />
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Deep Cleaning</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Thorough, detailed cleaning</p>
                  </div>
                </div>
                <Switch 
                  checked={services.deepCleaning}
                  onCheckedChange={() => toggleService("deepCleaning")}
                />
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Move In/Out Cleaning</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Complete property cleaning</p>
                  </div>
                </div>
                <Switch 
                  checked={services.moveInOut}
                  onCheckedChange={() => toggleService("moveInOut")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <Dog className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Pet-Friendly</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Comfortable working with pets</p>
                  </div>
                </div>
                <Switch 
                  checked={services.petFriendly}
                  onCheckedChange={() => toggleService("petFriendly")}
                />
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Eco-Friendly Products</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Use environmentally safe products</p>
                  </div>
                </div>
                <Switch 
                  checked={services.ecoFriendly}
                  onCheckedChange={() => toggleService("ecoFriendly")}
                />
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Bring Own Supplies</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">I bring my own cleaning supplies</p>
                  </div>
                </div>
                <Switch 
                  checked={services.hasOwnSupplies}
                  onCheckedChange={() => toggleService("hasOwnSupplies")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio Section */}
        <Card>
          <CardHeader>
            <CardTitle>About You</CardTitle>
            <CardDescription>
              Tell clients about yourself and your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Hi! I'm a professional cleaner with 5+ years of experience. I take pride in leaving every home spotless..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {bio.length}/500 characters
            </p>
          </CardContent>
        </Card>

        {/* Active Services Preview */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Your Profile Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-success/10 text-success border-0">
                ${hourlyRate}/hr
              </Badge>
              <Badge variant="secondary">{travelRadius} mile radius</Badge>
              <Badge variant="outline">{tier.charAt(0).toUpperCase() + tier.slice(1)} Tier</Badge>
              {services.basicCleaning && <Badge variant="outline">Basic Cleaning</Badge>}
              {services.deepCleaning && <Badge variant="outline">Deep Cleaning</Badge>}
              {services.moveInOut && <Badge variant="outline">Move In/Out</Badge>}
              {services.petFriendly && <Badge variant="outline">Pet-Friendly</Badge>}
              {services.ecoFriendly && <Badge variant="outline">Eco-Friendly</Badge>}
              {services.hasOwnSupplies && <Badge variant="outline">Own Supplies</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pb-8">
          <Button 
            size="lg" 
            onClick={handleSave}
            disabled={saving}
            className="min-w-[200px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </CleanerLayout>
  );
}
