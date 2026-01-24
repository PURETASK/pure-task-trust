/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
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
  },
}));

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { useBooking, BookingData } from '@/hooks/useBooking';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Test wrapper with QueryClient and Router
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe('useBooking hook', () => {
  const mockUserId = 'test-user-123';
  const mockClientProfileId = 'client-profile-456';
  const mockCleanerId = 'cleaner-789';

  const validBookingData: BookingData = {
    cleaningType: 'basic',
    hours: 3,
    addOns: [],
    totalCredits: 60,
    cleanerId: mockCleanerId,
    address: '123 Test St',
    scheduledDate: '2024-12-01T10:00:00Z',
    notes: 'Test booking',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('authentication checks', () => {
    it('should reject booking when user is not authenticated', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
      });

      const { result } = renderHook(() => useBooking(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await expect(result.current.createBooking(validBookingData)).rejects.toThrow('Not authenticated');
      });
    });
  });

  describe('credit validation', () => {
    it('should reject booking when user has insufficient credits', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: mockUserId, email: 'test@example.com', name: 'Test', role: 'client' },
        session: null,
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
      });

      // Mock credit account with insufficient balance
      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'credit_accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { current_balance: 30, held_balance: 0 }, // Only 30 credits available
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useBooking(), {
        wrapper: createWrapper(),
      });

      // Booking requires 60 credits but user only has 30
      await act(async () => {
        await expect(result.current.createBooking(validBookingData)).rejects.toThrow(
          'Insufficient credits. You have 30 available, but need 60.'
        );
      });
    });

    it('should reject booking when available balance is less than total credits (accounting for held)', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: mockUserId, email: 'test@example.com', name: 'Test', role: 'client' },
        session: null,
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
      });

      // Mock: 100 current balance but 50 held, so only 50 available
      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'credit_accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { current_balance: 100, held_balance: 50 }, // 50 available
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useBooking(), {
        wrapper: createWrapper(),
      });

      // Booking requires 60 credits but user only has 50 available
      await act(async () => {
        await expect(result.current.createBooking(validBookingData)).rejects.toThrow(
          'Insufficient credits. You have 50 available, but need 60.'
        );
      });
    });

    it('should allow booking when user has exactly enough credits', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: mockUserId, email: 'test@example.com', name: 'Test', role: 'client' },
        session: null,
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
      });

      const mockJobId = 'job-123';
      
      // Mock all required queries
      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'credit_accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { current_balance: 60, held_balance: 0 }, // Exactly 60 credits
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'client_profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: mockClientProfileId },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'jobs') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: mockJobId },
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useBooking(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        const job = await result.current.createBooking(validBookingData);
        expect(job.id).toBe(mockJobId);
      });
    });

    it('should allow booking when user has more than enough credits', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: mockUserId, email: 'test@example.com', name: 'Test', role: 'client' },
        session: null,
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
      });

      const mockJobId = 'job-456';
      
      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'credit_accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { current_balance: 500, held_balance: 100 }, // 400 available
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'client_profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: mockClientProfileId },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'jobs') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: mockJobId },
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useBooking(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        const job = await result.current.createBooking(validBookingData);
        expect(job.id).toBe(mockJobId);
      });
    });
  });

  describe('cleaner validation', () => {
    it('should reject booking when no cleaner is selected', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: mockUserId, email: 'test@example.com', name: 'Test', role: 'client' },
        session: null,
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
      });

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'credit_accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { current_balance: 100, held_balance: 0 },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'client_profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: mockClientProfileId },
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useBooking(), {
        wrapper: createWrapper(),
      });

      const bookingWithoutCleaner: BookingData = {
        ...validBookingData,
        cleanerId: undefined, // No cleaner selected
      };

      await act(async () => {
        await expect(result.current.createBooking(bookingWithoutCleaner)).rejects.toThrow(
          'Please select a cleaner before booking.'
        );
      });
    });
  });

  describe('successful booking', () => {
    it('should navigate to booking page and show success toast on successful booking', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: mockUserId, email: 'test@example.com', name: 'Test', role: 'client' },
        session: null,
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
      });

      const mockJobId = 'job-success-123';
      
      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'credit_accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { current_balance: 200, held_balance: 0 },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'client_profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: mockClientProfileId },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'jobs') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: mockJobId },
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useBooking(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.createBooking(validBookingData);
      });

      // Wait for onSuccess to be called
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Booking confirmed! Credits held.');
      });

      expect(mockNavigate).toHaveBeenCalledWith(`/booking/${mockJobId}`);
    });
  });

  describe('isCreating state', () => {
    it('should track pending state during booking creation', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: mockUserId, email: 'test@example.com', name: 'Test', role: 'client' },
        session: null,
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
      });

      // Create a deferred promise to control timing
      let resolvePromise: (value: any) => void;
      const deferredPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'credit_accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockReturnValue(deferredPromise),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useBooking(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isCreating).toBe(false);

      // Start booking (don't await)
      act(() => {
        result.current.createBooking(validBookingData).catch(() => {});
      });

      // Should be pending
      await waitFor(() => {
        expect(result.current.isCreating).toBe(true);
      });

      // Resolve to complete
      act(() => {
        resolvePromise!({ data: { current_balance: 0, held_balance: 0 }, error: null });
      });
    });
  });
});
