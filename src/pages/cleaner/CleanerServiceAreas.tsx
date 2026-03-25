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
  MapPin, Plus, Trash2, Navigation, Building2, Loader2,
  CheckCircle, Map, Globe, Target, Crosshair, Layers, X
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import RadiusMap from "@/components/booking/RadiusMap";

const RADIUS_COLOR: Record<number, { ring: string; glow: string; label: string }> = {
  5:  { ring: "border-success/70",  glow: "shadow-success/20",  label: "Hyper local" },
  10: { ring: "border-primary/70",  glow: "shadow-primary/20",  label: "Local"       },
  15: { ring: "border-primary/70",  glow: "shadow-primary/20",  label: "Nearby"      },
  20: { ring: "border-warning/70",  glow: "shadow-warning/20",  label: "Mid-range"   },
  25: { ring: "border-warning/70",  glow: "shadow-warning/20",  label: "Wide"        },
  30: { ring: "border-[hsl(280,70%,55%)]/70", glow: "shadow-[hsl(280,70%,55%)]/20", label: "Regional" },
  35: { ring: "border-[hsl(280,70%,55%)]/70", glow: "shadow-[hsl(280,70%,55%)]/20", label: "Regional" },
  40: { ring: "border-destructive/70", glow: "shadow-destructive/20", label: "Extended" },
  45: { ring: "border-destructive/70", glow: "shadow-destructive/20", label: "Extended" },
  50: { ring: "border-destructive/70", glow: "shadow-destructive/20", label: "Max range" },
};

function getRadiusStyle(r: number) {
  return RADIUS_COLOR[r] || RADIUS_COLOR[10];
}

