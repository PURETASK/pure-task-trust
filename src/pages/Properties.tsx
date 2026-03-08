
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
import { Plus, Building2, Home, MapPin, Bed, Bath, Edit2, Trash2, Loader2, AreaChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

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
    if (!label.trim() || !address.trim()) { toast({ title: "Name and address required", variant: "destructive" }); return; }
    try {
      await addProperty.mutateAsync({ label, address_line1: address, city: "Unknown", bedrooms: bedrooms ? parseInt(bedrooms) : null, bathrooms: bathrooms ? parseFloat(bathrooms) : null, square_feet: sqft ? parseInt(sqft) : null, notes });
      toast({ title: "Property added!" });
      setDialogOpen(false);
      setLabel(""); setAddress(""); setBedrooms(""); setBathrooms(""); setSqft(""); setNotes("");
    } catch (error: any) { toast({ title: "Failed to add property", description: error.message, variant: "destructive" }); }
  };

  const handleDelete = async (id: number) => {
    try { await deleteProperty.mutateAsync(id); toast({ title: "Property removed" }); }
    catch (error: any) { toast({ title: "Failed to remove", description: error.message, variant: "destructive" }); }
  };

  const getPropertyIcon = (label?: string | null) => {
    if (!label) return Home;
    if (label.toLowerCase().includes('office') || label.toLowerCase().includes('work')) return Building2;
    if (label.toLowerCase().includes('airbnb') || label.toLowerCase().includes('rental')) return AreaChart;
    return Home;
  };

  return (
    <main className="flex-1 py-8">
      <div className="container max-w-5xl">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-primary/5 to-rose-500/10 border border-amber-500/20 p-8 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -translate-y-32 translate-x-32" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">My Properties</h1>
                <p className="text-muted-foreground mt-1">{(properties || []).length} property saved</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40">
                  <Plus className="h-4 w-4" />Add Property
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add a Property</DialogTitle>
                  <DialogDescription>Save property details for quicker booking in the future.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div><Label>Property Name *</Label><Input placeholder="Home, Office, Vacation House" value={label} onChange={(e) => setLabel(e.target.value)} /></div>
                  <div><Label>Address *</Label><Textarea placeholder="Full street address" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Bedrooms</Label><Input type="number" placeholder="3" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} /></div>
                    <div><Label>Bathrooms</Label><Input type="number" step="0.5" placeholder="2" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} /></div>
                    <div><Label>Sq. Ft.</Label><Input type="number" placeholder="1500" value={sqft} onChange={(e) => setSqft(e.target.value)} /></div>
                  </div>
                  <div><Label>Notes (optional)</Label><Textarea placeholder="Special instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
                  <Button className="w-full" onClick={handleCreate} disabled={isCreating}>
                    {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Property
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
        ) : !properties || properties.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="text-center py-20 border-dashed border-2">
              <CardContent>
                <Building2 className="h-20 w-20 mx-auto text-amber-500/20 mb-6" />
                <h3 className="text-2xl font-bold mb-3">No properties saved</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Add your properties to make booking cleanings faster and easier</p>
                <Button onClick={() => setDialogOpen(true)} size="lg"><Plus className="h-4 w-4 mr-2" />Add Your First Property</Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid md:grid-cols-2 gap-4">
              {properties.map((property, i) => {
                const Icon = getPropertyIcon(property.label);
                return (
                  <motion.div key={property.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                    <Card className="overflow-hidden hover:shadow-elevated transition-all duration-300 border-border/60 group">
                      <CardContent className="p-0">
                        <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                              <div className="h-14 w-14 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                <Icon className="h-7 w-7 text-amber-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg">{property.label || 'Property'}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="h-3.5 w-3.5" />{property.address_line1 || 'No address'}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all" onClick={() => handleDelete(property.id)} disabled={isDeleting}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap mb-4">
                            {property.bedrooms && <Badge variant="secondary" className="gap-1"><Bed className="h-3 w-3" />{property.bedrooms} bed</Badge>}
                            {property.bathrooms && <Badge variant="secondary" className="gap-1"><Bath className="h-3 w-3" />{property.bathrooms} bath</Badge>}
                            {property.square_feet && <Badge variant="secondary">{property.square_feet.toLocaleString()} sq ft</Badge>}
                          </div>

                          {property.notes && <p className="text-sm text-muted-foreground line-clamp-2 mb-4 bg-muted/30 p-3 rounded-lg">{property.notes}</p>}

                          <Button asChild className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80">
                            <Link to={`/book?property=${property.id}`}><Plus className="h-4 w-4" />Book Cleaning Here</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
