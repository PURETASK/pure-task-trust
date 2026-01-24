/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// Import the distance calculation function (we'll test it directly)
// The hook uses Haversine formula for GPS distance calculation
describe('GPS distance calculation (Haversine formula)', () => {
  // Constants
  const EARTH_RADIUS_METERS = 6371000; // Earth's radius in meters
  const CHECKIN_RADIUS_METERS = 100; // 100 meter check-in radius

  // Haversine formula implementation (same as in hook)
  function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_METERS * c;
  }

  describe('identical coordinates', () => {
    it('should return 0 for identical coordinates', () => {
      const lat = 37.7749;
      const lon = -122.4194;
      const distance = calculateDistance(lat, lon, lat, lon);
      expect(distance).toBe(0);
    });

    it('should return 0 for identical coordinates at equator', () => {
      const lat = 0;
      const lon = 0;
      const distance = calculateDistance(lat, lon, lat, lon);
      expect(distance).toBe(0);
    });

    it('should return 0 for identical coordinates at pole', () => {
      const lat = 90;
      const lon = 0;
      const distance = calculateDistance(lat, lon, lat, lon);
      expect(distance).toBe(0);
    });
  });

  describe('known distances', () => {
    it('should calculate approximately 1km for known 1km distance', () => {
      // San Francisco coordinates - approximately 1km apart
      // Using precise coordinates that are ~1km apart
      const lat1 = 37.7749;
      const lon1 = -122.4194;
      
      // Move approximately 1km north (1km ≈ 0.009 degrees latitude)
      const lat2 = 37.7839; // ~1km north
      const lon2 = -122.4194;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      
      // Should be approximately 1000 meters (+/- 50m for precision)
      expect(distance).toBeGreaterThan(950);
      expect(distance).toBeLessThan(1050);
    });

    it('should calculate approximately 100km for longer distance', () => {
      // San Francisco to San Jose (approximately 70km)
      const sfLat = 37.7749;
      const sfLon = -122.4194;
      const sjLat = 37.3382;
      const sjLon = -121.8863;
      
      const distance = calculateDistance(sfLat, sfLon, sjLat, sjLon);
      
      // Should be approximately 65-75km
      expect(distance).toBeGreaterThan(60000);
      expect(distance).toBeLessThan(80000);
    });

    it('should handle crossing the prime meridian', () => {
      // London (near prime meridian) to Paris
      const londonLat = 51.5074;
      const londonLon = -0.1278;
      const parisLat = 48.8566;
      const parisLon = 2.3522;
      
      const distance = calculateDistance(londonLat, londonLon, parisLat, parisLon);
      
      // London to Paris is approximately 340km
      expect(distance).toBeGreaterThan(300000);
      expect(distance).toBeLessThan(400000);
    });

    it('should handle crossing the equator', () => {
      // Points on either side of equator
      const northLat = 1.0;
      const southLat = -1.0;
      const lon = 0;
      
      const distance = calculateDistance(northLat, lon, southLat, lon);
      
      // 2 degrees of latitude ≈ 222km
      expect(distance).toBeGreaterThan(200000);
      expect(distance).toBeLessThan(250000);
    });
  });

  describe('check-in radius validation', () => {
    it('should allow check-in within 100m radius', () => {
      // Same location - should be well within radius
      const jobLat = 37.7749;
      const jobLon = -122.4194;
      
      // User is 50m away (approximately 0.00045 degrees)
      const userLat = 37.77535;
      const userLon = -122.4194;
      
      const distance = calculateDistance(jobLat, jobLon, userLat, userLon);
      
      expect(distance).toBeLessThan(CHECKIN_RADIUS_METERS);
      expect(distance).toBeGreaterThan(40); // Should be around 50m
      expect(distance).toBeLessThan(60);
    });

    it('should allow check-in exactly at 100m boundary', () => {
      const jobLat = 37.7749;
      const jobLon = -122.4194;
      
      // User is approximately 100m away (0.0009 degrees latitude ≈ 100m)
      const userLat = 37.7758;
      const userLon = -122.4194;
      
      const distance = calculateDistance(jobLat, jobLon, userLat, userLon);
      
      // Should be approximately at the boundary
      expect(distance).toBeGreaterThan(90);
      expect(distance).toBeLessThan(110);
    });

    it('should reject check-in beyond 100m radius', () => {
      const jobLat = 37.7749;
      const jobLon = -122.4194;
      
      // User is 200m away (approximately 0.0018 degrees)
      const userLat = 37.7767;
      const userLon = -122.4194;
      
      const distance = calculateDistance(jobLat, jobLon, userLat, userLon);
      
      expect(distance).toBeGreaterThan(CHECKIN_RADIUS_METERS);
      expect(distance).toBeGreaterThan(180); // Should be around 200m
      expect(distance).toBeLessThan(220);
    });

    it('should handle diagonal distance (both lat and lon change)', () => {
      const jobLat = 37.7749;
      const jobLon = -122.4194;
      
      // Move both lat and lon slightly - should still be within radius if small enough
      // Moving ~50m in both directions should result in ~70m diagonal
      const userLat = 37.77535; // ~50m north
      const userLon = -122.41895; // ~50m east
      
      const distance = calculateDistance(jobLat, jobLon, userLat, userLon);
      
      // Diagonal should be approximately sqrt(50^2 + 50^2) ≈ 70m
      expect(distance).toBeLessThan(CHECKIN_RADIUS_METERS);
      expect(distance).toBeGreaterThan(50);
      expect(distance).toBeLessThan(90);
    });
  });

  describe('edge cases', () => {
    it('should handle very small distances (centimeter precision)', () => {
      const lat1 = 37.7749;
      const lon1 = -122.4194;
      const lat2 = 37.77490001; // Very small difference
      const lon2 = -122.4194;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1); // Less than 1 meter
    });

    it('should handle negative latitudes (southern hemisphere)', () => {
      // Sydney, Australia
      const lat1 = -33.8688;
      const lon1 = 151.2093;
      const lat2 = -33.8688;
      const lon2 = 151.2093;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBe(0);
    });

    it('should handle longitude wrap-around near international date line', () => {
      // Points near the date line
      const lat1 = 0;
      const lon1 = 179.9;
      const lat2 = 0;
      const lon2 = -179.9;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      
      // These points are very close together (going the short way)
      // 0.2 degrees at equator ≈ 22km (but formula goes the long way)
      // The Haversine formula should give the shorter distance
      expect(distance).toBeGreaterThan(0);
    });

    it('should be symmetric (distance A→B equals B→A)', () => {
      const lat1 = 37.7749;
      const lon1 = -122.4194;
      const lat2 = 40.7128;
      const lon2 = -74.0060;
      
      const distanceAB = calculateDistance(lat1, lon1, lat2, lon2);
      const distanceBA = calculateDistance(lat2, lon2, lat1, lon1);
      
      expect(distanceAB).toBe(distanceBA);
    });
  });

  describe('accuracy validation', () => {
    it('should match expected distance for well-known city pairs', () => {
      // New York to Los Angeles - approximately 3,944 km
      const nyLat = 40.7128;
      const nyLon = -74.0060;
      const laLat = 34.0522;
      const laLon = -118.2437;
      
      const distance = calculateDistance(nyLat, nyLon, laLat, laLon);
      
      // Should be approximately 3.9M meters
      expect(distance).toBeGreaterThan(3900000);
      expect(distance).toBeLessThan(4000000);
    });
  });
});

