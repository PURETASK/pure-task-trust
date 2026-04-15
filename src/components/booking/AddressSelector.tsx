import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAddresses, useAddressActions, Address } from '@/hooks/useAddresses';
import { MapPin, Plus, Check, Star, Trash2, Loader2 } from 'lucide-react';
import { AddressAutocompleteInput } from './AddressAutocompleteInput';
import { AddressSuggestion } from '@/hooks/useAddressAutocomplete';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddressSelectorProps {
  selectedAddressId: string | undefined;
  onSelect: (address: Address) => void;
}

export function AddressSelector({ selectedAddressId, onSelect }: AddressSelectorProps) {
  const { data: addresses, isLoading, isError } = useAddresses();
  const { createAddress, isCreating, deleteAddress, isDeleting } = useAddressActions();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({
    label: '',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
  });

  const canSave = newAddress.line1.trim().length > 0 && newAddress.city.trim().length > 0;
  const shouldSetAsDefault = Array.isArray(addresses) && addresses.length === 0;

  const buildLocalAddress = (): Address => ({
    id: `temp-${Date.now()}`,
    user_id: 'temporary-booking-address',
    label: newAddress.label.trim() || null,
    line1: newAddress.line1.trim(),
    line2: null,
    city: newAddress.city.trim(),
    state: newAddress.state.trim() || null,
    postal_code: newAddress.postalCode.trim() || null,
    country: 'US',
    is_default: false,
    lat: newAddress.lat ?? null,
    lng: newAddress.lng ?? null,
    created_at: new Date().toISOString(),
  });

  const handleAddAddress = async () => {
    if (!canSave) return;
    setSaveError(null);

    try {
      const createdAddress = await createAddress({
        label: newAddress.label.trim() || undefined,
        line1: newAddress.line1.trim(),
        city: newAddress.city.trim(),
        state: newAddress.state.trim() || undefined,
        postalCode: newAddress.postalCode.trim() || undefined,
        lat: newAddress.lat,
        lng: newAddress.lng,
        isDefault: shouldSetAsDefault,
      });

      if (createdAddress) {
        onSelect(createdAddress as Address);
      }

      setNewAddress({ label: '', line1: '', city: '', state: '', postalCode: '', lat: undefined, lng: undefined });
      setIsAddDialogOpen(false);
      setSaveError(null);
    } catch (error: any) {
      console.error('handleAddAddress error:', error);
      const msg = error?.message || 'Failed to save address. Please try again.';

      if (msg.toLowerCase().includes('timed out')) {
        const localAddress = buildLocalAddress();
        onSelect(localAddress);
        setNewAddress({ label: '', line1: '', city: '', state: '', postalCode: '', lat: undefined, lng: undefined });
        setIsAddDialogOpen(false);
        setSaveError(null);
        toast.success('Using this address for your booking now', {
          description: 'We could not save it to your account yet, but you can continue to the next step.',
        });
        return;
      }

      setSaveError(msg);
      toast.error('Failed to save address', { description: msg });
    }
  };

  const handleAutocompleteSelect = (suggestion: AddressSuggestion) => {
    setNewAddress((prev) => ({
      ...prev,
      line1: suggestion.line1 || prev.line1,
      city: suggestion.city || prev.city,
      state: suggestion.state || prev.state,
      postalCode: suggestion.postalCode || prev.postalCode,
      lat: suggestion.lat,
      lng: suggestion.lng,
    }));
  };

  const showLoading = isLoading && !isError && !addresses;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Select Address</h3>
        {showLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {addresses && addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={cn(
                'cursor-pointer transition-all',
                selectedAddressId === address.id
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'hover:border-primary/30'
              )}
              onClick={() => onSelect(address)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div
                  className={cn(
                    'h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                    selectedAddressId === address.id
                      ? 'bg-primary border-primary'
                      : 'border-border'
                  )}
                >
                  {selectedAddressId === address.id && (
                    <Check className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {address.label && (
                      <span className="font-medium">{address.label}</span>
                    )}
                    {address.is_default && (
                      <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {address.line1}
                    {address.line2 && `, ${address.line2}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.city}{address.state && `, ${address.state}`} {address.postal_code}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAddress(address.id);
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No saved addresses yet</p>
          </CardContent>
        </Card>
      )}

      {/* Add New Address Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) setSaveError(null);
      }}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="label">Label (optional)</Label>
              <Input
                id="label"
                placeholder="e.g., Home, Office"
                value={newAddress.label}
                onChange={(e) => setNewAddress((prev) => ({ ...prev, label: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="line1">Street Address <span className="text-destructive">*</span></Label>
              <AddressAutocompleteInput
                id="line1"
                value={newAddress.line1}
                onChange={(value) => setNewAddress((prev) => ({ ...prev, line1: value, lat: undefined, lng: undefined }))}
                onSelect={handleAutocompleteSelect}
                placeholder="Start typing an address..."
              />
              {newAddress.line1.length > 0 && newAddress.line1.trim().length === 0 && (
                <p className="text-xs text-destructive mt-1">Street address is required</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
                />
                {!newAddress.city.trim() && newAddress.line1.trim().length > 0 && (
                  <p className="text-xs text-destructive mt-1">City is required</p>
                )}
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                placeholder="12345"
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress((prev) => ({ ...prev, postalCode: e.target.value }))}
              />
            </div>

            {saveError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md p-3">{saveError}</p>
            )}

            <Button
              className="w-full"
              onClick={handleAddAddress}
              disabled={!canSave || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Address'
              )}
            </Button>

            {!canSave && (newAddress.line1.length > 0 || newAddress.city.length > 0) && (
              <p className="text-xs text-muted-foreground text-center">
                Please fill in both street address and city to save.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
