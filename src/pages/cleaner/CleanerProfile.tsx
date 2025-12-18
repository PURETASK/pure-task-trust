import { useState } from "react";
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
  Package
} from "lucide-react";

export default function CleanerProfile() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Form state
  const [hourlyRate, setHourlyRate] = useState(35);
  const [travelRadius, setTravelRadius] = useState(15);
  const [bio, setBio] = useState("");
  
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
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast({
      title: "Profile Updated",
      description: "Your settings have been saved successfully.",
    });
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
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your rates, availability, and services
          </p>
        </div>

        {/* Rates Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              Rates & Pricing
            </CardTitle>
            <CardDescription>
              Set your hourly rate and travel preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base">Hourly Rate</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1">
                    <Slider
                      value={[hourlyRate]}
                      onValueChange={([value]) => setHourlyRate(value)}
                      min={20}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="w-24">
                    <div className="flex items-center gap-1 text-2xl font-bold text-success">
                      <span>$</span>
                      <Input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="w-20 text-center text-xl font-bold border-0 p-0 h-auto"
                        min={20}
                        max={100}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">per hour</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Suggested range: $25-$50/hr based on your area
                </p>
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
                    px-4 py-3 rounded-lg font-medium transition-all
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
              Services Offered
            </CardTitle>
            <CardDescription>
              Choose the cleaning services you provide
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Basic Cleaning</p>
                    <p className="text-sm text-muted-foreground">Regular maintenance cleaning</p>
                  </div>
                </div>
                <Switch 
                  checked={services.basicCleaning}
                  onCheckedChange={() => toggleService("basicCleaning")}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-medium">Deep Cleaning</p>
                    <p className="text-sm text-muted-foreground">Thorough, detailed cleaning</p>
                  </div>
                </div>
                <Switch 
                  checked={services.deepCleaning}
                  onCheckedChange={() => toggleService("deepCleaning")}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium">Move In/Out Cleaning</p>
                    <p className="text-sm text-muted-foreground">Complete property cleaning</p>
                  </div>
                </div>
                <Switch 
                  checked={services.moveInOut}
                  onCheckedChange={() => toggleService("moveInOut")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <Dog className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-medium">Pet-Friendly</p>
                    <p className="text-sm text-muted-foreground">Comfortable working with pets</p>
                  </div>
                </div>
                <Switch 
                  checked={services.petFriendly}
                  onCheckedChange={() => toggleService("petFriendly")}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium">Eco-Friendly Products</p>
                    <p className="text-sm text-muted-foreground">Use environmentally safe products</p>
                  </div>
                </div>
                <Switch 
                  checked={services.ecoFriendly}
                  onCheckedChange={() => toggleService("ecoFriendly")}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div>
                    <p className="font-medium">Bring Own Supplies</p>
                    <p className="text-sm text-muted-foreground">I bring my own cleaning supplies</p>
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
