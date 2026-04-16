import { useEffect, useMemo, useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  MapPin, Navigation, Loader2, Map, Globe, Target, X, Save, Radio,
} from "lucide-react";
import RadiusMap, { type MapZone } from "@/components/booking/RadiusMap";

interface ServiceArea {
  id: string;
  cleaner_id: string;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_miles: number | null;
}

interface CleanerProfileLite {
  id: string;
  latitude: number | null;
  longitude: number | null;
  travel_radius_km: number | null;
}

const KM_PER_MI = 1.60934;

function getRadiusLabel(r: number) {
  if (r <= 5) return "Hyper local";
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

async function geocode(city: string, state: string, zip: string): Promise<{ lat: number; lng: number } | null> {
  const q = [city, state, zip].filter(Boolean).join(", ");
  if (!q) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      { signal: ctrl.signal, headers: { "Accept-Language": "en" } }
    );
    clearTimeout(timer);
    const json = await res.json();
    if (Array.isArray(json) && json.length) {
      return { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) };
    }
  } catch (e) {
    console.warn("geocode failed", e);
  }
  return null;
}

export default function CleanerServiceAreas() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<CleanerProfileLite | null>(null);
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [radiusMi, setRadiusMi] = useState(15);
  const [radiusDirty, setRadiusDirty] = useState(false);

  // Initial load
  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: prof, error: profErr } = await supabase
          .from("cleaner_profiles")
          .select("id, latitude, longitude, travel_radius_km")
          .eq("user_id", user.id)
          .maybeSingle();
        if (profErr) throw profErr;
        if (cancelled) return;
        setProfile(prof as CleanerProfileLite | null);

        if (prof?.travel_radius_km) {
          setRadiusMi(Math.max(5, Math.round(prof.travel_radius_km / KM_PER_MI)));
        }

        if (prof?.id) {
          const { data: rows, error: areaErr } = await supabase
            .from("cleaner_service_areas")
            .select("id, cleaner_id, city, state, zip_code, latitude, longitude, radius_miles")
            .eq("cleaner_id", prof.id)
            .order("created_at", { ascending: false });
          if (areaErr) throw areaErr;
          if (!cancelled) setAreas((rows ?? []) as ServiceArea[]);
        }
      } catch (e: any) {
        console.error("Failed to load service areas", e);
        toast({ title: "Couldn't load service areas", description: e.message, variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, authLoading, toast]);

  const mapLat = profile?.latitude ?? areas.find(a => a.latitude)?.latitude ?? 30.2672;
  const mapLng = profile?.longitude ?? areas.find(a => a.longitude)?.longitude ?? -97.7431;

  const savedZones: MapZone[] = useMemo(
    () => areas
      .filter(a => a.latitude != null && a.longitude != null)
      .map(a => ({
        lat: a.latitude!,
        lng: a.longitude!,
        radiusMiles: a.radius_miles || 10,
        label: a.city && a.state ? `${a.city}, ${a.state}` : a.zip_code ? `ZIP ${a.zip_code}` : "Saved Zone",
      })),
    [areas]
  );

  const hasInput = !!(city.trim() || zipCode.trim());
  const canSave = !!profile && (radiusDirty || hasInput) && !saving && !loading;

  const handleSave = async () => {
    if (!profile?.id) {
      toast({ title: "Profile not ready", description: "Please complete onboarding first.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      // 1) Update travel radius
      const km = Math.round(radiusMi * KM_PER_MI);
      const profileUpdate: Record<string, unknown> = { travel_radius_km: km };

      // 2) If a location was entered, geocode and add area
      let addedArea: ServiceArea | null = null;
      if (hasInput) {
        const coords = await geocode(city.trim(), stateVal.trim(), zipCode.trim());
        if (coords) {
          // Set as base coordinates if cleaner has none
          if (profile.latitude == null || profile.longitude == null) {
            profileUpdate.latitude = coords.lat;
            profileUpdate.longitude = coords.lng;
          }
        }

        const { data: inserted, error: insErr } = await supabase
          .from("cleaner_service_areas")
          .insert({
            cleaner_id: profile.id,
            city: city.trim() || null,
            state: stateVal.trim() || null,
            zip_code: zipCode.trim() || null,
            latitude: coords?.lat ?? null,
            longitude: coords?.lng ?? null,
            radius_miles: radiusMi,
          })
          .select("id, cleaner_id, city, state, zip_code, latitude, longitude, radius_miles")
          .single();
        if (insErr) throw insErr;
        addedArea = inserted as ServiceArea;
      }

      const { error: updErr } = await supabase
        .from("cleaner_profiles")
        .update(profileUpdate)
        .eq("id", profile.id);
      if (updErr) throw updErr;

      // Apply local state
      setProfile(p => p ? {
        ...p,
        travel_radius_km: km,
        latitude: (profileUpdate.latitude as number | undefined) ?? p.latitude,
        longitude: (profileUpdate.longitude as number | undefined) ?? p.longitude,
      } : p);
      if (addedArea) setAreas(prev => [addedArea!, ...prev]);

      setRadiusDirty(false);
      setCity(""); setStateVal(""); setZipCode("");

      toast({
        title: "Saved!",
        description: addedArea
          ? `Added coverage with ${radiusMi}-mile radius`
          : `Travel radius set to ${radiusMi} miles`,
      });
    } catch (e: any) {
      console.error("Save failed", e);
      toast({ title: "Save failed", description: e.message ?? "Try again", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      const { error } = await supabase.from("cleaner_service_areas").delete().eq("id", id);
      if (error) throw error;
      setAreas(prev => prev.filter(a => a.id !== id));
      toast({ title: "Service area removed" });
    } catch (e: any) {
      toast({ title: "Failed to remove", description: e.message, variant: "destructive" });
    } finally {
      setRemovingId(null);
    }
  };

  const rc = getRadiusColor(radiusMi);

  return (
    <CleanerLayout>
      <div className="space-y-6 max-w-3xl">
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div
            className="relative overflow-hidden rounded-3xl p-7"
            style={{
              background: "linear-gradient(135deg, hsl(210,100%,18%) 0%, hsl(210,100%,32%) 60%, hsl(145,65%,28%) 100%)",
              boxShadow: "0 16px 48px -8px hsl(210,100%,30%/0.45)",
            }}
          >
            <div
              className="absolute -top-10 -right-10 w-56 h-56 rounded-full blur-3xl opacity-20"
              style={{ background: "hsl(145,65%,47%)" }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-white/60" />
                <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Coverage Map</span>
              </div>
              <h1 className="text-4xl font-black text-white leading-none mb-2">Service Areas</h1>
              <p className="text-white/60 text-sm">
                Set your base location and how far you're willing to travel.
              </p>
              <div className="flex gap-3 flex-wrap mt-4">
                {[
                  { icon: MapPin, value: areas.length, label: "Zones" },
                  { icon: Target, value: `${radiusMi} mi`, label: "Travel Radius" },
                ].map(s => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm text-center min-w-[80px]"
                  >
                    <s.icon className="h-4 w-4 mx-auto mb-1 text-white/60" />
                    <p className="text-xl font-bold leading-none">{s.value}</p>
                    <p className="text-white/50 text-[11px] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* FORM */}
        {loading ? (
          <Skeleton className="h-[600px] rounded-3xl" />
        ) : !profile ? (
          <div className="rounded-3xl border-2 border-warning/40 bg-warning/5 p-6 text-center">
            <p className="font-semibold mb-1">Complete onboarding first</p>
            <p className="text-sm text-muted-foreground">
              You need to finish your cleaner profile before setting service areas.
            </p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div
              className={`rounded-3xl border-2 ${rc.border} overflow-hidden`}
              style={{ background: "hsl(var(--card))" }}
            >
              <div className="p-5 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${rc.bg} flex items-center justify-center`}>
                    <Navigation className={`h-5 w-5 ${rc.text}`} />
                  </div>
                  <div>
                    <h2 className="font-bold text-base">Set Your Coverage Area</h2>
                    <p className="text-xs text-muted-foreground">Enter a location and choose your travel radius</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">City</Label>
                    <Input placeholder="e.g., Austin" value={city} onChange={e => setCity(e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">State</Label>
                    <Input placeholder="e.g., TX" value={stateVal} onChange={e => setStateVal(e.target.value)} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Zip Code <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span>
                  </Label>
                  <Input placeholder="e.g., 78701" value={zipCode} onChange={e => setZipCode(e.target.value)} className="rounded-xl" />
                </div>

                <div className="space-y-3 p-4 rounded-2xl border-2 border-success/30 bg-success/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-success" />
                      <Label className="font-semibold text-sm">Travel Radius</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-3xl font-black ${rc.text}`}>{radiusMi}</span>
                      <span className="text-sm text-muted-foreground">mi</span>
                      <Badge variant="secondary" className="text-xs">{getRadiusLabel(radiusMi)}</Badge>
                    </div>
                  </div>
                  <Slider
                    value={[radiusMi]}
                    onValueChange={([v]) => { setRadiusMi(v); setRadiusDirty(true); }}
                    min={5}
                    max={50}
                    step={5}
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>5 mi</span><span>50 mi</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Map className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label className="text-xs text-muted-foreground">
                      Coverage preview — shaded area = your {radiusMi}-mile zone
                    </Label>
                  </div>
                  <div className={`rounded-2xl overflow-hidden border-2 ${rc.border}`} style={{ height: 280 }}>
                    <RadiusMap lat={mapLat} lng={mapLng} radiusMiles={radiusMi} zones={savedZones} className="h-full" />
                  </div>
                </div>

                <Button
                  className={`w-full h-12 font-bold rounded-xl gap-2 transition-all ${
                    canSave
                      ? "bg-success hover:bg-success/90 text-white border-0 shadow-lg shadow-success/30"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted border-0"
                  }`}
                  onClick={handleSave}
                  disabled={!canSave}
                >
                  {saving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                  ) : (
                    <><Save className="h-4 w-4" />{(radiusDirty || hasInput) ? "Save Service Area" : "Saved ✓"}</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* SAVED ZONES */}
        {!loading && areas.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" /> Saved Zones
              <Badge variant="secondary" className="ml-1">{areas.length}</Badge>
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <AnimatePresence>
                {areas.map((area, i) => {
                  const rc2 = getRadiusColor(area.radius_miles || 10);
                  return (
                    <motion.div
                      key={area.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div
                        className={`rounded-2xl border-2 ${rc2.border} p-5 relative group hover:shadow-lg transition-all`}
                        style={{ background: "hsl(var(--card))" }}
                      >
                        <button
                          onClick={() => handleRemove(area.id)}
                          disabled={removingId === area.id}
                          className="absolute top-3 right-3 h-7 w-7 rounded-full bg-muted/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-destructive-foreground"
                        >
                          {removingId === area.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
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
      </div>
    </CleanerLayout>
  );
}
