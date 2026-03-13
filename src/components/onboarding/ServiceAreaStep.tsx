import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, ArrowLeft, ArrowRight, Plus, X, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const handleAddZipCode = () => {
    const trimmed = zipCodeInput.trim();
    if (isValidZip && !selectedAreas.includes(trimmed)) {
      setSelectedAreas([...selectedAreas, trimmed]);
      setZipCodeInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddZipCode(); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground">Where do you work?</h2>
        <p className="text-muted-foreground mt-1">Add zip codes and set how far you're willing to travel.</p>
      </div>

      {/* Travel radius — show first for visual impact */}
      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/15 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" />
            <Label className="font-semibold">Travel radius</Label>
          </div>
          <span className="text-2xl font-bold text-primary">{travelRadius} km</span>
        </div>
        <Slider
          value={[travelRadius]}
          onValueChange={(v) => setTravelRadius(v[0])}
          min={5} max={50} step={5}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5 km (local)</span>
          <span>50 km (regional)</span>
        </div>
      </div>

      {/* Zip code input */}
      <div className="space-y-3">
        <Label className="font-medium">Service zip codes</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="90210"
              value={zipCodeInput}
              onChange={(e) => setZipCodeInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={10}
              className="pl-9 h-11 rounded-xl"
            />
          </div>
          <Button
            type="button"
            onClick={handleAddZipCode}
            disabled={!isValidZip || selectedAreas.includes(zipCodeInput.trim())}
            className="h-11 px-4 rounded-xl"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected zip codes */}
        <AnimatePresence>
          {selectedAreas.length > 0 ? (
            <motion.div className="flex flex-wrap gap-2 pt-1">
              {selectedAreas.map((zip) => (
                <motion.div
                  key={zip}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Badge variant="secondary" className="pl-3 pr-1 py-1.5 gap-1.5 text-sm">
                    <MapPin className="h-3 w-3" />
                    {zip}
                    <button
                      type="button"
                      onClick={() => setSelectedAreas(selectedAreas.filter(z => z !== zip))}
                      className="ml-0.5 h-4 w-4 rounded-full hover:bg-muted flex items-center justify-center"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-xl">
              Add at least one zip code to continue
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedAreas.length > 0 && (
        <div className="px-4 py-3 bg-success/5 rounded-xl border border-success/20 text-sm">
          <span className="font-semibold text-success">Coverage: </span>
          <span className="text-muted-foreground">
            Within {travelRadius}km of {selectedAreas.length} zip code{selectedAreas.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="h-12 rounded-xl px-5">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => selectedAreas.length > 0 && onSubmit({ travelRadius, selectedAreas })}
          disabled={selectedAreas.length === 0 || isSubmitting}
          className="flex-1 h-12 text-base font-semibold rounded-xl"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
          ) : (
            <><span>Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
