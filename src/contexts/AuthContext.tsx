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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Restore session from localStorage synchronously so the UI unblocks fast.
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!mounted) return;
      setSession(initialSession);
      if (initialSession?.user) {
        await fetchUserProfile(initialSession.user);
      } else {
        setUser(null);
      }
      if (mounted) setIsLoading(false);
    });

    // 2. Listen for subsequent auth changes (sign-in, sign-out, token refresh).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        // Skip INITIAL_SESSION — already handled by getSession() above.
        if (event === 'INITIAL_SESSION') return;

        setSession(currentSession);
        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user);
        } else {
          setUser(null);
        }
        if (mounted) setIsLoading(false);
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
