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
