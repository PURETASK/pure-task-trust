import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCleanerServicesById, CleanerAdditionalService, CleanerCustomService } from '@/hooks/useCleanerServices';
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
  ShoppingCart
} from 'lucide-react';

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

interface ServiceQuantity {
  serviceId: string;
  quantity: number;
  price: number;
  isCustom: boolean;
  name: string;
}

interface BookingServicesPickerProps {
  cleanerId: string;
  onServicesChange: (services: ServiceQuantity[], total: number) => void;
  hours: number;
}

export function BookingServicesPicker({ cleanerId, onServicesChange, hours }: BookingServicesPickerProps) {
  const { additionalServices, customServices, hourlyRate, isLoading } = useCleanerServicesById(cleanerId);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const updateQuantity = (serviceId: string, delta: number, isCustom: boolean = false) => {
    setQuantities(prev => {
      const current = prev[serviceId] || 0;
      const newQty = Math.max(0, current + delta);
      const updated = { ...prev, [serviceId]: newQty };
      
      // Calculate new totals
      const services = calculateServices(updated);
      const total = calculateTotal(services);
      onServicesChange(services, total);
      
      return updated;
    });
  };

  const calculateServices = (qtys: Record<string, number>): ServiceQuantity[] => {
    const services: ServiceQuantity[] = [];
    
    // Standard services
    additionalServices?.forEach(service => {
      const qty = qtys[service.service_id] || 0;
      if (qty > 0) {
        services.push({
          serviceId: service.service_id,
          quantity: qty,
          price: service.price,
          isCustom: false,
          name: ADDITIONAL_SERVICE_LABELS[service.service_id]?.label || service.service_id,
        });
      }
    });
    
    // Custom services
    customServices?.forEach(service => {
      const qty = qtys[`custom_${service.id}`] || 0;
      if (qty > 0) {
        services.push({
          serviceId: service.id,
          quantity: qty,
          price: service.price,
          isCustom: true,
          name: service.name,
        });
      }
    });
    
    return services;
  };

  const calculateTotal = (services: ServiceQuantity[]): number => {
    const servicesTotal = services.reduce((sum, s) => sum + (s.price * s.quantity), 0);
    const hourlyTotal = hourlyRate * hours;
    return servicesTotal + hourlyTotal;
  };

  const getSelectedServices = () => calculateServices(quantities);
  const totalAmount = calculateTotal(getSelectedServices());
  const selectedServices = getSelectedServices();

  if (isLoading) {
    return <div className="text-center py-4 text-muted-foreground">Loading services...</div>;
  }

  if (!additionalServices?.length && !customServices?.length) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          This cleaner hasn't set up additional services yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Add-on Services</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select optional add-ons for your cleaning
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {additionalServices?.map((service) => {
            const qty = quantities[service.service_id] || 0;
            const label = ADDITIONAL_SERVICE_LABELS[service.service_id];
            
            return (
              <ServiceQuantityCard
                key={service.service_id}
                icon={SERVICE_ICONS[service.service_id]}
                name={label?.label || service.service_id}
                unit={label?.description}
                quantity={qty}
                onIncrement={() => updateQuantity(service.service_id, 1)}
                onDecrement={() => updateQuantity(service.service_id, -1)}
              />
            );
          })}
        </div>
      </div>

      {customServices && customServices.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-2">Special Services</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Unique services offered by this cleaner
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {customServices.map((service) => {
                const qty = quantities[`custom_${service.id}`] || 0;
                
                return (
                  <ServiceQuantityCard
                    key={service.id}
                    icon={<Sparkles className="h-5 w-5" />}
                    name={service.name}
                    unit={service.description || undefined}
                    quantity={qty}
                    onIncrement={() => updateQuantity(`custom_${service.id}`, 1, true)}
                    onDecrement={() => updateQuantity(`custom_${service.id}`, -1, true)}
                    isCustom
                  />
                );
              })}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Order Summary */}
      <Card className="bg-secondary/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Order Summary</h4>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hourly Rate ({hours} hrs)</span>
              <span>${hourlyRate} × {hours} = ${hourlyRate * hours}</span>
            </div>

            {selectedServices.map((service) => (
              <div key={service.serviceId} className="flex justify-between">
                <span className="text-muted-foreground">
                  {service.name} × {service.quantity}
                </span>
                <span>${service.price * service.quantity}</span>
              </div>
            ))}

            <Separator className="my-2" />

            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary">${totalAmount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ServiceQuantityCardProps {
  icon: React.ReactNode;
  name: string;
  unit?: string;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  isCustom?: boolean;
}

function ServiceQuantityCard({ 
  icon, 
  name, 
  unit, 
  quantity, 
  onIncrement, 
  onDecrement,
  isCustom = false
}: ServiceQuantityCardProps) {
  return (
    <Card className={`transition-all ${quantity > 0 ? 'border-primary/30 ring-1 ring-primary/20' : ''}`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
            isCustom ? 'bg-violet-500/10 text-violet-500' : 'bg-primary/10 text-primary'
          }`}>
            {icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{name}</h4>
            {unit && <p className="text-xs text-muted-foreground truncate">{unit}</p>}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={onDecrement}
              disabled={quantity === 0}
              className="h-8 w-8"
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <span className={`w-6 text-center font-bold ${quantity > 0 ? 'text-primary' : ''}`}>
              {quantity}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              onClick={onIncrement}
              className="h-8 w-8"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
