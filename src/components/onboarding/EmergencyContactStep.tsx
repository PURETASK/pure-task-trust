import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Loader2, LifeBuoy } from 'lucide-react';
import { motion } from 'framer-motion';
import { z } from 'zod';

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7, 'Phone is required').max(20),
  relationship: z.string().min(1, 'Pick a relationship'),
});

export interface EmergencyContactData {
  emergency_contact: { name: string; phone: string; relationship: string };
}

interface Props {
  initial?: Partial<EmergencyContactData>;
  onSave: (data: EmergencyContactData) => Promise<void>;
  onBack: () => void;
  isSaving: boolean;
}

const RELATIONSHIPS = ['Spouse / Partner', 'Parent', 'Sibling', 'Child', 'Friend', 'Other family', 'Other'];

export function EmergencyContactStep({ initial, onSave, onBack, isSaving }: Props) {
  const [name, setName] = useState(initial?.emergency_contact?.name ?? '');
  const [phone, setPhone] = useState(initial?.emergency_contact?.phone ?? '');
  const [relationship, setRelationship] = useState(initial?.emergency_contact?.relationship ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, phone, relationship });
    if (!parsed.success) {
      const flat: Record<string, string> = {};
      parsed.error.issues.forEach(i => { flat[i.path[0] as string] = i.message; });
      setErrors(flat);
      return;
    }
    setErrors({});
    await onSave({ emergency_contact: { name, phone, relationship } });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="font-poppins text-2xl font-semibold text-aero-trust">Emergency contact</h2>
        <p className="text-sm text-aero-text-soft mt-1.5">Someone we can reach if there's ever an issue during a job. Used only in emergencies.</p>
      </div>

      <Card className="p-3 bg-aero-card-border/30 border-aero-card-border flex items-start gap-3">
        <LifeBuoy className="h-5 w-5 text-aero-trust flex-shrink-0 mt-0.5" />
        <p className="text-xs text-aero-text-soft leading-relaxed">
          Never shared with clients. Only PureTask Trust & Safety can access this in case of emergency.
        </p>
      </Card>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <Label htmlFor="ec-name" className="text-aero-trust font-medium">Full name</Label>
          <Input id="ec-name" value={name} onChange={e => setName(e.target.value)}
            placeholder="Jane Smith" className="h-12 text-base mt-1.5" required />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="ec-phone" className="text-aero-trust font-medium">Phone number</Label>
          <Input id="ec-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567" className="h-12 text-base mt-1.5" required />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </div>

        <div>
          <Label className="text-aero-trust font-medium">Relationship</Label>
          <Select value={relationship} onValueChange={setRelationship}>
            <SelectTrigger className="h-12 text-base mt-1.5"><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.relationship && <p className="text-xs text-destructive mt-1">{errors.relationship}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSaving} className="h-12 px-5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button type="submit" disabled={isSaving} className="flex-1 h-12 bg-gradient-aero text-white font-semibold">
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin motion-reduce:animate-none" />}
            Continue <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
