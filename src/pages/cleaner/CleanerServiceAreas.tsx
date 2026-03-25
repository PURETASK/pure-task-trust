import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { useCleanerServiceAreas, useCities } from "@/hooks/useServiceAreas";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, Trash2, Navigation, Building2, Loader2, Circle, CheckCircle, Map } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import RadiusMap from "@/components/booking/RadiusMap";

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

  return (
    <CleanerLayout>
      <div className="space-y-8 max-w-3xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Service Areas</h1>
            <p className="text-muted-foreground mt-1">Define where you're available to work</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2">
                <Plus className="h-4 w-4" />
                Add Area
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add Service Area</DialogTitle>
                <DialogDescription>Define a new area where you're willing to accept jobs.</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Input placeholder="e.g., Austin" value={city} onChange={e => setCity(e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>State</Label>
                    <Input placeholder="e.g., TX" value={state} onChange={e => setState(e.target.value)} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Or Zip Code</Label>
                  <Input placeholder="e.g., 78701" value={zipCode} onChange={e => setZipCode(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Service Radius</Label>
                    <Badge variant="secondary" className="font-mono">{radius} mi</Badge>
                  </div>
                  <Slider value={[radius]} onValueChange={([val]) => setRadius(val)} min={5} max={50} step={5} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5 miles</span><span>50 miles</span>
                  </div>
                </div>
                {/* Interactive radius preview map */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Coverage preview</Label>
                  <div className="rounded-xl overflow-hidden border border-border/60" style={{ height: 200 }}>
                    <RadiusMap radiusMiles={radius} className="h-full" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    The shaded area shows your {radius}-mile coverage zone
                  </p>
                </div>
                <Button className="w-full rounded-xl" onClick={handleAddArea} disabled={isAdding}>
                  {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Service Area
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Coverage Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Active Areas", value: serviceAreas.length, icon: MapPin, color: "text-primary" },
              { label: "Max Radius", value: serviceAreas.length > 0 ? `${Math.max(...serviceAreas.map(a => a.radius_miles || 10))} mi` : "—", icon: Circle, color: "text-success" },
              { label: "Platform Cities", value: cities.filter(c => c.is_active).length, icon: Building2, color: "text-warning" },
            ].map((stat, i) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="p-4">
                  <stat.icon className={`h-5 w-5 mx-auto mb-1.5 ${stat.color}`} />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Your Service Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Your Service Areas
            </CardTitle>
            <CardDescription>Jobs within these areas will appear in your marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : serviceAreas.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {serviceAreas.map((area, i) => (
                    <motion.div
                      key={area.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {area.city && area.state
                              ? `${area.city}, ${area.state}`
                              : area.zip_code || "Custom Area"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-xs h-5">
                              {area.radius_miles || 10} mile radius
                            </Badge>
                            <Badge variant="outline" className="text-xs h-5 text-success border-success/30">
                              <CheckCircle className="h-2.5 w-2.5 mr-1" />Active
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => handleRemoveArea(area.id)}
                        disabled={isRemoving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Map className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="font-semibold text-muted-foreground mb-1">No service areas defined</p>
                <p className="text-sm text-muted-foreground mb-4">Add areas where you want to receive job offers</p>
                <Button variant="outline" className="rounded-xl" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />Add Your First Area
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Cities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-warning" />
              Platform Cities
            </CardTitle>
            <CardDescription>Cities where PureTask is currently active</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCities ? (
              <Skeleton className="h-20 rounded-xl" />
            ) : cities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {cities.filter(c => c.is_active).map(c => (
                  <motion.div key={c.id} whileHover={{ scale: 1.02 }}>
                    <Badge variant="secondary" className="py-1.5 px-3 gap-1.5 cursor-default">
                      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      {c.name}{c.state_region ? `, ${c.state_region}` : ""}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No platform cities configured yet</p>
            )}
          </CardContent>
        </Card>

      </div>
    </CleanerLayout>
  );
}
