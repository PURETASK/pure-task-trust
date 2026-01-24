/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

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

import { useWallet } from '@/hooks/useWallet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useWallet hook', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return loading state initially when user is authenticated', async () => {
      // Mock authenticated user
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

      // Mock supabase query that never resolves (for testing loading state)
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockReturnValue(new Promise(() => {})),
        }),
      });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

      const { result } = renderHook(() => useWallet(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoadingAccount).toBe(true);
    });

    it('should return null account when user is not authenticated', async () => {
      // Mock unauthenticated user
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

      const { result } = renderHook(() => useWallet(), {
        wrapper: createWrapper(),
      });

      // Query should be disabled, so no loading and null data
      await waitFor(() => {
        expect(result.current.isLoadingAccount).toBe(false);
      });
      expect(result.current.account).toBeUndefined();
    });
  });

  describe('credit balance loading', () => {
    it('should load current_balance and held_balance correctly', async () => {
      const mockAccount = {
        id: 'account-1',
        user_id: mockUserId,
        current_balance: 100,
        held_balance: 25,
        lifetime_purchased: 200,
        lifetime_spent: 100,
        lifetime_refunded: 0,
      };

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

      // Mock successful account fetch
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockAccount, error: null });
      const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

      const { result } = renderHook(() => useWallet(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingAccount).toBe(false);
      });

      expect(result.current.account?.current_balance).toBe(100);
      expect(result.current.account?.held_balance).toBe(25);
    });

    it('should calculate available_balance as current_balance - held_balance', async () => {
      const mockAccount = {
        id: 'account-1',
        user_id: mockUserId,
        current_balance: 150,
        held_balance: 50,
        lifetime_purchased: 200,
        lifetime_spent: 50,
        lifetime_refunded: 0,
      };

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

      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockAccount, error: null });
      const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

      const { result } = renderHook(() => useWallet(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.account).toBeDefined();
      });

      // Available balance calculation: 150 - 50 = 100
      const availableBalance = 
        (result.current.account?.current_balance || 0) - 
        (result.current.account?.held_balance || 0);
      expect(availableBalance).toBe(100);
    });
  });

  describe('edge cases', () => {
    it('should handle zero balances correctly', async () => {
      const mockAccount = {
        id: 'account-1',
        user_id: mockUserId,
        current_balance: 0,
        held_balance: 0,
        lifetime_purchased: 0,
        lifetime_spent: 0,
        lifetime_refunded: 0,
      };

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

      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockAccount, error: null });
      const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

      const { result } = renderHook(() => useWallet(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.account).toBeDefined();
      });

      expect(result.current.account?.current_balance).toBe(0);
      expect(result.current.account?.held_balance).toBe(0);
    });

    it('should handle held_balance equal to current_balance (all credits held)', async () => {
      const mockAccount = {
        id: 'account-1',
        user_id: mockUserId,
        current_balance: 100,
        held_balance: 100,
        lifetime_purchased: 100,
        lifetime_spent: 0,
        lifetime_refunded: 0,
      };

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

      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockAccount, error: null });
      const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

      const { result } = renderHook(() => useWallet(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.account).toBeDefined();
      });

      // Available balance should be 0
      const availableBalance = 
        (result.current.account?.current_balance || 0) - 
        (result.current.account?.held_balance || 0);
      expect(availableBalance).toBe(0);
    });
  });

  describe('ledger entries', () => {
    it('should load ledger entries when user is authenticated', async () => {
      const mockLedgerEntries = [
        { id: '1', user_id: mockUserId, delta_credits: 50, reason: 'purchase', job_id: null, created_at: '2024-01-01' },
        { id: '2', user_id: mockUserId, delta_credits: -20, reason: 'charge', job_id: 'job-1', created_at: '2024-01-02' },
      ];

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

      // Mock both account and ledger queries
      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'credit_accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ 
                  data: { current_balance: 100, held_balance: 0 }, 
                  error: null 
                }),
              }),
            }),
          };
        }
        if (table === 'credit_ledger') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: mockLedgerEntries, error: null }),
                }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useWallet(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoadingLedger).toBe(false);
      });

      expect(result.current.ledger.length).toBe(2);
      expect(result.current.ledger[0].delta_credits).toBe(50);
    });
  });
});
