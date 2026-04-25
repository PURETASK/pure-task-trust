import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { z } from 'zod';

const schema = z.object({
  date_of_birth: z.string().refine(v => {
    const d = new Date(v);
    if (isNaN(d.getTime())) return false;
    const age = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 18 && age <= 100;
  }, 'You must be at least 18 years old'),
  street: z.string().trim().min(3, 'Street address is required').max(120),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(40),
  zip: z.string().trim().min(3).max(12),
});

export interface PersonalInfoData {
  date_of_birth: string;
  home_address: { street: string; city: string; state: string; zip: string };
}

interface Props {
  initial?: Partial<PersonalInfoData>;
  onSave: (data: PersonalInfoData) => Promise<void>;
  onBack: () => void;
  isSaving: boolean;
}

export function PersonalInfoStep({ initial, onSave, onBack, isSaving }: Props) {
  const [dob, setDob] = useState(initial?.date_of_birth ?? '');
  const [street, setStreet] = useState(initial?.home_address?.street ?? '');
  const [city, setCity] = useState(initial?.home_address?.city ?? '');
  const [state, setState] = useState(initial?.home_address?.state ?? '');
  const [zip, setZip] = useState(initial?.home_address?.zip ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ date_of_birth: dob, street, city, state, zip });
    if (!parsed.success) {
      const flat: Record<string, string> = {};
      parsed.error.issues.forEach(i => { flat[i.path[0] as string] = i.message; });
      setErrors(flat);
      return;
    }
    setErrors({});
    await onSave({
      date_of_birth: dob,
      home_address: { street, city, state, zip },
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="font-poppins text-2xl font-semibold text-aero-trust">Personal information</h2>
        <p className="text-sm text-aero-text-soft mt-1.5">We need this for your background check and to set your travel-radius origin.</p>
      </div>

      <Card className="p-3 bg-aero-card-border/30 border-aero-card-border flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-aero-trust flex-shrink-0 mt-0.5" />
        <p className="text-xs text-aero-text-soft leading-relaxed">
          This information is encrypted and only used for verification. Your home address is never shown to clients.
        </p>
      </Card>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <Label htmlFor="dob" className="text-aero-trust font-medium">Date of birth</Label>
          <div className="relative mt-1.5">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-aero-text-soft" />
            <Input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)}
              className="pl-10 h-12 text-base" required />
          </div>
          {errors.date_of_birth && <p className="text-xs text-destructive mt-1">{errors.date_of_birth}</p>}
        </div>

        <div>
          <Label htmlFor="street" className="text-aero-trust font-medium">Home street address</Label>
          <Input id="street" value={street} onChange={e => setStreet(e.target.value)}
            placeholder="123 Main St" className="h-12 text-base mt-1.5" required />
          {errors.street && <p className="text-xs text-destructive mt-1">{errors.street}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="city" className="text-aero-trust font-medium">City</Label>
            <Input id="city" value={city} onChange={e => setCity(e.target.value)} className="h-12 text-base mt-1.5" required />
            {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
          </div>
          <div>
            <Label htmlFor="state" className="text-aero-trust font-medium">State</Label>
            <Input id="state" value={state} onChange={e => setState(e.target.value)} placeholder="CA" maxLength={2}
              className="h-12 text-base mt-1.5 uppercase" required />
            {errors.state && <p className="text-xs text-destructive mt-1">{errors.state}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="zip" className="text-aero-trust font-medium">ZIP code</Label>
          <Input id="zip" value={zip} onChange={e => setZip(e.target.value)} placeholder="94103"
            className="h-12 text-base mt-1.5 max-w-[140px]" required />
          {errors.zip && <p className="text-xs text-destructive mt-1">{errors.zip}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSaving} className="h-12 px-5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button type="submit" disabled={isSaving} className="flex-1 h-12 bg-gradient-aero text-white font-semibold">
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin motion-reduce:animate-none" /> : null}
            Continue <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
