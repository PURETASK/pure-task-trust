import { useState, useEffect, useRef } from 'react';

export interface NominatimResult {
  place_id: number;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  lat: string;
  lon: string;
}

export interface AddressSuggestion {
  id: number;
  displayName: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  lat: number;
  lng: number;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 3;

function parseNominatimResult(result: NominatimResult): AddressSuggestion {
  const address = result.address;
  const houseNumber = address.house_number || '';
  const road = address.road || '';
  const line1 = [houseNumber, road].filter(Boolean).join(' ');
  const city = address.city || address.town || address.village || '';
  const state = address.state || '';
  const postalCode = address.postcode || '';

  return {
    id: result.place_id,
    displayName: result.display_name,
    line1,
    city,
    state,
    postalCode,
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
  };
}

export function useAddressAutocomplete(query: string) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Clear suggestions if query is too short
    if (query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: query,
          format: 'json',
          addressdetails: '1',
          limit: '5',
          countrycodes: 'us',
        });

        const response = await fetch(`${NOMINATIM_URL}?${params}`, {
          signal: abortControllerRef.current.signal,
          headers: {
            'Accept': 'application/json',
            // Nominatim requires a User-Agent for API usage policy
            'User-Agent': 'CleaningApp/1.0',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch address suggestions');
        }

        const results: NominatimResult[] = await response.json();
        const parsed = results.map(parseNominatimResult);
        setSuggestions(parsed);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was cancelled, ignore
          return;
        }
        setError(err instanceof Error ? err.message : 'An error occurred');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  return { suggestions, isLoading, error, clearSuggestions };
}
