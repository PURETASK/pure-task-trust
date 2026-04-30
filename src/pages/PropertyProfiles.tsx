import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { usePropertyProfiles } from "@/hooks/usePropertyProfiles";
import { Home, Plus, PawPrint, Car, Key, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function PropertyProfiles() {
  const { properties, isLoading, createProperty, updateProperty, deleteProperty } = usePropertyProfiles();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', has_pets: false,
    pet_info: '', access_instructions: '', parking_notes: '', special_notes: '',
  });

  const handleCreate = async () => {
    await createProperty.mutateAsync({
      name: form.name || 'My Property',
      has_pets: form.has_pets,
      pet_info: form.pet_info || undefined,
      access_instructions: form.access_instructions || undefined,
      parking_notes: form.parking_notes || undefined,
      special_notes: form.special_notes || undefined,
    });
    toast.success('Property added');
    setOpen(false);
    setForm({ name: '', has_pets: false, pet_info: '', access_instructions: '', parking_notes: '', special_notes: '' });
  };

  return (
    <>
      <Helmet><title>Property Profiles | PureTask</title></Helmet>
      <div className="container max-w-3xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-poppins font-bold text-gradient-aero flex items-center gap-2">
              <Home className="h-6 w-6 text-primary" /> Property Profiles
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Detailed property info for better cleaning service</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Property</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add Property</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Property Name</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Main Apartment" /></div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.has_pets} onCheckedChange={v => setForm(f => ({...f, has_pets: v}))} />
                  <Label>Has Pets</Label>
                </div>
                {form.has_pets && <div><Label>Pet Details</Label><Input value={form.pet_info} onChange={e => setForm(f => ({...f, pet_info: e.target.value}))} placeholder="e.g. 2 cats, friendly dog" /></div>}
                <div><Label>Access Instructions</Label><Textarea value={form.access_instructions} onChange={e => setForm(f => ({...f, access_instructions: e.target.value}))} placeholder="Gate code, doorman info..." rows={2} /></div>
                <div><Label>Parking Notes</Label><Input value={form.parking_notes} onChange={e => setForm(f => ({...f, parking_notes: e.target.value}))} placeholder="Visitor parking in lot B" /></div>
                <div><Label>Special Notes</Label><Textarea value={form.special_notes} onChange={e => setForm(f => ({...f, special_notes: e.target.value}))} placeholder="Anything else your cleaner should know" rows={2} /></div>
                <Button onClick={handleCreate} disabled={createProperty.isPending} className="w-full">Save Property</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
        ) : properties.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No properties yet. Add one to give cleaners helpful info about your space.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {properties.map(prop => (
              <Card key={prop.id}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg">{prop.name}</h3>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteProperty.mutateAsync(prop.id).then(() => toast.success('Property removed'))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {prop.has_pets && <Badge variant="outline" className="text-warning"><PawPrint className="h-3 w-3 mr-1" />Has Pets</Badge>}
                  </div>
                  {prop.pet_info && <p className="text-sm"><PawPrint className="h-3.5 w-3.5 inline mr-1 text-warning" />{prop.pet_info}</p>}
                  {prop.access_instructions && <p className="text-sm"><Key className="h-3.5 w-3.5 inline mr-1 text-primary" />{prop.access_instructions}</p>}
                  {prop.parking_notes && <p className="text-sm"><Car className="h-3.5 w-3.5 inline mr-1 text-muted-foreground" />{prop.parking_notes}</p>}
                  {prop.special_notes && <p className="text-sm text-muted-foreground">{prop.special_notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
