import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Languages, PawPrint, SprayCan } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const SPECIALTIES = [
  { id: 'standard', label: 'Standard cleaning' },
  { id: 'deep', label: 'Deep clean' },
  { id: 'move_out', label: 'Move-in / move-out' },
  { id: 'post_construction', label: 'Post-construction' },
  { id: 'airbnb', label: 'Airbnb turnover' },
  { id: 'office', label: 'Office / commercial' },
  { id: 'eco_friendly', label: 'Eco-friendly products' },
  { id: 'laundry', label: 'Laundry & ironing' },
  { id: 'inside_oven', label: 'Inside oven' },
  { id: 'inside_fridge', label: 'Inside fridge' },
  { id: 'windows', label: 'Interior windows' },
  { id: 'organizing', label: 'Organizing' },
];

const LANGUAGES = ['English', 'Spanish', 'Mandarin', 'Cantonese', 'French', 'Portuguese', 'Tagalog', 'Vietnamese', 'Russian', 'Polish', 'Arabic', 'Other'];

export interface SpecialtiesData {
  specialties: string[];
  languages: string[];
  pet_friendly: boolean;
  brings_supplies: boolean;
}

interface Props {
  initial?: Partial<SpecialtiesData>;
  onSave: (data: SpecialtiesData) => Promise<void>;
  onBack: () => void;
  isSaving: boolean;
}

export function SpecialtiesStep({ initial, onSave, onBack, isSaving }: Props) {
  const [specialties, setSpecialties] = useState<string[]>(initial?.specialties ?? ['standard']);
  const [languages, setLanguages] = useState<string[]>(initial?.languages ?? ['English']);
  const [petFriendly, setPetFriendly] = useState<boolean>(initial?.pet_friendly ?? false);
  const [bringsSupplies, setBringsSupplies] = useState<boolean>(initial?.brings_supplies ?? true);
  const [error, setError] = useState<string | null>(null);

  const toggle = (arr: string[], setter: (v: string[]) => void, val: string) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const submit = async () => {
    if (specialties.length === 0) { setError('Pick at least one specialty'); return; }
    if (languages.length === 0) { setError('Pick at least one language'); return; }
    setError(null);
    await onSave({ specialties, languages, pet_friendly: petFriendly, brings_supplies: bringsSupplies });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="font-poppins text-2xl font-semibold text-aero-trust">Your specialties</h2>
        <p className="text-sm text-aero-text-soft mt-1.5">Helps clients find the perfect match. You can edit these any time.</p>
      </div>

      <div>
        <Label className="text-aero-trust font-medium flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4" /> What you do best
        </Label>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map(s => {
            const on = specialties.includes(s.id);
            return (
              <button key={s.id} type="button" onClick={() => toggle(specialties, setSpecialties, s.id)}
                className={cn(
                  'min-h-[44px] px-4 rounded-full text-sm font-medium border-2 transition-colors',
                  on
                    ? 'bg-aero-trust text-white border-aero-trust'
                    : 'bg-aero-card text-aero-trust border-aero-card-border hover:border-aero-cyan'
                )}>
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="text-aero-trust font-medium flex items-center gap-2 mb-3">
          <Languages className="h-4 w-4" /> Languages you speak
        </Label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(l => {
            const on = languages.includes(l);
            return (
              <button key={l} type="button" onClick={() => toggle(languages, setLanguages, l)}
                className={cn(
                  'min-h-[44px] px-4 rounded-full text-sm font-medium border-2 transition-colors',
                  on
                    ? 'bg-aero-cyan text-aero-trust border-aero-cyan'
                    : 'bg-aero-card text-aero-trust border-aero-card-border hover:border-aero-cyan'
                )}>
                {l}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Card className="p-4 flex items-center justify-between min-h-[64px]">
          <div className="flex items-center gap-3">
            <PawPrint className="h-5 w-5 text-aero-trust" />
            <div>
              <p className="text-base font-medium text-aero-trust">Pet-friendly</p>
              <p className="text-xs text-aero-text-soft">I'm comfortable cleaning homes with pets</p>
            </div>
          </div>
          <Switch checked={petFriendly} onCheckedChange={setPetFriendly} />
        </Card>

        <Card className="p-4 flex items-center justify-between min-h-[64px]">
          <div className="flex items-center gap-3">
            <SprayCan className="h-5 w-5 text-aero-trust" />
            <div>
              <p className="text-base font-medium text-aero-trust">I bring my own supplies</p>
              <p className="text-xs text-aero-text-soft">Cleaning products, vacuum, mop, etc.</p>
            </div>
          </div>
          <Switch checked={bringsSupplies} onCheckedChange={setBringsSupplies} />
        </Card>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSaving} className="h-12 px-5">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button onClick={submit} disabled={isSaving} className="flex-1 h-12 bg-gradient-aero text-white font-semibold">
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin motion-reduce:animate-none" />}
          Continue <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
