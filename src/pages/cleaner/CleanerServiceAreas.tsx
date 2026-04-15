import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { useCleanerServiceAreas } from "@/hooks/useServiceAreas";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin, Plus, Navigation, Loader2,
  Map, Globe, Target, X,
  Save, Radio
} from "lucide-react";
import { Label } from "@/components/ui/label";
import RadiusMap, { type MapZone } from "@/components/booking/RadiusMap";

function getRadiusLabel(r: number) {
  if (r <= 5)  return "Hyper local";
  if (r <= 10) return "Local";
  if (r <= 15) return "Nearby";
  if (r <= 20) return "Mid-range";
  if (r <= 25) return "Wide";
  if (r <= 35) return "Regional";
  return "Extended";
}

function getRadiusColor(r: number) {
  if (r <= 15) return { border: "border-success/70", bg: "bg-success/10", text: "text-success" };
  if (r <= 25) return { border: "border-primary/70", bg: "bg-primary/10", text: "text-primary" };
  if (r <= 35) return { border: "border-warning/70", bg: "bg-warning/10", text: "text-warning" };
  return { border: "border-[hsl(280,70%,55%)]/70", bg: "bg-[hsl(280,70%,55%)]/10", text: "text-[hsl(280,70%,55%)]" };
}

export default function CleanerServiceAreas() {
  const { toast } = useToast();
  const {
    cleanerProfile, serviceAreas, isLoading, isServiceAreasLoading, hasCleanerProfile,
    addServiceArea, removeServiceArea,
    travelRadius, updateTravelRadius
  } = useCleanerServiceAreas();

  // Determine map center: cleaner profile coords > first service area coords > default Austin
  const mapLat = cleanerProfile?.latitude
    ?? serviceAreas.find(a => a.latitude)?.latitude
    ?? 30.2672;
  const mapLng = cleanerProfile?.longitude
    ?? serviceAreas.find(a => a.longitude)?.longitude
    ?? -97.7431;

  const isAdding   = addServiceArea.isPending;
  const isRemoving = removeServiceArea.isPending;
  const isSavingRadius = updateTravelRadius.isPending;

  // Form fields for adding a base location
  const [city, setCity]     = useState("");
  const [state, setState]   = useState("");
  const [zipCode, setZipCode] = useState("");

  // Travel radius in miles (convert from km stored in DB)
  const storedMiles = travelRadius ? Math.round((travelRadius as number) * 0.621371) : 15;
  const [globalRadius, setGlobalRadius] = useState<number>(storedMiles);
  const [radiusDirty, setRadiusDirty]   = useState(false);

  const handleRadiusChange = (val: number) => {
    setGlobalRadius(val);
    setRadiusDirty(true);
  };

  const geocodeLocation = async (cityName: string, stateName: string, zip: string): Promise<{ lat: number; lng: number } | null> => {
    const query = [cityName, stateName, zip].filter(Boolean).join(", ");
    if (!query) return null;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
      );
      const results = await res.json();
      if (results.length > 0) {
        return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
      }
    } catch (e) {
      console.warn("Geocoding failed:", e);
    }
    return null;
  };

  const handleSaveAll = async () => {
    const km = Math.round(globalRadius / 0.621371);
    try {
      await updateTravelRadius.mutateAsync(km);
      setRadiusDirty(false);

      if (city.trim() || zipCode.trim()) {
        // Geocode city/state/zip to get coordinates
        const coords = await geocodeLocation(city.trim(), state.trim(), zipCode.trim());

        await addServiceArea.mutateAsync({
          city: city.trim() || null,
          state: state.trim() || null,
          zip_code: zipCode.trim() || null,
          radius_miles: globalRadius,
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
        });
        setCity(""); setState(""); setZipCode("");
        toast({ title: "Service area saved!", description: `${city.trim() || zipCode.trim()} with ${globalRadius}-mile radius` });
      } else {
        toast({ title: "Travel radius saved!", description: `Set to ${globalRadius} miles` });
      }
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    }
  };

  const handleRemoveArea = async (areaId: string) => {
    try {
      await removeServiceArea.mutateAsync(areaId);
      toast({ title: "Service area removed" });
    } catch (error: any) {
      toast({ title: "Failed to remove", description: error.message, variant: "destructive" });
    }
  };

  const rc = getRadiusColor(globalRadius);

  // Build zones from saved service areas that have coordinates
  const savedZones: MapZone[] = serviceAreas
    .filter(a => a.latitude != null && a.longitude != null)
    .map(a => ({
      lat: a.latitude!,
      lng: a.longitude!,
      radiusMiles: a.radius_miles || 10,
      label: a.city && a.state ? `${a.city}, ${a.state}` : a.zip_code ? `ZIP ${a.zip_code}` : "Saved Zone",
    }));

  return (
    <CleanerLayout>
      <div className="space-y-6 max-w-3xl">

        {/* ── HERO HEADER ──────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative overflow-hidden rounded-3xl p-7"
            style={{
              background: "linear-gradient(135deg, hsl(210,100%,18%) 0%, hsl(210,100%,32%) 60%, hsl(145,65%,28%) 100%)",
              boxShadow: "0 16px 48px -8px hsl(210,100%,30%/0.45)"
            }}>
            <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full blur-3xl opacity-20"
              style={{ background: "hsl(145,65%,47%)" }} />

            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-white/60" />
                <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Coverage Map</span>
              </div>
              <h1 className="text-4xl font-black text-white leading-none mb-2">Service Areas</h1>
              <p className="text-white/60 text-sm">Set your base location and how far you're willing to travel. Clients outside your coverage area won't be able to request you.</p>

              <div className="flex gap-3 flex-wrap mt-4">
                {[
                  { icon: MapPin, value: serviceAreas.length, label: "Zones" },
                  { icon: Target, value: `${globalRadius} mi`, label: "Travel Radius" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm text-center min-w-[80px]">
                    <s.icon className="h-4 w-4 mx-auto mb-1 text-white/60" />
                    <p className="text-xl font-bold leading-none">{s.value}</p>
                    <p className="text-white/50 text-[11px] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── SET YOUR COVERAGE ─────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <div className={`rounded-3xl border-2 ${rc.border} overflow-hidden`}
            style={{ background: "hsl(var(--card))" }}>
            <div className="p-5 border-b border-border/40">
              <div className="flex items-center gap-3 mb-1">
                <div className={`h-10 w-10 rounded-xl ${rc.bg} flex items-center justify-center`}>
                  <Navigation className={`h-5 w-5 ${rc.text}`} />
                </div>
                <div>
                  <h2 className="font-bold text-base">Set Your Coverage Area</h2>
                  <p className="text-xs text-muted-foreground">Enter your base location and set your travel radius</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Location inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">City</Label>
                  <Input
                    placeholder="e.g., Austin"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">State</Label>
                  <Input
                    placeholder="e.g., TX"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Zip Code <span className="text-muted-foreground/50 normal-case font-normal">(or enter city above)</span>
                </Label>
                <Input
                  placeholder="e.g., 78701"
                  value={zipCode}
                  onChange={e => setZipCode(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* Radius slider */}
              <div className="space-y-3 p-4 rounded-2xl border-2 border-success/30 bg-success/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-success" />
                    <Label className="font-semibold text-sm">Travel Radius</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-3xl font-black ${rc.text}`}>{globalRadius}</span>
                    <span className="text-sm text-muted-foreground">mi</span>
                    <Badge variant="secondary" className="text-xs">{getRadiusLabel(globalRadius)}</Badge>
                  </div>
                </div>
                <Slider
                  value={[globalRadius]}
                  onValueChange={([v]) => handleRadiusChange(v)}
                  min={5} max={50} step={5}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>5 mi</span><span>50 mi</span>
                </div>
              </div>

              {/* Map preview */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Map className="h-3.5 w-3.5 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">Coverage preview — shaded area = your {globalRadius}-mile zone</Label>
                </div>
                <div className={`rounded-2xl overflow-hidden border-2 ${rc.border}`} style={{ height: 280 }}>
                  <RadiusMap lat={mapLat} lng={mapLng} radiusMiles={globalRadius} zones={savedZones} className="h-full" />
                </div>
              </div>

              {/* Save button */}
              <Button
                className={`w-full h-12 font-bold rounded-xl gap-2 transition-all ${
                  (radiusDirty || city.trim() || zipCode.trim())
                    ? "bg-success hover:bg-success/90 text-white border-0 shadow-lg shadow-success/30"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted border-0"
                }`}
                onClick={handleSaveAll}
                disabled={isLoading || !hasCleanerProfile || isSavingRadius || isAdding || (!radiusDirty && !city.trim() && !zipCode.trim())}
              >
                {(isLoading || isSavingRadius || isAdding)
                  ? <><Loader2 className="h-4 w-4 animate-spin" />{isLoading ? "Loading profile…" : "Saving…"}</>
                  : !hasCleanerProfile
                    ? <><Save className="h-4 w-4" />Cleaner profile missing</>
                    : <><Save className="h-4 w-4" />{(radiusDirty || city.trim() || zipCode.trim()) ? "Save Service Area" : "Saved ✓"}</>
                }
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── YOUR SAVED ZONES ──────────────────────── */}
        {!isServiceAreasLoading && serviceAreas.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" /> Saved Zones
              <Badge variant="secondary" className="ml-1">{serviceAreas.length}</Badge>
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <AnimatePresence>
                {serviceAreas.map((area, i) => {
                  const rc2 = getRadiusColor(area.radius_miles || 10);
                  return (
                    <motion.div
                      key={area.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className={`rounded-2xl border-2 ${rc2.border} p-5 relative group hover:shadow-lg transition-all duration-200`}
                        style={{ background: "hsl(var(--card))" }}>
                        <button
                          onClick={() => handleRemoveArea(area.id)}
                          disabled={isRemoving}
                          className="absolute top-3 right-3 h-7 w-7 rounded-full bg-muted/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>

                        <div className="flex items-start gap-4">
                          <div className={`h-14 w-14 rounded-full border-4 ${rc2.border} flex items-center justify-center ${rc2.bg} shrink-0`}>
                            <div className="text-center">
                              <p className={`text-sm font-black leading-none ${rc2.text}`}>{area.radius_miles || 10}</p>
                              <p className="text-[9px] text-muted-foreground">mi</p>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-base leading-tight truncate">
                              {area.city && area.state
                                ? `${area.city}, ${area.state}`
                                : area.zip_code
                                  ? `ZIP ${area.zip_code}`
                                  : "Custom Area"}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <Badge variant="outline" className="text-[11px] h-5 border-success/40 text-success">Active</Badge>
                              <span className="text-xs text-muted-foreground">{getRadiusLabel(area.radius_miles || 10)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {isServiceAreasLoading && (
          <div className="grid sm:grid-cols-2 gap-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        )}

      </div>
    </CleanerLayout>
  );
}
