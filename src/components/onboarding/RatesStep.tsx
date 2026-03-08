import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { DollarSign, Loader2, ArrowLeft, MapPin } from 'lucide-react';
import type { RatesData } from '@/hooks/useCleanerOnboarding';

interface RatesStepProps {
  initialData?: {
    hourlyRate?: number | null;
    travelRadius?: number | null;
  };
  onSubmit: (data: RatesData) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

export function RatesStep({ initialData, onSubmit, onBack, isSubmitting }: RatesStepProps) {
  const [hourlyRate, setHourlyRate] = useState(initialData?.hourlyRate || 35);
  const [travelRadius, setTravelRadius] = useState(initialData?.travelRadius || 15);

  useEffect(() => {
    if (initialData) {
      setHourlyRate(initialData.hourlyRate || 35);
      setTravelRadius(initialData.travelRadius || 15);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ hourlyRate, travelRadius });
  };

  // Determine tier and allowed range based on initial hourly rate
  const getTierInfo = (rate: number) => {
    if (rate >= 50) return { tier: 'Platinum', min: 50, max: 100, color: 'text-purple-500' };
    if (rate >= 40) return { tier: 'Gold', min: 40, max: 65, color: 'text-yellow-500' };
    if (rate >= 30) return { tier: 'Silver', min: 30, max: 50, color: 'text-slate-400' };
    return { tier: 'Bronze', min: 20, max: 35, color: 'text-orange-500' };
  };
  const tierInfo = getTierInfo(hourlyRate);

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <DollarSign className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Set your rates</CardTitle>
        <CardDescription>
          Choose your hourly rate and how far you're willing to travel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tier explanation banner */}
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm space-y-1">
            <p className="font-medium">💡 How rates work</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Your allowed rate range is tied to your <span className="font-medium">reliability tier</span>. As you complete more jobs and earn higher ratings, your tier increases — unlocking higher rate ceilings. New cleaners start at <span className="font-medium">Bronze ($20–$35/hr)</span>.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[
                { label: 'Bronze', range: '$20–35', color: 'bg-orange-100 text-orange-700' },
                { label: 'Silver', range: '$30–50', color: 'bg-slate-100 text-slate-600' },
                { label: 'Gold', range: '$40–65', color: 'bg-yellow-100 text-yellow-700' },
                { label: 'Platinum', range: '$50–100', color: 'bg-purple-100 text-purple-700' },
              ].map(t => (
                <span key={t.label} className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${t.color}`}>
                  {t.label}: {t.range}
                </span>
              ))}
            </div>
          </div>

          {/* Hourly Rate */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Hourly Rate
              </Label>
              <span className="text-2xl font-bold text-primary">${hourlyRate}/hr</span>
            </div>
            <Slider
              value={[hourlyRate]}
              onValueChange={(value) => setHourlyRate(value[0])}
              min={20}
              max={100}
              step={5}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$20/hr</span>
              <span>$100/hr</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This is your base rate. You can set different rates for specific services later.
            </p>
          </div>

          {/* Travel Radius */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Travel Radius
              </Label>
              <span className="text-2xl font-bold text-primary">{travelRadius} km</span>
            </div>
            <Slider
              value={[travelRadius]}
              onValueChange={(value) => setTravelRadius(value[0])}
              min={5}
              max={50}
              step={5}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 km</span>
              <span>50 km</span>
            </div>
            <p className="text-sm text-muted-foreground">
              How far you're willing to travel from your location for jobs.
            </p>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Your settings</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Hourly Rate:</span>
                <span className="ml-2 font-medium">${hourlyRate}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Travel:</span>
                <span className="ml-2 font-medium">{travelRadius} km</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              disabled={isSubmitting}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
