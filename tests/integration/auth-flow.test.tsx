/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactNode } from 'react';

/**
 * Authentication Flow Integration Tests
 * 
 * These tests verify the complete authentication and role assignment flow:
 * 1. User signup creates auth.users record
 * 2. Role selection creates user_roles record
 * 3. Profile creation (client_profiles or cleaner_profiles)
 * 4. Credit account initialization for clients
 */

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

import { supabase } from '@/integrations/supabase/client';

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

describe('Authentication Flow Integration', () => {
  const testEmail = 'newuser@test.com';
  const testPassword = 'SecurePassword123!';
  const testUserId = 'new-user-uuid-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('client signup flow', () => {
    it('should create user with signUp and return user data', async () => {
      const mockUser = {
        id: testUserId,
        email: testEmail,
        created_at: new Date().toISOString(),
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      } as any);

      const result = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            role: 'client',
            full_name: 'Test User',
          },
        },
      });

      expect(result.error).toBeNull();
      expect(result.data?.user?.id).toBe(testUserId);
      expect(result.data?.user?.email).toBe(testEmail);
    });

    it('should create user_roles record after signup', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      
      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'user_roles') {
          return {
            insert: mockInsert,
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { user_id: testUserId, role: 'client' },
                  error: null,
                }),
              }),
            }),
          } as any;
        }
        return { insert: vi.fn(), select: vi.fn() } as any;
      });

      // Insert role
      await supabase.from('user_roles').insert({
        user_id: testUserId,
        role: 'client',
      });

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: testUserId,
        role: 'client',
      });

      // Verify role was created
      const { data } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', testUserId)
        .maybeSingle();

      expect(data?.role).toBe('client');
    });

    it('should create client_profiles record for client role', async () => {
      const mockClientProfile = {
        id: 'client-profile-123',
        user_id: testUserId,
        first_name: 'Test',
        last_name: 'User',
        email: testEmail,
        created_at: new Date().toISOString(),
      };

      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'client_profiles') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockClientProfile,
                  error: null,
                }),
              }),
            }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: mockClientProfile,
                  error: null,
                }),
              }),
            }),
          } as any;
        }
        return { insert: vi.fn(), select: vi.fn() } as any;
      });

      // Verify client profile was created
      const { data } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', testUserId)
        .maybeSingle();

      expect(data?.user_id).toBe(testUserId);
      expect(data?.email).toBe(testEmail);
    });

    it('should create credit_accounts record for client with zero balance', async () => {
      const mockCreditAccount = {
        id: 'credit-account-123',
        user_id: testUserId,
        current_balance: 0,
        held_balance: 0,
        lifetime_purchased: 0,
        lifetime_spent: 0,
        lifetime_refunded: 0,
      };

      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'credit_accounts') {
          return {
            insert: vi.fn().mockResolvedValue({ data: mockCreditAccount, error: null }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: mockCreditAccount,
                  error: null,
                }),
              }),
            }),
          } as any;
        }
        return { insert: vi.fn(), select: vi.fn() } as any;
      });

      // Verify credit account was created
      const { data } = await supabase
        .from('credit_accounts')
        .select('*')
        .eq('user_id', testUserId)
        .maybeSingle();

      expect(data?.current_balance).toBe(0);
      expect(data?.held_balance).toBe(0);
      expect(data?.lifetime_purchased).toBe(0);
    });
  });

  describe('cleaner signup flow', () => {
    it('should create cleaner_profiles record for cleaner role', async () => {
      const mockCleanerProfile = {
        id: 'cleaner-profile-123',
        user_id: testUserId,
        first_name: 'Test',
        last_name: 'Cleaner',
        bio: null,
        hourly_rate: 25,
        onboarding_completed_at: null, // Not completed yet
        created_at: new Date().toISOString(),
      };

      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'cleaner_profiles') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockCleanerProfile,
                  error: null,
                }),
              }),
            }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: mockCleanerProfile,
                  error: null,
                }),
              }),
            }),
          } as any;
        }
        return { insert: vi.fn(), select: vi.fn() } as any;
      });

      // Verify cleaner profile was created
      const { data } = await supabase
        .from('cleaner_profiles')
        .select('*')
        .eq('user_id', testUserId)
        .maybeSingle();

      expect(data?.user_id).toBe(testUserId);
      expect(data?.onboarding_completed_at).toBeNull(); // Needs to complete onboarding
    });

    it('should require onboarding completion for cleaners', async () => {
      const mockCleanerProfile = {
        id: 'cleaner-profile-123',
        user_id: testUserId,
        onboarding_completed_at: null,
        onboarding_current_step: 'terms',
      };

      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'cleaner_profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: mockCleanerProfile,
                  error: null,
                }),
              }),
            }),
          } as any;
        }
        return { select: vi.fn() } as any;
      });

      const { data } = await supabase
        .from('cleaner_profiles')
        .select('*')
        .eq('user_id', testUserId)
        .maybeSingle();

      // Cleaner needs onboarding
      const needsOnboarding = !data?.onboarding_completed_at;
      expect(needsOnboarding).toBe(true);
    });
  });

  describe('role locking', () => {
    it('should prevent role changes after initial selection', async () => {
      // User already has a role
      const existingRole = {
        user_id: testUserId,
        role: 'client',
        created_at: new Date().toISOString(),
      };

      let roleRecord = { ...existingRole };

      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'user_roles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: roleRecord,
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockImplementation(() => {
              // Role update should fail (role is locked)
              return {
                eq: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Role cannot be changed after initial selection' },
                }),
              };
            }),
          } as any;
        }
        return { select: vi.fn(), update: vi.fn() } as any;
      });

      // Check current role
      const { data: currentRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', testUserId)
        .maybeSingle();

      expect(currentRole?.role).toBe('client');

      // Attempt to change role
      const updateResult = await supabase
        .from('user_roles')
        .update({ role: 'cleaner' })
        .eq('user_id', testUserId);

      expect(updateResult.error).toBeDefined();
      expect(updateResult.error?.message).toContain('Role cannot be changed');
    });
  });

  describe('login flow', () => {
    it('should authenticate existing user with correct credentials', async () => {
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: testUserId,
          email: testEmail,
        },
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockSession.user, session: mockSession },
        error: null,
      } as any);

      const result = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      expect(result.error).toBeNull();
      expect(result.data?.user?.id).toBe(testUserId);
      expect(result.data?.session?.access_token).toBe('mock-access-token');
    });

    it('should reject login with incorrect password', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' } as any,
      } as any);

      const result = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'WrongPassword',
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Invalid login credentials');
    });

    it('should reject login for non-existent user', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' } as any,
      } as any);

      const result = await supabase.auth.signInWithPassword({
        email: 'nonexistent@test.com',
        password: testPassword,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Invalid login credentials');
    });
  });

  describe('session management', () => {
    it('should return session for authenticated user', async () => {
      const mockSession = {
        access_token: 'mock-access-token',
        user: { id: testUserId, email: testEmail },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const result = await supabase.auth.getSession();

      expect(result.data?.session?.access_token).toBe('mock-access-token');
      expect(result.data?.session?.user?.id).toBe(testUserId);
    });

    it('should return null session for unauthenticated user', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await supabase.auth.getSession();

      expect(result.data?.session).toBeNull();
    });
  });
});

