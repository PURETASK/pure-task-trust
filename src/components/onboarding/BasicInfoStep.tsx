import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BasicInfoData } from '@/hooks/useCleanerOnboarding';

interface BasicInfoStepProps {
  initialData?: { firstName?: string | null; lastName?: string | null; bio?: string | null };
  onSubmit: (data: BasicInfoData) => Promise<void>;
  onBack?: () => void;
  isSubmitting: boolean;
}

export function BasicInfoStep({ initialData, onSubmit, onBack, isSubmitting }: BasicInfoStepProps) {
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [bio, setBio] = useState(initialData?.bio || '');

  useEffect(() => {
    if (initialData) { setFirstName(initialData.firstName || ''); setLastName(initialData.lastName || ''); setBio(initialData.bio || ''); }
  }, [initialData]);

  const bioLen = bio.trim().length;
  const isValid = firstName.trim() && lastName.trim() && bioLen >= 20;
  const bioProgress = Math.min((bioLen / 20) * 100, 100);

  const inputClass = "h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-success focus:ring-success/20";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div>
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Step 2 of 10</p>
        <h2 className="text-2xl font-bold text-white">Tell us about yourself</h2>
        <p className="text-white/60 text-sm mt-1">Clients choose cleaners by how much they connect with their story.</p>
      </div>

      <form onSubmit={async (e) => { e.preventDefault(); await onSubmit({ firstName, lastName, bio }); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-medium uppercase tracking-wide">First Name</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" className={inputClass} required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-medium uppercase tracking-wide">Last Name</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" className={inputClass} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-white/70 text-xs font-medium uppercase tracking-wide">Your Bio</Label>
            <span className={`text-xs font-medium ${bioLen >= 20 ? 'text-success' : 'text-white/40'}`}>
              {bioLen < 20 ? `${20 - bioLen} more chars` : `${bioLen} ✓`}
            </span>
          </div>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell clients about your experience, specialties, and what makes you stand out…" className="min-h-[100px] resize-none rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-success" required />
          <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div className="h-full bg-success rounded-full" animate={{ width: `${bioProgress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
          <Lightbulb className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
          <p className="text-xs text-white/60"><span className="text-white font-semibold">Pro tip: </span>Be specific about your experience — "5 years deep-cleaning Airbnb properties" converts 3× better than generic bios.</p>
        </div>

        <div className="flex gap-3">
          {onBack && <Button type="button" variant="outline" onClick={onBack} className="h-12 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 px-5"><ArrowLeft className="h-4 w-4" /></Button>}
          <Button type="submit" disabled={!isValid || isSubmitting} className="flex-1 h-12 font-semibold rounded-xl bg-success hover:bg-success text-white border-0">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><span>Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
