import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCleanerCertifications } from "@/hooks/useCleanerCertifications";
import { Award, Plus, Trash2, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function CleanerCertifications() {
  const { certifications, isLoading, addCertification, deleteCertification } = useCleanerCertifications();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const handleAdd = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    await addCertification.mutateAsync({ name: form.name, description: form.description || undefined });
    toast.success('Certification added for review');
    setOpen(false);
    setForm({ name: '', description: '' });
  };

  return (
    <CleanerLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" /> Certifications
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Upload certifications to boost your profile credibility</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Certification</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Certification</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Certification Name</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Eco-Friendly Cleaning Specialist" /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Brief description of this certification" rows={3} /></div>
                <Button onClick={handleAdd} disabled={addCertification.isPending} className="w-full">Submit for Verification</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : certifications.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No certifications yet. Add your professional credentials to stand out!</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {certifications.map(cert => (
              <Card key={cert.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{cert.name}</p>
                      {cert.is_verified ? (
                        <Badge className="bg-success/15 text-success"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
                      ) : (
                        <Badge className="bg-warning/15 text-warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                      )}
                    </div>
                    {cert.description && <p className="text-xs text-muted-foreground mt-0.5">{cert.description}</p>}
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteCertification.mutateAsync(cert.id).then(() => toast.success('Removed'))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CleanerLayout>
  );
}
