import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, ArrowLeft, Plus, X } from 'lucide-react';

interface ServiceAreaStepProps {
  initialData?: {
    travelRadius?: number | null;
    selectedAreas?: string[];
  };
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

  const handleAddZipCode = () => {
    const trimmed = zipCodeInput.trim();
    // Basic US zip code validation
    if (/^\d{5}(-\d{4})?$/.test(trimmed) && !selectedAreas.includes(trimmed)) {
      setSelectedAreas([...selectedAreas, trimmed]);
      setZipCodeInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddZipCode();
    }
  };

  const handleRemoveArea = (zipCode: string) => {
    setSelectedAreas(selectedAreas.filter((z) => z !== zipCode));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ travelRadius, selectedAreas });
  };

  const isValidZip = /^\d{5}(-\d{4})?$/.test(zipCodeInput.trim());
  const isValid = selectedAreas.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Service Areas
        </CardTitle>
        <CardDescription>
          Enter the zip codes where you're willing to work and set your travel radius.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Zip Code Input */}
          <div className="space-y-3">
            <Label>Add Zip Codes</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter zip code (e.g., 90210)"
                value={zipCodeInput}
                onChange={(e) => setZipCodeInput(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={10}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddZipCode}
                disabled={!isValidZip || selectedAreas.includes(zipCodeInput.trim())}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add all the zip codes where you want to receive job offers.
            </p>
          </div>

          {/* Selected Areas */}
          {selectedAreas.length > 0 && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Selected zip codes:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedAreas.map((zipCode) => (
                  <Badge
                    key={zipCode}
                    variant="secondary"
                    className="pl-3 pr-1 py-1.5 flex items-center gap-1"
                  >
                    {zipCode}
                    <button
                      type="button"
                      onClick={() => handleRemoveArea(zipCode)}
                      className="ml-1 p-0.5 rounded-full hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {selectedAreas.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
              No zip codes added yet. Enter at least one above.
            </div>
          )}

          {/* Travel Radius */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Travel Radius</Label>
              <span className="text-sm font-medium text-primary">{travelRadius} km</span>
            </div>
            <Slider
              value={[travelRadius]}
              onValueChange={(value) => setTravelRadius(value[0])}
              min={5}
              max={50}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 km</span>
              <span>50 km</span>
            </div>
            <p className="text-xs text-muted-foreground">
              How far you're willing to travel from your listed zip codes.
            </p>
          </div>

          {/* Summary */}
          {selectedAreas.length > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">Your coverage</p>
              <p className="text-xs text-muted-foreground">
                You'll receive job offers within {travelRadius}km of {selectedAreas.length} zip{' '}
                {selectedAreas.length === 1 ? 'code' : 'codes'}.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
