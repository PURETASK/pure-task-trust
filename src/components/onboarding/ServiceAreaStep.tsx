import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, ArrowLeft, ArrowRight, Plus, X, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RadiusMap from '@/components/booking/RadiusMap';

interface ServiceAreaStepProps {
  initialData?: { travelRadius?: number | null; selectedAreas?: string[] };
  onSubmit: (data: { travelRadius: number; selectedAreas: string[] }) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

export function ServiceAreaStep({ initialData, onSubmit, onBack, isSubmitting }: ServiceAreaStepProps) {
  const [travelRadius, setTravelRadius] = useState(initialData?.travelRadius || 15);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(initialData?.selectedAreas || []);
  const [zipCodeInput, setZipCodeInput] = useState('');

  useEffect(() => {
    if (initialData?.travelRadius) setTravelRadius(initialData.travelRadius);
    if (initialData?.selectedAreas) setSelectedAreas(initialData.selectedAreas);
  }, [initialData]);

  const isValidZip = /^\d{5}(-\d{4})?$/.test(zipCodeInput.trim());
  const handleAdd = () => { const t = zipCodeInput.trim(); if (isValidZip && !selectedAreas.includes(t)) { setSelectedAreas([...selectedAreas, t]); setZipCodeInput(''); } };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div>
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Step 7 of 10</p>
        <h2 className="text-2xl font-bold text-white">Where do you work?</h2>
        <p className="text-white/60 text-sm mt-1">Add zip codes and set how far you're willing to travel.</p>
      </div>

      {/* Travel radius */}
      <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.2)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-green-400" />
            <Label className="text-white/80 font-semibold text-sm">Travel radius</Label>
          </div>
          <span className="text-2xl font-poppins font-bold text-green-400">{travelRadius}<span className="text-sm font-medium text-white/60 ml-1">mi</span></span>
        </div>
        <Slider value={[travelRadius]} onValueChange={(v) => setTravelRadius(v[0])} min={5} max={50} step={5} className="py-1 [&_[role=slider]]:bg-green-400 [&_[role=slider]]:border-green-400 [&_.relative]:bg-white/20 [&_[data-orientation=horizontal]]:bg-white/20" />
        <div className="flex justify-between text-xs text-white/30"><span>5 mi</span><span>50 mi</span></div>
      </div>

      {/* Interactive radius map */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(74,222,128,0.2)', height: 220 }}>
        <RadiusMap radiusMiles={travelRadius} className="h-full" dark />
      </div>
      <p className="text-center text-xs text-white/40 -mt-2">
        Shaded area = your {travelRadius}-mile coverage zone
      </p>

      {/* Zip input */}
      <div className="space-y-3">
        <Label className="text-white/70 text-xs font-medium uppercase tracking-wide">Service zip codes</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input placeholder="90210" value={zipCodeInput} onChange={(e) => setZipCodeInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())} maxLength={10} className="pl-9 h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-green-400" />
          </div>
          <Button type="button" onClick={handleAdd} disabled={!isValidZip || selectedAreas.includes(zipCodeInput.trim())} className="h-11 px-4 rounded-xl bg-green-500 hover:bg-green-400 text-white border-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <AnimatePresence>
          {selectedAreas.length > 0 ? (
            <motion.div className="flex flex-wrap gap-2">
              {selectedAreas.map((zip) => (
                <motion.div key={zip} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium" style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.35)', color: 'rgba(74,222,128,0.9)' }}>
                  <MapPin className="h-3 w-3" />{zip}
                  <button type="button" onClick={() => setSelectedAreas(selectedAreas.filter(z => z !== zip))} className="ml-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center hover:bg-white/20">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div className="text-center py-5 text-white/30 text-sm rounded-xl" style={{ border: '2px dashed rgba(255,255,255,0.08)' }}>
              Add at least one zip code to continue
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="h-12 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 px-5"><ArrowLeft className="h-4 w-4" /></Button>
        <Button onClick={() => selectedAreas.length > 0 && onSubmit({ travelRadius, selectedAreas })} disabled={selectedAreas.length === 0 || isSubmitting} className="flex-1 h-12 font-semibold rounded-xl bg-green-500 hover:bg-green-400 text-white border-0">
          {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><span>Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>}
        </Button>
      </div>
    </motion.div>
  );
}
