import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProperties } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";
import { Plus, Building2, Home, MapPin, Bed, Bath, Edit2, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Properties() {
  const { toast } = useToast();
  const { properties, isLoading, addProperty, deleteProperty } = useProperties();
  const isCreating = addProperty.isPending;
  const isDeleting = deleteProperty.isPending;
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [sqft, setSqft] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = async () => {
    if (!label.trim() || !address.trim()) {
      toast({ title: "Name and address required", variant: "destructive" });
      return;
    }

    try {
      await addProperty.mutateAsync({ 
        label, 
        address_line1: address,
        city: "Unknown",
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseFloat(bathrooms) : null,
        square_feet: sqft ? parseInt(sqft) : null,
        notes,
      });
      toast({ title: "Property added!" });
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Failed to add property", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (propertyId: number) => {
    try {
      await deleteProperty.mutateAsync(propertyId);
      toast({ title: "Property removed" });
    } catch (error: any) {
      toast({ title: "Failed to remove", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setLabel("");
    setAddress("");
    setBedrooms("");
    setBathrooms("");
    setSqft("");
    setNotes("");
  };

  return (
    <main className="flex-1 py-8">
      <div className="container max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Properties</h1>
            <p className="text-muted-foreground mt-1">Manage your saved addresses and property details</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add a Property</DialogTitle>
                <DialogDescription>
                  Save property details for quicker booking in the future.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Property Name</Label>
                  <Input
                    placeholder="e.g., Home, Office, Vacation House"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Textarea
                    placeholder="Full street address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Bedrooms</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 3"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Bathrooms</Label>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="e.g., 2.5"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Sq. Ft.</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 1500"
                      value={sqft}
                      onChange={(e) => setSqft(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea
                    placeholder="Any special instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Property
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : properties.length > 0 ? (
          <div className="space-y-4">
            {properties.map((property) => (
              <Card key={property.id} className="hover:shadow-elevated transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        {property.label?.toLowerCase().includes('office') ? (
                          <Building2 className="h-7 w-7 text-primary" />
                        ) : (
                          <Home className="h-7 w-7 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{property.label || 'Property'}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {property.address_line1 || 'No address'}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          {property.bedrooms && (
                            <Badge variant="secondary" className="gap-1">
                              <Bed className="h-3 w-3" />
                              {property.bedrooms} bed
                            </Badge>
                          )}
                          {property.bathrooms && (
                            <Badge variant="secondary" className="gap-1">
                              <Bath className="h-3 w-3" />
                              {property.bathrooms} bath
                            </Badge>
                          )}
                          {property.square_feet && (
                            <Badge variant="secondary">
                              {property.square_feet.toLocaleString()} sq ft
                            </Badge>
                          )}
                        </div>
                        {property.notes && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {property.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(property.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold mb-2">No properties saved</h3>
              <p className="text-muted-foreground mb-6">
                Add your properties to make booking cleanings faster
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