export default function CleanerServiceAreas() {
  const { toast } = useToast();
  const { serviceAreas, isLoading, addServiceArea, removeServiceArea } = useCleanerServiceAreas();
  const { cities, isLoading: loadingCities } = useCities();
  const isAdding = addServiceArea.isPending;
  const isRemoving = removeServiceArea.isPending;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [radius, setRadius] = useState(10);
  const [previewRadius, setPreviewRadius] = useState(10);

  const handleAddArea = async () => {
    if (!city.trim() && !zipCode.trim()) {
      toast({ title: "Please enter a city or zip code", variant: "destructive" });
      return;
    }
    try {
      await addServiceArea.mutateAsync({ city, state, zip_code: zipCode, radius_miles: radius, latitude: null, longitude: null });
      toast({ title: "Service area added!" });
      setDialogOpen(false);
      setCity(""); setState(""); setZipCode(""); setRadius(10);
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

  const totalCoverage = serviceAreas.reduce((acc, a) => acc + Math.PI * Math.pow(a.radius_miles || 10, 2), 0);

  return (
    <CleanerLayout>
      <div className="space-y-6 max-w-4xl">

        {/* ── HERO HEADER ──────────────────────────────────────────── */}
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
                <p className="text-white/60 text-sm">Define where you're available to work and attract more jobs</p>
              </div>

              {/* Stats strip */}
              <div className="flex gap-3 flex-wrap">
                {[
                  { icon: MapPin, value: serviceAreas.length, label: "Areas", color: "bg-white/10 border-white/20" },
                  { icon: Target, value: serviceAreas.length > 0 ? `${Math.max(...serviceAreas.map(a => a.radius_miles || 10))} mi` : "—", label: "Max Radius", color: "bg-white/10 border-white/20" },
                  { icon: Building2, value: cities.filter(c => c.is_active).length, label: "Cities", color: "bg-white/10 border-white/20" },
                ].map(s => (
                  <div key={s.label} className={`rounded-2xl border ${s.color} px-4 py-3 text-white backdrop-blur-sm text-center min-w-[80px]`}>
                    <s.icon className="h-4 w-4 mx-auto mb-1 text-white/60" />
                    <p className="text-xl font-bold leading-none">{s.value}</p>
                    <p className="text-white/50 text-[11px] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Area button inside hero */}
            <div className="relative mt-5">
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
                        <Input placeholder="e.g., Austin" value={city} onChange={e => setCity(e.target.value)} className="rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">State</Label>
                        <Input placeholder="e.g., TX" value={state} onChange={e => setState(e.target.value)} className="rounded-xl" />
                      </div>
                    </div>

                    {/* Zip */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Or Zip Code</Label>
                      <Input placeholder="e.g., 78701" value={zipCode} onChange={e => setZipCode(e.target.value)} className="rounded-xl" />
                    </div>

                    {/* Radius picker */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Service Radius</Label>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono font-bold">{radius} mi</Badge>
                          <span className="text-xs text-muted-foreground">{getRadiusStyle(radius).label}</span>
                        </div>
                      </div>
                      <Slider value={[radius]} onValueChange={([val]) => setRadius(val)} min={5} max={50} step={5} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5 mi — local</span><span>50 mi — extended</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Button
                      className="w-full rounded-xl h-11 font-bold gap-2"
                      onClick={handleAddArea}
                      disabled={isAdding}
                    >
                      {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      {isAdding ? "Adding…" : "Add Service Area"}
                    </Button>

                    {/* Map preview — after button so form always visible first */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2">
                        <Map className="h-3.5 w-3.5 text-muted-foreground" />
                        <Label className="text-xs text-muted-foreground">Coverage preview — {radius}-mile zone</Label>
                      </div>
                      <div className="rounded-xl overflow-hidden border-2 border-border/50" style={{ height: 220 }}>
                        <RadiusMap radiusMiles={radius} className="h-full" />
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {/* ── LIVE RADIUS EXPLORER ─────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="rounded-3xl border-2 border-primary/60 overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(210,100%,50%/0.06), hsl(210,100%,50%/0.02))" }}>
            <div className="p-5 border-b border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Navigation className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base">Coverage Explorer</h2>
                    <p className="text-xs text-muted-foreground">Drag the slider to see your travel zone</p>
                  </div>
                </div>
                <Badge className="bg-primary/15 text-primary border-primary/30 border font-mono font-bold text-base px-4 py-1.5">
                  {previewRadius} mi
                </Badge>
              </div>
              <div className="mt-4 space-y-1">
                <Slider value={[previewRadius]} onValueChange={([v]) => setPreviewRadius(v)} min={5} max={50} step={5} />
                <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                  {[5,10,15,20,25,30,35,40,45,50].map(v => (
                    <button key={v} onClick={() => setPreviewRadius(v)}
                      className={`text-[10px] font-bold transition-colors ${v === previewRadius ? 'text-primary' : 'text-muted-foreground/50 hover:text-muted-foreground'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ height: 280 }}>
              <RadiusMap radiusMiles={previewRadius} className="h-full" />
            </div>
            <div className="px-5 py-3 bg-primary/5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Blue shaded zone = your coverage from base location</span>
              <span className="text-xs font-semibold text-primary">{getRadiusStyle(previewRadius).label}</span>
            </div>
          </div>
        </motion.div>

        {/* ── YOUR SERVICE AREAS GRID ──────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
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
              {[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
          ) : serviceAreas.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3">
              <AnimatePresence>
                {serviceAreas.map((area, i) => {
                  const rs = getRadiusStyle(area.radius_miles || 10);
                  return (
                    <motion.div
                      key={area.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className={`rounded-2xl border-2 ${rs.ring} p-5 relative group hover:shadow-lg transition-all duration-200`}
                        style={{ background: "hsl(var(--card))" }}>
                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveArea(area.id)}
                          disabled={isRemoving}
                          className="absolute top-3 right-3 h-7 w-7 rounded-full bg-muted/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>

                        <div className="flex items-start gap-4">
                          {/* Radius ring visual */}
                          <div className="relative shrink-0">
                            <div className={`h-14 w-14 rounded-full border-4 ${rs.ring} flex items-center justify-center`}
                              style={{ background: "hsl(var(--muted)/0.5)" }}>
                              <div className="text-center">
                                <p className="text-sm font-black leading-none">{area.radius_miles || 10}</p>
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
                                : area.zip_code ? `ZIP ${area.zip_code}` : "Custom Area"}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <Badge variant="outline" className="text-[11px] h-5 border-success/40 text-success">
                                Active
                              </Badge>
                              <span className="text-xs text-muted-foreground">{rs.label}</span>
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
              <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">Add your first service area to start receiving job matches in your area</p>
              <Button className="gap-2 rounded-xl" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" /> Add Your First Area
              </Button>
            </div>
          )}
        </motion.div>

        {/* ── PLATFORM CITIES ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
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
