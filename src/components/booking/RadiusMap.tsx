import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapZone {
  lat: number;
  lng: number;
  radiusMiles: number;
  label?: string;
}

interface RadiusMapProps {
  /** Centre of the primary circle. Defaults to a US central point when not yet geocoded. */
  lat?: number;
  lng?: number;
  /** Radius in miles */
  radiusMiles: number;
  /** Optional height class, default h-64 */
  className?: string;
  /** Dark overlay for onboarding dark backgrounds */
  dark?: boolean;
  /** Additional saved zones to display on the map */
  zones?: MapZone[];
}

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// 1 mile in metres
const MILES_TO_METRES = 1609.344;

function radiusToZoom(radiusMiles: number): number {
  if (radiusMiles <= 5) return 12;
  if (radiusMiles <= 10) return 11;
  if (radiusMiles <= 20) return 10;
  if (radiusMiles <= 35) return 9;
  return 8;
}

export default function RadiusMap({
  lat = 30.2672,
  lng = -97.7431,
  radiusMiles,
  className = 'h-64',
  dark = false,
  zones = [],
}: RadiusMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const zoneLayersRef = useRef<L.LayerGroup | null>(null);

  // Fix Leaflet default icon paths under Vite
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Create map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      dragging: true,
      scrollWheelZoom: false,
      doubleClickZoom: false,
    });

    mapRef.current = map;

    L.tileLayer(TILE_URL, { attribution: TILE_ATTR }).addTo(map);

    const radiusMetres = radiusMiles * MILES_TO_METRES;
    const zoom = radiusToZoom(radiusMiles);
    map.setView([lat, lng], zoom);

    // Shaded coverage circle
    const circle = L.circle([lat, lng], {
      radius: radiusMetres,
      color: 'hsl(221,83%,53%)',
      fillColor: 'hsl(221,83%,53%)',
      fillOpacity: 0.15,
      weight: 2,
      opacity: 0.7,
    }).addTo(map);
    circleRef.current = circle;

    // Centre dot (home pin)
    const marker = L.circleMarker([lat, lng], {
      radius: 7,
      color: 'hsl(221,83%,53%)',
      fillColor: 'hsl(221,83%,53%)',
      fillOpacity: 1,
      weight: 2,
    }).addTo(map);
    markerRef.current = marker;

    zoneLayersRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      circleRef.current = null;
      markerRef.current = null;
      zoneLayersRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update circle radius & position when props change
  useEffect(() => {
    const map = mapRef.current;
    const circle = circleRef.current;
    const marker = markerRef.current;
    if (!map || !circle || !marker) return;

    const radiusMetres = radiusMiles * MILES_TO_METRES;
    circle.setRadius(radiusMetres);
    circle.setLatLng([lat, lng]);
    marker.setLatLng([lat, lng]);

    // If zones exist, fit bounds to include all zones + primary circle
    if (zones.length > 0) {
      const allBounds = L.latLngBounds([L.latLng(lat, lng)]);
      allBounds.extend(circle.getBounds());
      zones.forEach(z => {
        const zBounds = L.latLng(z.lat, z.lng).toBounds(z.radiusMiles * MILES_TO_METRES * 2);
        allBounds.extend(zBounds);
      });
      map.fitBounds(allBounds, { padding: [30, 30], animate: true });
    } else {
      map.setView([lat, lng], radiusToZoom(radiusMiles), { animate: true });
    }
  }, [radiusMiles, lat, lng, zones]);

  // Render additional saved zones
  useEffect(() => {
    const layerGroup = zoneLayersRef.current;
    if (!layerGroup) return;

    layerGroup.clearLayers();

    zones.forEach(zone => {
      const radiusMetres = zone.radiusMiles * MILES_TO_METRES;

      L.circle([zone.lat, zone.lng], {
        radius: radiusMetres,
        color: 'hsl(145,65%,47%)',
        fillColor: 'hsl(145,65%,47%)',
        fillOpacity: 0.10,
        weight: 2,
        opacity: 0.6,
        dashArray: '6 4',
      }).addTo(layerGroup);

      const dot = L.circleMarker([zone.lat, zone.lng], {
        radius: 5,
        color: 'hsl(145,65%,47%)',
        fillColor: 'hsl(145,65%,47%)',
        fillOpacity: 1,
        weight: 2,
      }).addTo(layerGroup);

      if (zone.label) {
        dot.bindTooltip(zone.label, { permanent: false, direction: 'top' });
      }
    });
  }, [zones]);

  return (
    <div
      ref={containerRef}
      className={`w-full rounded-xl overflow-hidden ${className}`}
      style={dark ? { filter: 'brightness(0.85) saturate(0.9)' } : undefined}
    />
  );
}