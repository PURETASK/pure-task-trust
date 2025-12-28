import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCleanerServices } from '@/hooks/useCleanerServices';
import { ADDITIONAL_SERVICE_LABELS } from '@/lib/tier-config';
import { 
  Plus, 
  Minus, 
  Flame, 
  Refrigerator, 
  Ruler, 
  Blinds, 
  DoorOpen, 
  Shirt, 
  Square, 
  Fan,
  Sparkles,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  oven: <Flame className="h-5 w-5" />,
  fridge: <Refrigerator className="h-5 w-5" />,
  baseboards: <Ruler className="h-5 w-5" />,
  blinds: <Blinds className="h-5 w-5" />,
  inside_cabinets: <DoorOpen className="h-5 w-5" />,
  laundry: <Shirt className="h-5 w-5" />,
  windows: <Square className="h-5 w-5" />,
  fans: <Fan className="h-5 w-5" />,
};

interface ServiceBlockProps {
  serviceId: string;
  label: string;
  description: string;
  min: number;
  max: number;
  unit?: string;
  currentPrice: number | null;
  isEnabled: boolean;
  onPriceChange: (price: number) => void;
  onToggle: (enabled: boolean) => void;
}

function ServiceBlock({ 
  serviceId, 
  label, 
  description, 
  min, 
  max, 
  unit, 
  currentPrice, 
  isEnabled, 
  onPriceChange, 
  onToggle 
}: ServiceBlockProps) {
  const price = currentPrice ?? min;

  const handleIncrement = () => {
    if (price < max) {
      onPriceChange(price + 1);
    }
  };

  const handleDecrement = () => {
    if (price > min) {
      onPriceChange(price - 1);
    }
  };

  return (
    <Card className={`transition-all ${isEnabled ? 'border-primary/30 bg-primary/5' : 'opacity-60'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            {SERVICE_ICONS[serviceId]}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{label}</h4>
              {unit && <Badge variant="outline" className="text-xs">{unit}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Range: ${min} - ${max}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={isEnabled}
              onCheckedChange={onToggle}
            />
          </div>
        </div>

        {isEnabled && (
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={price <= min}
              className="h-10 w-10"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="text-center min-w-[80px]">
              <p className="text-2xl font-bold">${price}</p>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              disabled={price >= max}
              className="h-10 w-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CustomServiceBlockProps {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isEnabled: boolean;
  onPriceChange: (price: number) => void;
  onToggle: (enabled: boolean) => void;
  onDelete: () => void;
}

function CustomServiceBlock({ 
  name, 
  description, 
  price, 
  isEnabled, 
  onPriceChange, 
  onToggle, 
  onDelete 
}: CustomServiceBlockProps) {
  return (
    <Card className={`transition-all ${isEnabled ? 'border-primary/30 bg-primary/5' : 'opacity-60'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isEnabled ? 'bg-violet-500/10 text-violet-500' : 'bg-muted text-muted-foreground'}`}>
            <Sparkles className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium">{name}</h4>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={onToggle}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isEnabled && (
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPriceChange(Math.max(1, price - 1))}
              disabled={price <= 1}
              className="h-10 w-10"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="text-center min-w-[80px]">
              <p className="text-2xl font-bold">${price}</p>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPriceChange(price + 1)}
              className="h-10 w-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AdditionalServicesSetup() {
  const { 
    additionalServices, 
    customServices, 
    tier, 
    tierConfig, 
    isLoading,
    upsertService,
    createCustomService,
    updateCustomService,
    deleteCustomService,
  } = useCleanerServices();

  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomDesc, setNewCustomDesc] = useState('');
  const [newCustomPrice, setNewCustomPrice] = useState(10);
  const [showAddCustom, setShowAddCustom] = useState(false);

  const handleServicePriceChange = (serviceId: string, price: number) => {
    const existing = additionalServices?.find(s => s.service_id === serviceId);
    upsertService.mutate({ 
      serviceId, 
      price, 
      isEnabled: existing?.is_enabled ?? true 
    });
  };

  const handleServiceToggle = (serviceId: string, enabled: boolean) => {
    const existing = additionalServices?.find(s => s.service_id === serviceId);
    const priceRange = tierConfig.additionalServices[serviceId];
    upsertService.mutate({ 
      serviceId, 
      price: existing?.price ?? priceRange?.min ?? 10, 
      isEnabled: enabled 
    });
  };

  const handleAddCustomService = () => {
    if (!newCustomName.trim()) {
      toast.error('Please enter a service name');
      return;
    }
    createCustomService.mutate({
      name: newCustomName,
      description: newCustomDesc || undefined,
      price: newCustomPrice,
    });
    setNewCustomName('');
    setNewCustomDesc('');
    setNewCustomPrice(10);
    setShowAddCustom(false);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading services...</div>;
  }

  const serviceIds = Object.keys(ADDITIONAL_SERVICE_LABELS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Additional Services</h2>
          <p className="text-sm text-muted-foreground">
            Set your prices for add-on services based on your <Badge variant="outline" className="ml-1">{tier.toUpperCase()}</Badge> tier
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary border-0">
          {tierConfig.platformFeePercent}% platform fee
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {serviceIds.map((serviceId) => {
          const label = ADDITIONAL_SERVICE_LABELS[serviceId];
          const priceRange = tierConfig.additionalServices[serviceId];
          const existing = additionalServices?.find(s => s.service_id === serviceId);

          return (
            <ServiceBlock
              key={serviceId}
              serviceId={serviceId}
              label={label.label}
              description={label.description}
              min={priceRange.min}
              max={priceRange.max}
              unit={priceRange.unit}
              currentPrice={existing?.price ?? null}
              isEnabled={existing?.is_enabled ?? false}
              onPriceChange={(price) => handleServicePriceChange(serviceId, price)}
              onToggle={(enabled) => handleServiceToggle(serviceId, enabled)}
            />
          );
        })}
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Custom Services</h3>
            <p className="text-sm text-muted-foreground">Add your own specialty services</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAddCustom(!showAddCustom)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom
          </Button>
        </div>

        {showAddCustom && (
          <Card className="mb-4 border-dashed">
            <CardContent className="p-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input
                    placeholder="e.g., Pet Hair Removal"
                    value={newCustomName}
                    onChange={(e) => setNewCustomName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newCustomPrice}
                    onChange={(e) => setNewCustomPrice(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="Brief description of the service"
                  value={newCustomDesc}
                  onChange={(e) => setNewCustomDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCustomService} disabled={createCustomService.isPending}>
                  Add Service
                </Button>
                <Button variant="ghost" onClick={() => setShowAddCustom(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {customServices?.map((service) => (
            <CustomServiceBlock
              key={service.id}
              id={service.id}
              name={service.name}
              description={service.description}
              price={service.price}
              isEnabled={service.is_enabled}
              onPriceChange={(price) => updateCustomService.mutate({ id: service.id, price })}
              onToggle={(enabled) => updateCustomService.mutate({ id: service.id, isEnabled: enabled })}
              onDelete={() => deleteCustomService.mutate(service.id)}
            />
          ))}
        </div>

        {(!customServices || customServices.length === 0) && !showAddCustom && (
          <p className="text-center text-muted-foreground py-4">
            No custom services yet. Add your specialty services above.
          </p>
        )}
      </div>
    </div>
  );
}
