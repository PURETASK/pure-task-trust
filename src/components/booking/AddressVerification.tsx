import { useState, useEffect, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  MapPin, Shield, ExternalLink, AlertTriangle, CheckCircle, 
  Lock, Navigation, Home, Loader2
} from 'lucide-react';
import { Address } from '@/hooks/useAddresses';

// Lazy load the Leaflet map component to avoid SSR/context issues
const LeafletMap = lazy(() => import('./LeafletMap'));

interface AddressVerificationProps {
  address: Address;
  onConfirm: () => void;
  onBack: () => void;
}

export function AddressVerification({ address, onConfirm, onBack }: AddressVerificationProps) {
  const [confirmed, setConfirmed] = useState({
    addressCorrect: false,
    accessInstructions: false,
    parkingAcknowledged: false,
    homeSecure: false
  });
  const [error, setError] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    address.lat && address.lng ? { lat: address.lat, lng: address.lng } : null
  );

  useEffect(() => {
    // If no coordinates, attempt to geocode the address using Nominatim (free)
    if (!coordinates && address) {
      geocodeAddress();
    }
  }, [address]);

  const geocodeAddress = async () => {
    setIsGeocoding(true);
    try {
      const fullAddress = `${address.line1}, ${address.city}, ${address.state || ''} ${address.postal_code || ''}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setCoordinates({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        });
      } else {
        // Default to a general location if geocoding fails
        setError('Could not locate address on map. Please verify the address is correct.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const allConfirmed = Object.values(confirmed).every(v => v === true);

  const handleProceed = () => {
    if (!allConfirmed) {
      setError('Please confirm all security checkpoints before proceeding.');
      return;
    }
    setError('');
    onConfirm();
  };

  const fullAddress = `${address.line1}${address.line2 ? `, ${address.line2}` : ''}, ${address.city}, ${address.state || ''} ${address.postal_code || ''}`;
  const googleMapsUrl = coordinates 
    ? `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Address Verification</h2>
        </div>
        <p className="text-muted-foreground">
          Please confirm your cleaning location for security purposes
        </p>
        <Badge variant="secondary" className="mt-2 gap-1">
          <Lock className="h-3 w-3" />
          Secure Verification Step
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Address Display */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Cleaning Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="font-medium">{fullAddress}</p>
          </div>
          
          {coordinates && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Latitude</p>
                <p className="font-mono">{coordinates.lat.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Longitude</p>
                <p className="font-mono">{coordinates.lng.toFixed(6)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Navigation className="h-5 w-5 text-primary" />
              Location Map
            </CardTitle>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary flex items-center gap-1 hover:underline"
            >
              Open in Google Maps
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardHeader>
        <CardContent>
          {isGeocoding ? (
            <div className="h-64 rounded-lg bg-muted flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : coordinates ? (
            <div className="h-64 rounded-lg overflow-hidden border">
              <Suspense fallback={
                <div className="h-full flex items-center justify-center bg-muted">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              }>
                <LeafletMap 
                  lat={coordinates.lat} 
                  lng={coordinates.lng} 
                  addressLine={address.line1} 
                />
              </Suspense>
            </div>
          ) : (
            <div className="h-64 rounded-lg bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Map preview unavailable</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Checkpoints */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-success" />
            Security Checkpoints
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="addressCorrect"
              checked={confirmed.addressCorrect}
              onCheckedChange={(checked) => 
                setConfirmed(prev => ({ ...prev, addressCorrect: checked as boolean }))
              }
            />
            <div className="space-y-1">
              <Label htmlFor="addressCorrect" className="font-medium cursor-pointer">
                Address is correct
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm this is the correct address for the cleaning service
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="accessInstructions"
              checked={confirmed.accessInstructions}
              onCheckedChange={(checked) => 
                setConfirmed(prev => ({ ...prev, accessInstructions: checked as boolean }))
              }
            />
            <div className="space-y-1">
              <Label htmlFor="accessInstructions" className="font-medium cursor-pointer">
                Access instructions ready
              </Label>
              <p className="text-sm text-muted-foreground">
                I will provide clear entry instructions (gate codes, key location, etc.)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="parkingAcknowledged"
              checked={confirmed.parkingAcknowledged}
              onCheckedChange={(checked) => 
                setConfirmed(prev => ({ ...prev, parkingAcknowledged: checked as boolean }))
              }
            />
            <div className="space-y-1">
              <Label htmlFor="parkingAcknowledged" className="font-medium cursor-pointer">
                Parking available
              </Label>
              <p className="text-sm text-muted-foreground">
                I acknowledge parking is available or will provide alternatives
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="homeSecure"
              checked={confirmed.homeSecure}
              onCheckedChange={(checked) => 
                setConfirmed(prev => ({ ...prev, homeSecure: checked as boolean }))
              }
            />
            <div className="space-y-1">
              <Label htmlFor="homeSecure" className="font-medium cursor-pointer">
                Property is safe
              </Label>
              <p className="text-sm text-muted-foreground">
                The property is secure and safe for a professional to enter
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          GPS Verified
        </span>
        <span className="flex items-center gap-1">
          <Lock className="h-3 w-3" />
          Secure Booking
        </span>
        <span className="flex items-center gap-1">
          <Home className="h-3 w-3" />
          Photo Documentation
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button
          className="flex-1"
          size="lg"
          onClick={handleProceed}
          disabled={!allConfirmed}
        >
          {allConfirmed ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm & Continue
            </>
          ) : (
            'Please confirm all checkpoints'
          )}
        </Button>
      </div>
    </div>
  );
}
