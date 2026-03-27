
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProperties } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";
import { Plus, Building2, Home, MapPin, Bed, Bath, Trash2, Loader2, AreaChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

const f = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

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
      <div className="container px-3 sm:px-4 lg:px-6 max-w-5xl">
        {/* Hero */}
        <motion.div {...f(0)}>
          <div className="relative overflow-hidden rounded-3xl border-2 border-warning/50 p-6 sm:p-8 mb-6 sm:mb-8"
            style={{ background: "linear-gradient(135deg, hsl(var(--warning)/0.15) 0%, hsl(var(--warning)/0.05) 60%, hsl(var(--background)) 100%)" }}>
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: "hsl(var(--warning)/0.15)" }} />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-warning/20 border-2 border-warning/40 flex items-center justify-center">
                  <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-warning" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black">My Properties</h1>
                  <p className="text-muted-foreground mt-1">{(properties || []).length} propert{(properties || []).length === 1 ? 'y' : 'ies'} saved</p>
                </div>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" />Add Property</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="font-black">Add a Property</DialogTitle>
                    <DialogDescription>Save property details for quicker booking.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div><Label className="font-bold">Property Name *</Label><Input placeholder="Home, Office, Vacation House" value={label} onChange={(e) => setLabel(e.target.value)} className="rounded-xl border-2" /></div>
                    <div><Label className="font-bold">Address *</Label><Textarea placeholder="Full street address" value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-xl border-2" /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><Label className="font-bold">Bedrooms</Label><Input type="number" placeholder="3" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="rounded-xl border-2" /></div>
                      <div><Label className="font-bold">Bathrooms</Label><Input type="number" step="0.5" placeholder="2" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="rounded-xl border-2" /></div>
                      <div><Label className="font-bold">Sq. Ft.</Label><Input type="number" placeholder="1500" value={sqft} onChange={(e) => setSqft(e.target.value)} className="rounded-xl border-2" /></div>
                    </div>
                    <div><Label className="font-bold">Notes (optional)</Label><Textarea placeholder="Special instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-xl border-2" /></div>
                    <Button className="w-full rounded-xl" onClick={handleCreate} disabled={isCreating}>
                      {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Property
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map((i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}</div>
        ) : !properties || properties.length === 0 ? (
          <motion.div {...f(0.08)}>
            <div className="text-center py-20 rounded-3xl border-2 border-dashed border-border">
              <Building2 className="h-20 w-20 mx-auto text-warning/20 mb-6" />
              <h3 className="text-2xl font-black mb-3">No properties saved</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Add your properties to make booking cleanings faster and easier</p>
              <Button onClick={() => setDialogOpen(true)} size="lg"><Plus className="h-4 w-4 mr-2" />Add Your First Property</Button>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid md:grid-cols-2 gap-4">
              {properties.map((property, i) => {
                const Icon = getPropertyIcon(property.label);
                return (
                  <motion.div key={property.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                    <div className="rounded-3xl border-2 border-warning/30 hover:border-warning/50 hover:shadow-elevated transition-all duration-300 overflow-hidden group">
                      <div className="h-1.5 bg-gradient-to-r from-warning to-warning/60" />
                      <div className="p-5 sm:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-warning/10 border-2 border-warning/30 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-warning" />
                            </div>
                            <div>
                              <h3 className="font-black text-lg">{property.label || 'Property'}</h3>
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
                          {property.bedrooms && <Badge className="gap-1 border-2 border-border bg-muted font-bold text-xs"><Bed className="h-3 w-3" />{property.bedrooms} bed</Badge>}
                          {property.bathrooms && <Badge className="gap-1 border-2 border-border bg-muted font-bold text-xs"><Bath className="h-3 w-3" />{property.bathrooms} bath</Badge>}
                          {property.square_feet && <Badge className="border-2 border-border bg-muted font-bold text-xs">{property.square_feet.toLocaleString()} sq ft</Badge>}
                        </div>

                        {property.notes && <p className="text-sm text-muted-foreground line-clamp-2 mb-4 bg-muted/30 p-3 rounded-xl border-2 border-border/30">{property.notes}</p>}

                        <Button asChild className="w-full gap-2 rounded-xl">
                          <Link to={`/book?property=${property.id}`}><Plus className="h-4 w-4" />Book Cleaning Here</Link>
                        </Button>
                      </div>
                    </div>
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