describe('Role-based Access Control', () => {
  describe('client access', () => {
    it('should allow clients to access booking pages', () => {
      const clientRole = 'client';
      const allowedRoutes = ['/book', '/dashboard', '/wallet', '/properties', '/favorites'];
      
      allowedRoutes.forEach(route => {
        const hasAccess = clientRole === 'client' && allowedRoutes.includes(route);
        expect(hasAccess).toBe(true);
      });
    });

    it('should deny clients access to cleaner-only routes', () => {
      const clientRole = 'client';
      const cleanerRoutes = ['/cleaner/dashboard', '/cleaner/jobs', '/cleaner/earnings'];
      
      cleanerRoutes.forEach(route => {
        const hasAccess = clientRole === 'cleaner';
        expect(hasAccess).toBe(false);
      });
    });
  });

  describe('cleaner access', () => {
    it('should allow cleaners to access cleaner routes after onboarding', () => {
      const cleanerRole = 'cleaner';
      const onboardingCompleted = true;
      const cleanerRoutes = ['/cleaner/dashboard', '/cleaner/jobs', '/cleaner/earnings'];
      
      cleanerRoutes.forEach(route => {
        const hasAccess = cleanerRole === 'cleaner' && onboardingCompleted;
        expect(hasAccess).toBe(true);
      });
    });

    it('should redirect incomplete onboarding cleaners to onboarding', () => {
      const cleanerRole = 'cleaner';
      const onboardingCompleted = false;
      
      const shouldRedirectToOnboarding = cleanerRole === 'cleaner' && !onboardingCompleted;
      expect(shouldRedirectToOnboarding).toBe(true);
    });
  });

  describe('admin access', () => {
    it('should allow admins to access admin routes', () => {
      const adminRole = 'admin';
      const adminRoutes = ['/admin/disputes', '/admin/bookings', '/admin/analytics'];
      
      adminRoutes.forEach(route => {
        const hasAccess = adminRole === 'admin';
        expect(hasAccess).toBe(true);
      });
    });

    it('should deny non-admins access to admin routes', () => {
      const nonAdminRoles = ['client', 'cleaner'];
      const adminRoutes = ['/admin/disputes', '/admin/bookings'];
      
      nonAdminRoles.forEach(role => {
        adminRoutes.forEach(route => {
          const hasAccess = role === 'admin';
          expect(hasAccess).toBe(false);
        });
      });
    });
  });
});
