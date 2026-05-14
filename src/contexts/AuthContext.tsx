import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'client' | 'cleaner' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, role: UserRole, fullName?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  loginWithGoogle: (role?: UserRole) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_PROFILE_TIMEOUT_MS = 8000;

async function withAuthTimeout<T>(operation: PromiseLike<T>, timeoutMessage: string): Promise<T> {
  let timeoutId: number | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(timeoutMessage)), AUTH_PROFILE_TIMEOUT_MS);
  });

  try {
    return await Promise.race([Promise.resolve(operation), timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let requestId = 0;

    const hydrateSession = (currentSession: Session | null) => {
      const currentRequestId = ++requestId;

      setSession(currentSession);
      if (!currentSession?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      void fetchUserProfile(currentSession.user).finally(() => {
        if (mounted && currentRequestId === requestId) {
          setIsLoading(false);
        }
      });
    };

    // 1. Restore session from localStorage first so role/profile queries have a token.
    supabase.auth.getSession()
      .then(({ data: { session: initialSession } }) => {
        if (mounted) hydrateSession(initialSession);
      })
      .catch((error) => {
        console.error('Failed to restore auth session:', error);
        if (!mounted) return;
        setSession(null);
        setUser(null);
        setIsLoading(false);
      });

    // 2. Listen for subsequent auth changes. Do not await inside this callback;
    // Supabase warns that async work here can deadlock auth initialization.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;
        // Skip INITIAL_SESSION — already handled by getSession() above.
        if (event === 'INITIAL_SESSION') return;

        hydrateSession(currentSession);
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const [{ data: roleData }, { data: profileData }] = await Promise.all([
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', supabaseUser.id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', supabaseUser.id)
          .maybeSingle(),
      ]);

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profileData?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
        // SECURITY: role MUST come from the user_roles table (server-controlled).
        // user_metadata is user-writable and would allow self-elevation.
        role: (roleData?.role as UserRole) || 'client',
        avatar: profileData?.avatar_url || undefined,
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
        // SECURITY: never trust user_metadata for role — default to least privilege.
        role: 'client',
      });
    }
  };

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? { error: error.message } : {};
    } catch {
      return { error: 'Login failed' };
    }
  };

  const signup = async (
    email: string,
    password: string,
    role: UserRole,
    fullName?: string,
  ): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            role,
            full_name: fullName || email.split('@')[0],
          },
        },
      });
      return error ? { error: error.message } : {};
    } catch {
      return { error: 'Signup failed' };
    }
  };

  const logout = async () => {
    // Clear local state FIRST so the UI reflects logged-out immediately
    setUser(null);
    setSession(null);

    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // signOut can fail in Preview/iframe environments — manually purge tokens
    }

    // Belt-and-suspenders: remove all supabase auth keys from localStorage
    // so a page refresh doesn't restore the session
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('sb-') || k.includes('supabase'))
        .forEach(k => localStorage.removeItem(k));
    } catch {
      // localStorage may be unavailable in some environments
    }
  };

  const loginWithGoogle = async (role?: UserRole): Promise<{ error?: string }> => {
    try {
      // Persist selected role so usePostSignup can pick it up after the OAuth redirect
      if (role) {
        localStorage.setItem('pendingOAuthRole', role);
      } else {
        localStorage.removeItem('pendingOAuthRole');
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        localStorage.removeItem('pendingOAuthRole');
        return { error: error.message };
      }

      return {};
    } catch (err: any) {
      localStorage.removeItem('pendingOAuthRole');
      return { error: err?.message || 'Google login failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
