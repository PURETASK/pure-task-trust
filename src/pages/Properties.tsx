import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProperties } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";
import { Plus, Building2, Home, MapPin, Bed, Bath, Trash2, Loader2, AreaChart, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const f = (delay = 0) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.3 } });

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
    <main className="flex-1 bg-background min-h-screen">
      <Helmet><title>Saved Properties | PureTask</title></Helmet>
      <div className="container px-4 sm:px-6 py-5 sm:py-8 max-w-3xl">
        {/* Back */}
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 rounded-xl" asChild>
          <Link to="/account"><ArrowLeft className="mr-1 h-4 w-4" /> Account</Link>
        </Button>

        {/* Header */}
        <motion.div {...f(0)} className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-[hsl(var(--pt-aqua))]/10 border-2 border-[hsl(var(--pt-aqua))]/30 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(var(--pt-aqua))]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Saved Properties</h1>
              <p className="text-muted-foreground text-sm">{(properties || []).length} propert{(properties || []).length === 1 ? 'y' : 'ies'} saved</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5 rounded-xl"><Plus className="h-4 w-4" /> Add</Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-black">Add a Property</DialogTitle>
                <DialogDescription>Save property details for quicker booking.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div><Label className="font-bold text-sm">Property Name *</Label><Input placeholder="Home, Office, Vacation House" value={label} onChange={(e) => setLabel(e.target.value)} className="rounded-xl border-2 mt-1.5" /></div>
                <div><Label className="font-bold text-sm">Address *</Label><Textarea placeholder="Full street address" value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-xl border-2 mt-1.5" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="font-bold text-sm">Bedrooms</Label><Input type="number" placeholder="3" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="rounded-xl border-2 mt-1.5" /></div>
                  <div><Label className="font-bold text-sm">Bathrooms</Label><Input type="number" step="0.5" placeholder="2" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="rounded-xl border-2 mt-1.5" /></div>
                  <div><Label className="font-bold text-sm">Sq. Ft.</Label><Input type="number" placeholder="1500" value={sqft} onChange={(e) => setSqft(e.target.value)} className="rounded-xl border-2 mt-1.5" /></div>
                </div>
                <div><Label className="font-bold text-sm">Notes (optional)</Label><Textarea placeholder="Special instructions, access codes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-xl border-2 mt-1.5" /></div>
                <Button className="w-full rounded-xl" onClick={handleCreate} disabled={isCreating}>
                  {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Property
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
        ) : !properties || properties.length === 0 ? (
          <motion.div {...f(0.04)}>
            <div className="text-center py-16 rounded-3xl border-2 border-dashed border-border/40">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="font-bold text-lg">No properties saved</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">Add your properties to make booking cleanings faster and easier.</p>
              <Button onClick={() => setDialogOpen(true)} size="sm" className="mt-4 rounded-xl gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Your First Property
              </Button>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {properties.map((property, i) => {
                const Icon = getPropertyIcon(property.label);
                return (
                  <motion.div key={property.id} {...f(0.04 + i * 0.03)}>
                    <div className="rounded-2xl border-2 border-border/40 hover:border-[hsl(var(--pt-aqua))]/30 hover:shadow-card transition-all overflow-hidden group">
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="h-11 w-11 rounded-xl bg-[hsl(var(--pt-aqua))]/10 border-2 border-[hsl(var(--pt-aqua))]/30 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-5 w-5 text-[hsl(var(--pt-aqua))]" />
                            </div>
                            <div>
                              <h3 className="font-bold">{property.label || 'Property'}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" />{property.address_line1 || 'No address'}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap mt-2">
                                {property.bedrooms && <Badge variant="outline" className="text-[10px] h-5 gap-1 border-2"><Bed className="h-3 w-3" />{property.bedrooms} bed</Badge>}
                                {property.bathrooms && <Badge variant="outline" className="text-[10px] h-5 gap-1 border-2"><Bath className="h-3 w-3" />{property.bathrooms} bath</Badge>}
                                {property.square_feet && <Badge variant="outline" className="text-[10px] h-5 border-2">{property.square_feet.toLocaleString()} sqft</Badge>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-all" onClick={() => handleDelete(property.id)} disabled={isDeleting}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        {property.notes && <p className="text-xs text-muted-foreground mt-3 bg-muted/50 p-2.5 rounded-xl border border-border/40 line-clamp-2">{property.notes}</p>}
                        <Button asChild size="sm" className="w-full mt-3 rounded-xl gap-1.5">
                          <Link to={`/book?property=${property.id}`}><Plus className="h-3.5 w-3.5" /> Book Cleaning Here</Link>
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
