import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { useCleanerServiceAreas, useCities } from "@/hooks/useServiceAreas";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, Trash2, Navigation, Building2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function CleanerServiceAreas() {
  const { toast } = useToast();
  const { profile } = useCleanerProfile();
  const { serviceAreas, isLoading, addServiceArea, removeServiceArea } = useCleanerServiceAreas();
  const { cities, isLoading: loadingCities } = useCities();
  const isAdding = addServiceArea.isPending;
  const isRemoving = removeServiceArea.isPending;
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [radius, setRadius] = useState(10);

  const handleAddArea = async () => {
    if (!city.trim() && !zipCode.trim()) {
      toast({ title: "Please enter a city or zip code", variant: "destructive" });
      return;
    }

    try {
      await addServiceArea.mutateAsync({ city, state, zip_code: zipCode, radius_miles: radius });
      toast({ title: "Service area added!" });
      setDialogOpen(false);
      setCity("");
      setState("");
      setZipCode("");
      setRadius(10);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Service Areas</h1>
            <p className="text-muted-foreground mt-1">Manage where you're available to work</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Area
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Service Area</DialogTitle>
                <DialogDescription>
                  Define a new area where you're willing to take jobs.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      placeholder="e.g., Austin"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      placeholder="e.g., TX"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Or Zip Code</Label>
                  <Input
                    placeholder="e.g., 78701"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Service Radius: {radius} miles</Label>
                  <Slider
                    value={[radius]}
                    onValueChange={([val]) => setRadius(val)}
                    min={5}
                    max={50}
                    step={5}
                    className="mt-2"
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleAddArea}
                  disabled={isAdding}
                >
                  {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Service Area
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Current Service Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Your Service Areas
            </CardTitle>
            <CardDescription>
              Jobs within these areas will be shown in your marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
              </div>
            ) : serviceAreas.length > 0 ? (
              <div className="space-y-3">
                {serviceAreas.map((area) => (
                  <div 
                    key={area.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {area.city && area.state 
                            ? `${area.city}, ${area.state}` 
                            : area.zip_code || 'Custom Area'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {area.radius_miles || 10} mile radius
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveArea(area.id)}
                      disabled={isRemoving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No service areas defined</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add areas where you want to receive job offers
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Platform Cities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-violet-500" />
              Platform Cities
            </CardTitle>
            <CardDescription>
              Cities where the platform is currently active
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCities ? (
              <Skeleton className="h-20 rounded-lg" />
            ) : cities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {cities.filter(c => c.is_active).map((city) => (
                  <Badge key={city.id} variant="secondary" className="py-2 px-3">
                    {city.name}, {city.state_region || city.country_code}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No platform cities configured yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </CleanerLayout>
  );
}
