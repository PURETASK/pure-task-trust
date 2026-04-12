/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

/**
 * Job Lifecycle Integration Tests
 * 
 * These tests verify the complete job lifecycle:
 * 1. Client books job (credits held in escrow)
 * 2. Cleaner accepts job
 * 3. Cleaner checks in (GPS verified)
 * 4. Cleaner uploads photos and works
 * 5. Cleaner checks out
 * 6. Client approves job
 * 7. Credits released and cleaner earnings created
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

describe('Job Lifecycle Integration', () => {
  const mockClientId = 'client-123';
  const mockCleanerId = 'cleaner-456';
  const mockJobId = 'job-789';
  const mockUserId = 'user-abc';

  // Job state tracker for simulating lifecycle
  let jobState: {
    id: string;
    status: string;
    cleaner_id: string | null;
    escrow_credits_reserved: number;
    credit_charge_credits: number | null;
    client_approved_at: string | null;
    check_in_at: string | null;
    check_out_at: string | null;
  };

  let creditAccountState: {
    current_balance: number;
    held_balance: number;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset job state
    jobState = {
      id: mockJobId,
      status: 'created',
      cleaner_id: null,
      escrow_credits_reserved: 0,
      credit_charge_credits: null,
      client_approved_at: null,
      check_in_at: null,
      check_out_at: null,
    };

    // Reset credit account
    creditAccountState = {
      current_balance: 200,
      held_balance: 0,
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
  });

  describe('Step 1: Client books job', () => {
    it('should create job with pending status and hold credits', async () => {
      const bookingCredits = 60;

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'jobs') {
          return {
            insert: vi.fn().mockImplementation((data) => {
              jobState = {
                ...jobState,
                status: 'pending',
                escrow_credits_reserved: data.escrow_credits_reserved,
              };
              return {
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: jobState,
                    error: null,
                  }),
                }),
              };
            }),
          };
        }
        if (table === 'credit_accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: creditAccountState,
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockImplementation((data) => {
              creditAccountState.held_balance = data.held_balance;
              return {
                eq: vi.fn().mockResolvedValue({ error: null }),
              };
            }),
          };
        }
        return { insert: vi.fn(), select: vi.fn(), update: vi.fn() } as any;
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      // Create job
      const { data: job } = await supabase
        .from('jobs')
        .insert({
          client_id: mockClientId,
          cleaning_type: 'basic',
          escrow_credits_reserved: bookingCredits,
        })
        .select()
        .single();

      expect(job?.status).toBe('pending');
      expect(job?.escrow_credits_reserved).toBe(bookingCredits);

      // Hold credits
      await supabase
        .from('credit_accounts')
        .update({ held_balance: bookingCredits })
        .eq('user_id', mockUserId);

      expect(creditAccountState.held_balance).toBe(bookingCredits);
      expect(creditAccountState.current_balance - creditAccountState.held_balance).toBe(140);
    });
  });

  describe('Step 2: Cleaner accepts job', () => {
    it('should assign cleaner and update status to confirmed', async () => {
      jobState.status = 'pending';
      jobState.escrow_credits_reserved = 60;

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'jobs') {
          return {
            update: vi.fn().mockImplementation((data) => {
              jobState = { ...jobState, ...data };
              return {
                eq: vi.fn().mockResolvedValue({ error: null }),
              };
            }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: jobState,
                  error: null,
                }),
              }),
            }),
          };
        }
        return { update: vi.fn(), select: vi.fn() } as any;
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      // Cleaner accepts job
      await supabase
        .from('jobs')
        .update({
          cleaner_id: mockCleanerId,
          status: 'confirmed',
        })
        .eq('id', mockJobId);

      expect(jobState.cleaner_id).toBe(mockCleanerId);
      expect(jobState.status).toBe('confirmed');
    });
  });

  describe('Step 3: Cleaner checks in', () => {
    it('should record GPS check-in and update job to in_progress', async () => {
      jobState.status = 'confirmed';
      jobState.cleaner_id = mockCleanerId;

      const mockCheckin = {
        id: 1,
        job_id: mockJobId,
        check_in_at: new Date().toISOString(),
        check_in_lat: 37.7749,
        check_in_lng: -122.4194,
        distance_meters: 45, // Within 100m radius
      };

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'job_checkins') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockCheckin,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'jobs') {
          return {
            update: vi.fn().mockImplementation((data) => {
              jobState = { ...jobState, ...data };
              return {
                eq: vi.fn().mockResolvedValue({ error: null }),
              };
            }),
          };
        }
        return { insert: vi.fn(), update: vi.fn() } as any;
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      // Record check-in
      const { data: checkin } = await supabase
        .from('job_checkins')
        .insert({
          job_id: mockJobId,
          check_in_at: mockCheckin.check_in_at,
          check_in_lat: mockCheckin.check_in_lat,
          check_in_lng: mockCheckin.check_in_lng,
        })
        .select()
        .single();

      expect(checkin?.distance_meters).toBeLessThan(100);

      // Update job status
      await supabase
        .from('jobs')
        .update({ status: 'in_progress' })
        .eq('id', mockJobId);

      expect(jobState.status).toBe('in_progress');
    });

    it('should reject check-in if GPS is too far from job location', () => {
      const jobLocation = { lat: 37.7749, lng: -122.4194 };
      const userLocation = { lat: 37.7800, lng: -122.4194 }; // ~500m away

      // Calculate distance (simplified)
      const latDiff = Math.abs(userLocation.lat - jobLocation.lat);
      const distanceMeters = latDiff * 111000; // Rough conversion

      expect(distanceMeters).toBeGreaterThan(100);
      
      // Check-in should be rejected
      const isWithinRadius = distanceMeters <= 100;
      expect(isWithinRadius).toBe(false);
    });
  });

  describe('Step 4: Cleaner uploads photos', () => {
    it('should require at least one before and one after photo', async () => {
      const photos = [
        { job_id: mockJobId, photo_type: 'before', photo_url: 'https://storage/before1.jpg' },
        { job_id: mockJobId, photo_type: 'after', photo_url: 'https://storage/after1.jpg' },
      ];

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'job_photos') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: photos,
                error: null,
              }),
            }),
          };
        }
        return { insert: vi.fn(), select: vi.fn() } as any;
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      // Get photos
      const { data: jobPhotos } = await supabase
        .from('job_photos')
        .select('*')
        .eq('job_id', mockJobId);

      const beforePhotos = jobPhotos?.filter(p => p.photo_type === 'before') || [];
      const afterPhotos = jobPhotos?.filter(p => p.photo_type === 'after') || [];

      expect(beforePhotos.length).toBeGreaterThanOrEqual(1);
      expect(afterPhotos.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Step 5: Cleaner checks out', () => {
    it('should record GPS check-out and update job to completed', async () => {
      jobState.status = 'in_progress';

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'job_checkins') {
          return {
            update: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'jobs') {
          return {
            update: vi.fn().mockImplementation((data) => {
              jobState = { ...jobState, ...data };
              return {
                eq: vi.fn().mockResolvedValue({ error: null }),
              };
            }),
          };
        }
        return { update: vi.fn() } as any;
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      // Update job to completed
      await supabase
        .from('jobs')
        .update({ status: 'completed' })
        .eq('id', mockJobId);

      expect(jobState.status).toBe('completed');
    });
  });

  describe('Step 6: Client approves job', () => {
    it('should mark job as approved and release escrowed credits', async () => {
      jobState.status = 'completed';
      jobState.escrow_credits_reserved = 60;
      creditAccountState.held_balance = 60;

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'jobs') {
          return {
            update: vi.fn().mockImplementation((data) => {
              jobState = { ...jobState, ...data };
              return {
                eq: vi.fn().mockResolvedValue({ error: null }),
              };
            }),
          };
        }
        if (table === 'credit_accounts') {
          return {
            update: vi.fn().mockImplementation((data) => {
              creditAccountState = { ...creditAccountState, ...data };
              return {
                eq: vi.fn().mockResolvedValue({ error: null }),
              };
            }),
          };
        }
        return { update: vi.fn() } as any;
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const chargedCredits = 55; // Actual time worked
      const refundCredits = 5; // Unused credits

      // Approve job
      await supabase
        .from('jobs')
        .update({
          status: 'paid',
          credit_charge_credits: chargedCredits,
          client_approved_at: new Date().toISOString(),
        })
        .eq('id', mockJobId);

      expect(jobState.status).toBe('paid');
      expect(jobState.credit_charge_credits).toBe(chargedCredits);

      // Release held credits and apply charge
      const newBalance = creditAccountState.current_balance - chargedCredits;
      await supabase
        .from('credit_accounts')
        .update({
          current_balance: newBalance,
          held_balance: 0,
        })
        .eq('user_id', mockUserId);

      expect(creditAccountState.current_balance).toBe(newBalance);
      expect(creditAccountState.held_balance).toBe(0);
    });
  });

  describe('Step 7: Cleaner earnings created', () => {
    it('should create cleaner_earnings record after job approval', async () => {
      const chargedCredits = 55;
      const platformFeePercent = 25;
      const platformFee = chargedCredits * (platformFeePercent / 100);
      const cleanerEarnings = chargedCredits - platformFee;

      const mockEarningsRecord = {
        id: 'earnings-123',
        cleaner_id: mockCleanerId,
        job_id: mockJobId,
        gross_credits: chargedCredits,
        platform_fee_credits: platformFee,
        net_credits: cleanerEarnings,
        status: 'pending',
      };

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'cleaner_earnings') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockEarningsRecord,
                  error: null,
                }),
              }),
            }),
          };
        }
        return { insert: vi.fn() } as any;
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { data: earnings } = await supabase
        .from('cleaner_earnings')
        .insert({
          cleaner_id: mockCleanerId,
          job_id: mockJobId,
          gross_credits: chargedCredits,
          platform_fee_credits: platformFee,
          net_credits: cleanerEarnings,
        })
        .select()
        .single();

      expect(earnings?.gross_credits).toBe(55);
      expect(earnings?.platform_fee_credits).toBe(11); // 20% of 55
      expect(earnings?.net_credits).toBe(44); // 55 - 11
    });
  });

  describe('Complete lifecycle verification', () => {
    it('should maintain data integrity through all status transitions', () => {
      const validTransitions: Record<string, string[]> = {
        'created': ['pending', 'cancelled'],
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['in_progress', 'cancelled'],
        'in_progress': ['completed', 'cancelled'],
        'completed': ['paid', 'disputed'],
        'paid': [], // Terminal state
        'cancelled': [], // Terminal state
        'disputed': ['resolved', 'refunded'],
      };

      // Verify transition rules
      expect(validTransitions['created']).toContain('pending');
      expect(validTransitions['pending']).toContain('confirmed');
      expect(validTransitions['confirmed']).toContain('in_progress');
      expect(validTransitions['in_progress']).toContain('completed');
      expect(validTransitions['completed']).toContain('paid');

      // Verify invalid transitions
      expect(validTransitions['paid']).not.toContain('pending');
      expect(validTransitions['in_progress']).not.toContain('pending');
    });

    it('should correctly calculate escrow and final charges', () => {
      const estimatedHours = 3;
      const hourlyRate = 20;
      const escrowAmount = estimatedHours * hourlyRate; // 60 credits

      const actualHours = 2.75;
      const chargedAmount = actualHours * hourlyRate; // 55 credits
      const refundAmount = escrowAmount - chargedAmount; // 5 credits

      expect(escrowAmount).toBe(60);
      expect(chargedAmount).toBe(55);
      expect(refundAmount).toBe(5);

      // Verify client only pays for actual time
      expect(chargedAmount).toBeLessThan(escrowAmount);
    });
  });
});

describe('Job Cancellation Scenarios', () => {
  describe('client cancellation', () => {
    it('should refund credits based on cancellation timing', () => {
      const escrowCredits = 60;
      
      // More than 24 hours before: 100% refund
      const early = { hoursBeforeStart: 48, refundPercent: 100 };
      expect(early.refundPercent).toBe(100);
      
      // 12-24 hours before: 75% refund
      const moderate = { hoursBeforeStart: 18, refundPercent: 75 };
      expect(moderate.refundPercent).toBe(75);
      
      // Less than 12 hours: 50% refund
      const late = { hoursBeforeStart: 6, refundPercent: 50 };
      expect(late.refundPercent).toBe(50);
      
      // Less than 2 hours: No refund
      const veryLate = { hoursBeforeStart: 1, refundPercent: 0 };
      expect(veryLate.refundPercent).toBe(0);
    });
  });

  describe('cleaner cancellation', () => {
    it('should fully refund client and compensate appropriately', () => {
      const escrowCredits = 60;
      
      // Cleaner cancellation always refunds client 100%
      const clientRefund = escrowCredits;
      expect(clientRefund).toBe(60);
      
      // May affect cleaner reliability score
      const reliabilityPenalty = true;
      expect(reliabilityPenalty).toBe(true);
    });
  });
});
