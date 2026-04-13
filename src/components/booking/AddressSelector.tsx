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

interface AddressSelectorProps {
  selectedAddressId: string | undefined;
  onSelect: (address: Address) => void;
}

export function AddressSelector({ selectedAddressId, onSelect }: AddressSelectorProps) {
  const { data: addresses, isLoading, isFetching, isError } = useAddresses();
  const { createAddress, isCreating, deleteAddress, isDeleting } = useAddressActions();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
  });

  const handleAddAddress = async () => {
    if (!newAddress.line1 || !newAddress.city) return;
    
    try {
      const createdAddress = await createAddress({
        label: newAddress.label || undefined,
        line1: newAddress.line1,
        city: newAddress.city,
        state: newAddress.state || undefined,
        postalCode: newAddress.postalCode || undefined,
        lat: newAddress.lat,
        lng: newAddress.lng,
        isDefault: !addresses || addresses.length === 0,
      });
      
      // Auto-select the newly created address
      if (createdAddress) {
        onSelect(createdAddress as Address);
      }
      
      setNewAddress({ label: '', line1: '', city: '', state: '', postalCode: '', lat: undefined, lng: undefined });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('handleAddAddress error:', error);
      // Error toast is handled in the hook, but ensure dialog stays open so user can retry
    }
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
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
              <Label htmlFor="line1">Street Address *</Label>
              <AddressAutocompleteInput
                id="line1"
                value={newAddress.line1}
                onChange={(value) => setNewAddress((prev) => ({ ...prev, line1: value, lat: undefined, lng: undefined }))}
                onSelect={(suggestion: AddressSuggestion) => {
                  setNewAddress((prev) => ({
                    ...prev,
                    line1: suggestion.line1,
                    city: suggestion.city,
                    state: suggestion.state,
                    postalCode: suggestion.postalCode,
                    lat: suggestion.lat,
                    lng: suggestion.lng,
                  }));
                }}
                placeholder="Start typing an address..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
                />
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
            <Button
              className="w-full"
              onClick={handleAddAddress}
              disabled={!newAddress.line1 || !newAddress.city || isCreating}
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
