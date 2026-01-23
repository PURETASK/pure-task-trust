import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  lat: number;
  lng: number;
  addressLine: string;
}

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tileAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function popupHtml(addressLine: string) {
  // Keep popup markup simple (Leaflet expects HTML string)
  const safeAddress = addressLine.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `
    <div style="font-size: 12px; line-height: 1.2;">
      <div style="font-weight: 600; margin-bottom: 2px;">Cleaning Location</div>
      <div style="opacity: 0.8;">${safeAddress}</div>
    </div>
  `.trim();
}

/**
 * IMPORTANT: We intentionally do NOT use react-leaflet here.
 * The current react-leaflet/@react-leaflet/core versions in this project
 * are incompatible and can throw: "render2 is not a function".
 */
export default function LeafletMap({ lat, lng, addressLine }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Configure marker icons (Vite path fix)
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Create the map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    });

    mapRef.current = map;
    L.tileLayer(tileUrl, { attribution: tileAttribution }).addTo(map);
    map.setView([lat, lng], 16);

    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(popupHtml(addressLine));
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update view/marker when coords change
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    map.setView([lat, lng], map.getZoom(), { animate: false });
    marker.setLatLng([lat, lng]);
    marker.getPopup()?.setContent(popupHtml(addressLine));
  }, [lat, lng, addressLine]);

  return <div ref={containerRef} className="h-full w-full" />;
}
