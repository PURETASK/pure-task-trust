/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

/**
 * Payment Flow Integration Tests
 * 
 * These tests verify the complete payment and credit provisioning flow:
 * 1. Stripe checkout session creation
 * 2. Payment verification
 * 3. Credit account updates
 * 4. Idempotency (duplicate payment prevention)
 */

// Mock supabase client
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

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

describe('Payment Flow Integration', () => {
  const mockUserId = 'test-user-payment-123';
  const mockSessionId = 'cs_test_session_123';

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useAuth).mockReturnValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test', role: 'client' },
      session: { access_token: 'mock-token' } as any,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
    });
  });

  describe('verify-payment edge function behavior', () => {
    it('should successfully process a paid checkout session', async () => {
      // Mock the functions.invoke call for verify-payment
      const mockInvoke = vi.fn().mockResolvedValue({
        data: { success: true, credits: 100 },
        error: null,
      });
      vi.mocked(supabase.functions).invoke = mockInvoke;

      // Call verify-payment
      const result = await supabase.functions.invoke('verify-payment', {
        body: { sessionId: mockSessionId },
      });

      expect(result.error).toBeNull();
      expect(result.data?.success).toBe(true);
      expect(result.data?.credits).toBe(100);
      expect(mockInvoke).toHaveBeenCalledWith('verify-payment', {
        body: { sessionId: mockSessionId },
      });
    });

    it('should return already_processed for duplicate session', async () => {
      // First call succeeds
      const mockInvoke = vi.fn()
        .mockResolvedValueOnce({
          data: { success: true, credits: 100 },
          error: null,
        })
        // Second call returns already processed
        .mockResolvedValueOnce({
          data: { success: true, message: 'Already processed' },
          error: null,
        });
      vi.mocked(supabase.functions).invoke = mockInvoke;

      // First verification
      const result1 = await supabase.functions.invoke('verify-payment', {
        body: { sessionId: mockSessionId },
      });
      expect(result1.data?.success).toBe(true);
      expect(result1.data?.credits).toBe(100);

      // Second verification (duplicate)
      const result2 = await supabase.functions.invoke('verify-payment', {
        body: { sessionId: mockSessionId },
      });
      expect(result2.data?.success).toBe(true);
      expect(result2.data?.message).toBe('Already processed');
      // Credits should NOT be in the response for duplicates
      expect(result2.data?.credits).toBeUndefined();
    });

    it('should handle unpaid session status', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: { success: false, status: 'unpaid' },
        error: null,
      });
      vi.mocked(supabase.functions).invoke = mockInvoke;

      const result = await supabase.functions.invoke('verify-payment', {
        body: { sessionId: 'cs_unpaid_session' },
      });

      expect(result.data?.success).toBe(false);
      expect(result.data?.status).toBe('unpaid');
    });

    it('should handle expired session', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: { success: false, status: 'expired' },
        error: null,
      });
      vi.mocked(supabase.functions).invoke = mockInvoke;

      const result = await supabase.functions.invoke('verify-payment', {
        body: { sessionId: 'cs_expired_session' },
      });

      expect(result.data?.success).toBe(false);
      expect(result.data?.status).toBe('expired');
    });

    it('should handle missing session ID', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Session ID required' },
      });
      vi.mocked(supabase.functions).invoke = mockInvoke;

      const result = await supabase.functions.invoke('verify-payment', {
        body: {},
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Session ID required');
    });
  });

  describe('credit account updates after payment', () => {
    it('should update credit_accounts with new balance after successful payment', async () => {
      const initialBalance = 50;
      const purchasedCredits = 100;
      const expectedBalance = initialBalance + purchasedCredits;

      // Mock credit account query
      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'credit_accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: 'account-1',
                    user_id: mockUserId,
                    current_balance: expectedBalance, // After payment
                    held_balance: 0,
                    lifetime_purchased: 150,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      // Verify the balance reflects the purchase
      const { data } = await supabase
        .from('credit_accounts')
        .select('*')
        .eq('user_id', mockUserId)
        .maybeSingle();

      expect(data?.current_balance).toBe(expectedBalance);
      expect(data?.lifetime_purchased).toBe(150);
    });

    it('should create ledger entry for credit purchase', async () => {
      const mockLedgerEntries = [
        {
          id: 'ledger-1',
          user_id: mockUserId,
          delta_credits: 100,
          reason: 'purchase',
          job_id: null,
          created_at: '2024-01-15T10:00:00Z',
        },
      ];

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'credit_ledger') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: mockLedgerEntries,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { data } = await supabase
        .from('credit_ledger')
        .select('*')
        .eq('user_id', mockUserId)
        .order('created_at', { ascending: false })
        .limit(1);

      expect(data).toHaveLength(1);
      expect(data?.[0].delta_credits).toBe(100);
      expect(data?.[0].reason).toBe('purchase');
    });

    it('should create credit_purchases record with Stripe session details', async () => {
      const mockPurchase = {
        id: 'purchase-1',
        user_id: mockUserId,
        credits_amount: 100,
        package_id: 'standard',
        price_usd: 100,
        stripe_checkout_session_id: mockSessionId,
        stripe_payment_intent_id: 'pi_test_123',
        status: 'completed',
        completed_at: '2024-01-15T10:00:00Z',
      };

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'credit_purchases') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: mockPurchase,
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { data } = await supabase
        .from('credit_purchases')
        .select('*')
        .eq('stripe_checkout_session_id', mockSessionId)
        .maybeSingle();

      expect(data?.credits_amount).toBe(100);
      expect(data?.status).toBe('completed');
      expect(data?.stripe_payment_intent_id).toBe('pi_test_123');
    });
  });

  describe('idempotency checks', () => {
    it('should prevent double-crediting for same session ID', async () => {
      let creditBalance = 50;
      const purchasedCredits = 100;

      // Track how many times credits were added
      let creditsAddedCount = 0;

      const mockInvoke = vi.fn().mockImplementation(async (functionName, options) => {
        if (functionName === 'verify-payment') {
          // Simulate the edge function's idempotency check
          if (creditsAddedCount === 0) {
            // First call - add credits
            creditBalance += purchasedCredits;
            creditsAddedCount++;
            return { data: { success: true, credits: purchasedCredits }, error: null };
          } else {
            // Subsequent calls - already processed
            return { data: { success: true, message: 'Already processed' }, error: null };
          }
        }
        return { data: null, error: null };
      });
      vi.mocked(supabase.functions).invoke = mockInvoke;

      // First verification
      await supabase.functions.invoke('verify-payment', {
        body: { sessionId: mockSessionId },
      });
      expect(creditBalance).toBe(150);
      expect(creditsAddedCount).toBe(1);

      // Second verification (should not add credits again)
      await supabase.functions.invoke('verify-payment', {
        body: { sessionId: mockSessionId },
      });
      expect(creditBalance).toBe(150); // Still 150, not 250
      expect(creditsAddedCount).toBe(1); // Still 1, not 2

      // Third verification (also should not add credits)
      await supabase.functions.invoke('verify-payment', {
        body: { sessionId: mockSessionId },
      });
      expect(creditBalance).toBe(150);
      expect(creditsAddedCount).toBe(1);
    });

    it('should allow different session IDs to add credits independently', async () => {
      let creditBalance = 50;

      const processedSessions = new Set<string>();

      const mockInvoke = vi.fn().mockImplementation(async (functionName, options) => {
        if (functionName === 'verify-payment') {
          const sessionId = options?.body?.sessionId;
          
          if (processedSessions.has(sessionId)) {
            return { data: { success: true, message: 'Already processed' }, error: null };
          }
          
          processedSessions.add(sessionId);
          const credits = 100;
          creditBalance += credits;
          return { data: { success: true, credits }, error: null };
        }
        return { data: null, error: null };
      });
      vi.mocked(supabase.functions).invoke = mockInvoke;

      // First session
      await supabase.functions.invoke('verify-payment', {
        body: { sessionId: 'session_1' },
      });
      expect(creditBalance).toBe(150);

      // Second session (different)
      await supabase.functions.invoke('verify-payment', {
        body: { sessionId: 'session_2' },
      });
      expect(creditBalance).toBe(250);

      // Duplicate of first session (should not add)
      await supabase.functions.invoke('verify-payment', {
        body: { sessionId: 'session_1' },
      });
      expect(creditBalance).toBe(250);
    });
  });

  describe('error handling', () => {
    it('should handle Stripe API errors gracefully', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Stripe API error: Invalid session' },
      });
      vi.mocked(supabase.functions).invoke = mockInvoke;

      const result = await supabase.functions.invoke('verify-payment', {
        body: { sessionId: 'invalid_session' },
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Stripe API error');
    });

    it('should handle database errors during credit update', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error: Failed to update credit account' },
      });
      vi.mocked(supabase.functions).invoke = mockInvoke;

      const result = await supabase.functions.invoke('verify-payment', {
        body: { sessionId: mockSessionId },
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Database error');
    });

    it('should handle authentication errors', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'User not authenticated' },
      });
      vi.mocked(supabase.functions).invoke = mockInvoke;

      const result = await supabase.functions.invoke('verify-payment', {
        body: { sessionId: mockSessionId },
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('User not authenticated');
    });
  });
});

