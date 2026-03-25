import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { useCleanerServiceAreas, useCities } from "@/hooks/useServiceAreas";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin, Plus, Navigation, Building2, Loader2,
  CheckCircle, Map, Globe, Target, Crosshair, Layers, X,
  Save, Radio
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import RadiusMap from "@/components/booking/RadiusMap";

const RADIUS_STEPS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

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
    serviceAreas, isLoading,
    addServiceArea, removeServiceArea,
    travelRadius, updateTravelRadius
  } = useCleanerServiceAreas();
  const { cities, isLoading: loadingCities } = useCities();

  const isAdding   = addServiceArea.isPending;
  const isRemoving = removeServiceArea.isPending;
  const isSavingRadius = updateTravelRadius.isPending;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [city, setCity]     = useState("");
  const [state, setState]   = useState("");
  const [zipCode, setZipCode] = useState("");
  const [areaRadius, setAreaRadius] = useState(10);

  // Travel radius in miles (convert from km stored in DB: 1 km ≈ 0.621371 mi)
  const storedMiles = travelRadius ? Math.round((travelRadius as number) * 0.621371) : 15;
  const [globalRadius, setGlobalRadius] = useState<number>(storedMiles);
  const [radiusDirty, setRadiusDirty]   = useState(false);

  const handleRadiusChange = (val: number) => {
    setGlobalRadius(val);
    setRadiusDirty(true);
  };

  const handleSaveRadius = async () => {
    const km = Math.round(globalRadius / 0.621371);
    try {
      await updateTravelRadius.mutateAsync(km);
      setRadiusDirty(false);
      toast({ title: "Travel radius saved!", description: `Set to ${globalRadius} miles` });
    } catch (err: any) {
      toast({ title: "Failed to save radius", description: err.message, variant: "destructive" });
    }
  };

  const handleAddArea = async () => {
    if (!city.trim() && !zipCode.trim()) {
      toast({ title: "Please enter a city or zip code", variant: "destructive" });
      return;
    }
    try {
      await addServiceArea.mutateAsync({
        city: city.trim() || null,
        state: state.trim() || null,
        zip_code: zipCode.trim() || null,
        radius_miles: areaRadius,
        latitude: null,
        longitude: null,
      });
      toast({ title: "Service area added!" });
      setDialogOpen(false);
      setCity(""); setState(""); setZipCode(""); setAreaRadius(10);
    } catch (error: any) {
      toast({ title: "Failed to add area", description: error.message, variant: "destructive" });
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

  return (
    <CleanerLayout>
      <div className="space-y-6 max-w-4xl">

        {/* ── HERO HEADER ──────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative overflow-hidden rounded-3xl p-7"
            style={{
              background: "linear-gradient(135deg, hsl(210,100%,18%) 0%, hsl(210,100%,32%) 60%, hsl(145,65%,28%) 100%)",
              boxShadow: "0 16px 48px -8px hsl(210,100%,30%/0.45)"
            }}>
            <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full blur-3xl opacity-20"
              style={{ background: "hsl(145,65%,47%)" }} />
            <div className="absolute bottom-0 left-20 w-40 h-40 rounded-full blur-3xl opacity-15"
              style={{ background: "hsl(190,100%,50%)" }} />

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-white/60" />
                  <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Coverage Map</span>
                </div>
                <h1 className="text-4xl font-black text-white leading-none mb-2">Service Areas</h1>
                <p className="text-white/60 text-sm">Define where you're available to work</p>
              </div>

              <div className="flex gap-3 flex-wrap">
                {[
                  { icon: MapPin, value: serviceAreas.length, label: "Zones" },
                  { icon: Target, value: `${globalRadius} mi`, label: "Travel Radius" },
                  { icon: Building2, value: cities.filter(c => c.is_active).length, label: "Cities" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm text-center min-w-[80px]">
                    <s.icon className="h-4 w-4 mx-auto mb-1 text-white/60" />
                    <p className="text-xl font-bold leading-none">{s.value}</p>
                    <p className="text-white/50 text-[11px] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-5 flex gap-3">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-white text-primary hover:bg-white/90 font-bold rounded-xl h-11 px-6 shadow-lg">
                    <Plus className="h-4 w-4" /> Add New Area
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Crosshair className="h-5 w-5 text-primary" /> Add Service Area
                    </DialogTitle>
                    <DialogDescription>Define where you want to accept cleaning jobs.</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-5 pt-1">
                    {/* City + State */}
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

                    {/* Zip */}
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

                    {/* Radius picker */}
                    <div className="space-y-3 p-4 rounded-2xl border-2 border-success/30 bg-success/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Radio className="h-4 w-4 text-success" />
                          <Label className="font-semibold text-sm">Area Radius</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-success">{areaRadius}</span>
                          <span className="text-sm text-muted-foreground">mi</span>
                          <Badge variant="secondary" className="text-xs">{getRadiusLabel(areaRadius)}</Badge>
                        </div>
                      </div>
                      <Slider
                        value={[areaRadius]}
                        onValueChange={([val]) => setAreaRadius(val)}
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
                        <Label className="text-xs text-muted-foreground">Coverage preview — {areaRadius}-mile zone</Label>
                      </div>
                      <div className="rounded-xl overflow-hidden border-2 border-border/50" style={{ height: 200 }}>
                        <RadiusMap radiusMiles={areaRadius} className="h-full" />
                      </div>
                    </div>

                    {/* CTA */}
                    <Button
                      className="w-full rounded-xl h-12 font-bold gap-2 bg-success hover:bg-success/90 text-white border-0"
                      onClick={handleAddArea}
                      disabled={isAdding || (!city.trim() && !zipCode.trim())}
                    >
                      {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      {isAdding ? "Adding…" : "Save Service Area"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {/* ── GLOBAL TRAVEL RADIUS ─────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <div className={`rounded-3xl border-2 ${rc.border} overflow-hidden`}
            style={{ background: "hsl(var(--card))" }}>
            <div className="p-5 border-b border-border/40">
              <div className="flex items-center gap-3 mb-1">
                <div className={`h-10 w-10 rounded-xl ${rc.bg} flex items-center justify-center`}>
                  <Navigation className={`h-5 w-5 ${rc.text}`} />
                </div>
                <div>
                  <h2 className="font-bold text-base">Global Travel Radius</h2>
                  <p className="text-xs text-muted-foreground">How far you're willing to travel from your base</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className={`text-3xl font-black ${rc.text}`}>{globalRadius}</span>
                  <span className="text-sm text-muted-foreground">mi</span>
                  <Badge variant="secondary" className="text-xs">{getRadiusLabel(globalRadius)}</Badge>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <Slider
                value={[globalRadius]}
                onValueChange={([v]) => handleRadiusChange(v)}
                min={5} max={50} step={5}
              />
              <div className="flex justify-between">
                {RADIUS_STEPS.map(v => (
                  <button
                    key={v}
                    onClick={() => handleRadiusChange(v)}
                    className={`text-[11px] font-bold transition-colors px-1 ${v === globalRadius ? rc.text : 'text-muted-foreground/50 hover:text-muted-foreground'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {/* Map */}
              <div className={`rounded-2xl overflow-hidden border-2 ${rc.border}`} style={{ height: 250 }}>
                <RadiusMap radiusMiles={globalRadius} className="h-full" />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Blue zone = your {globalRadius}-mile coverage area
              </p>

              {/* Save button — always visible, highlighted when dirty */}
              <Button
                className={`w-full h-12 font-bold rounded-xl gap-2 transition-all ${
                  radiusDirty
                    ? "bg-success hover:bg-success/90 text-white border-0 shadow-lg shadow-success/30"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted border-0"
                }`}
                onClick={handleSaveRadius}
                disabled={isSavingRadius || !radiusDirty}
              >
                {isSavingRadius
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                  : <><Save className="h-4 w-4" />{radiusDirty ? "Save Travel Radius" : "Radius Saved ✓"}</>
                }
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── YOUR SERVICE AREAS GRID ──────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Your Coverage Zones
              {serviceAreas.length > 0 && (
                <Badge variant="secondary" className="ml-1">{serviceAreas.length}</Badge>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
          ) : serviceAreas.length > 0 ? (
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
                          <div className="relative shrink-0">
                            <div className={`h-14 w-14 rounded-full border-4 ${rc2.border} flex items-center justify-center ${rc2.bg}`}>
                              <div className="text-center">
                                <p className={`text-sm font-black leading-none ${rc2.text}`}>{area.radius_miles || 10}</p>
                                <p className="text-[9px] text-muted-foreground">mi</p>
                              </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-white" />
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
                            <p className="text-xs text-muted-foreground mt-1">
                              ~{Math.round(Math.PI * Math.pow(area.radius_miles || 10, 2)).toLocaleString()} sq mi coverage
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-muted-foreground/20 py-16 text-center">
              <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-5">
                <Map className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <p className="font-bold text-lg text-muted-foreground mb-1">No zones defined yet</p>
              <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
                Add your first service area to start receiving job matches
              </p>
              <Button className="gap-2 rounded-xl" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" /> Add Your First Area
              </Button>
            </div>
          )}
        </motion.div>

        {/* ── PLATFORM CITIES ──────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <div className="rounded-3xl border-2 border-warning/50 p-6"
            style={{ background: "linear-gradient(135deg, hsl(38,95%,55%/0.06), transparent)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-warning/15 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h2 className="font-bold">Active Platform Cities</h2>
                <p className="text-xs text-muted-foreground">Cities where PureTask is currently live</p>
              </div>
            </div>
            {loadingCities ? (
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
              </div>
            ) : cities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {cities.filter(c => c.is_active).map(c => (
                  <motion.div key={c.id} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <div className="flex items-center gap-2 border-2 border-warning/40 bg-warning/10 rounded-full px-4 py-1.5">
                      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      <span className="text-sm font-semibold">{c.name}{c.state_region ? `, ${c.state_region}` : ""}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No platform cities configured yet</p>
            )}
          </div>
        </motion.div>

      </div>
    </CleanerLayout>
  );
}
