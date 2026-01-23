import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LeafletMapProps {
  lat: number;
  lng: number;
  addressLine: string;
}

// This component dynamically loads Leaflet only on the client side
// to avoid the "render2 is not a function" error from react-leaflet
export default function LeafletMap({ lat, lng, addressLine }: LeafletMapProps) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Dynamically import react-leaflet only on the client side
    const loadMap = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        
        // Fix for default marker icon
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet');

        // Create the map component
        const Map = () => (
          <MapContainer
            center={[lat, lng]}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-medium">Cleaning Location</p>
                  <p className="text-muted-foreground">{addressLine}</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        );

        setMapComponent(() => Map);
      } catch (error) {
        console.error('Failed to load map:', error);
      }
    };

    loadMap();
  }, [lat, lng, addressLine]);

  if (!MapComponent) {
    return (
      <div className="h-full flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <MapComponent />;
}