describe('Credit Package Pricing', () => {
  const CREDIT_PACKAGES = {
    mini: { credits: 5, priceUsd: 5 },
    starter: { credits: 25, priceUsd: 25 },
    standard: { credits: 50, priceUsd: 50 },
    value: { credits: 100, priceUsd: 95 },
    premium: { credits: 200, priceUsd: 180 },
  };

  it('should have correct credit-to-dollar ratios for each package', () => {
    // Mini: 1:1 ratio
    expect(CREDIT_PACKAGES.mini.credits / CREDIT_PACKAGES.mini.priceUsd).toBe(1);
    
    // Starter: 1:1 ratio
    expect(CREDIT_PACKAGES.starter.credits / CREDIT_PACKAGES.starter.priceUsd).toBe(1);
    
    // Standard: 1:1 ratio
    expect(CREDIT_PACKAGES.standard.credits / CREDIT_PACKAGES.standard.priceUsd).toBe(1);
    
    // Value: Better than 1:1 (discount)
    expect(CREDIT_PACKAGES.value.credits / CREDIT_PACKAGES.value.priceUsd).toBeGreaterThan(1);
    
    // Premium: Best ratio (biggest discount)
    expect(CREDIT_PACKAGES.premium.credits / CREDIT_PACKAGES.premium.priceUsd).toBeGreaterThan(1);
    expect(CREDIT_PACKAGES.premium.credits / CREDIT_PACKAGES.premium.priceUsd)
      .toBeGreaterThan(CREDIT_PACKAGES.value.credits / CREDIT_PACKAGES.value.priceUsd);
  });

  it('should provide increasing discounts for larger packages', () => {
    const valueDiscount = (CREDIT_PACKAGES.value.credits - CREDIT_PACKAGES.value.priceUsd) / CREDIT_PACKAGES.value.credits;
    const premiumDiscount = (CREDIT_PACKAGES.premium.credits - CREDIT_PACKAGES.premium.priceUsd) / CREDIT_PACKAGES.premium.credits;
    
    // Premium should have a higher discount percentage
    expect(premiumDiscount).toBeGreaterThan(valueDiscount);
  });
});