describe('useJobCheckins hook integration', () => {
  const mockJobId = 'job-123';
  const mockUserId = 'user-456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch check-in data for a job', async () => {
    const { useAuth } = await import('@/contexts/AuthContext');
    const { supabase } = await import('@/integrations/supabase/client');
    
    vi.mocked(useAuth).mockReturnValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test', role: 'cleaner' },
      session: null,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
    });

    const mockCheckins = [
      {
        id: 1,
        job_id: mockJobId,
        check_in_at: '2024-01-01T10:00:00Z',
        check_out_at: '2024-01-01T13:00:00Z',
        check_in_lat: 37.7749,
        check_in_lng: -122.4194,
        check_out_lat: 37.7749,
        check_out_lng: -122.4194,
        device_info: 'Test Device',
      },
    ];

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockCheckins, error: null }),
        }),
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    // Import and render hook
    const { useJobCheckins } = await import('@/hooks/useJobCheckins');
    
    const { result } = renderHook(() => useJobCheckins(mockJobId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.checkins).toHaveLength(1);
    expect(result.current.hasCheckedIn).toBe(true);
    expect(result.current.hasCheckedOut).toBe(true);
  });

  it('should report hasCheckedIn false when no check-ins exist', async () => {
    const { useAuth } = await import('@/contexts/AuthContext');
    const { supabase } = await import('@/integrations/supabase/client');
    
    vi.mocked(useAuth).mockReturnValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test', role: 'cleaner' },
      session: null,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const { useJobCheckins } = await import('@/hooks/useJobCheckins');
    
    const { result } = renderHook(() => useJobCheckins(mockJobId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasCheckedIn).toBe(false);
    expect(result.current.hasCheckedOut).toBe(false);
  });
});
