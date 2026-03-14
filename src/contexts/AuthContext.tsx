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
    // Check for existing session first, then set up listener
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        // Await profile fetch before clearing loading state
        fetchUserProfile(existingSession.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);

        if (currentSession?.user) {
          // Handle Google OAuth role persistence for new users
          if (event === 'SIGNED_IN') {
            const pendingRole = localStorage.getItem('pendingOAuthRole') as UserRole | null;
            if (pendingRole) {
              // Check if role already exists in DB
              const { data: existingRole } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', currentSession.user.id)
                .maybeSingle();

              if (!existingRole) {
                await supabase.from('user_roles').insert({
                  user_id: currentSession.user.id,
                  role: pendingRole,
                });
                // Also create appropriate profile
                if (pendingRole === 'cleaner') {
                  await supabase.from('cleaner_profiles').upsert(
                    { user_id: currentSession.user.id, first_name: currentSession.user.user_metadata?.full_name },
                    { onConflict: 'user_id' }
                  );
                } else {
                  await supabase.from('client_profiles').upsert(
                    { user_id: currentSession.user.id, first_name: currentSession.user.user_metadata?.full_name },
                    { onConflict: 'user_id' }
                  );
                  await supabase.from('credit_accounts').upsert(
                    { user_id: currentSession.user.id },
                    { onConflict: 'user_id' }
                  );
                }
              }
              localStorage.removeItem('pendingOAuthRole');
            }

            // Send welcome email for new signups
            const createdAt = new Date(currentSession.user.created_at);
            const isNewUser = (Date.now() - createdAt.getTime()) < 60000;
            if (isNewUser) {
              const userRole = currentSession.user.user_metadata?.role as UserRole;
              if (userRole) {
                sendWelcomeEmail(currentSession.user.id, userRole, currentSession.user.email);
              }
            }
          }

          // Await profile fetch before clearing loading state to prevent auth flashes
          await fetchUserProfile(currentSession.user);
        } else {
          setUser(null);
        }

        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const sendWelcomeEmail = async (userId: string, role: UserRole, email?: string) => {
    try {
      const template = role === 'cleaner' ? 'welcome_cleaner' : 'welcome_client';
      supabase.functions.invoke('send-email', {
        body: {
          to: email,
          template,
          data: {
            name: email?.split('@')[0] || 'there',
          },
        },
      }).then(({ error }) => {
        if (error) {
          console.error('Failed to send welcome email:', error);
        } else {
          console.log('Welcome email sent successfully');
        }
      });
    } catch (error) {
      console.error('Error triggering welcome email:', error);
    }
  };

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profileData?.full_name || supabaseUser.email?.split('@')[0] || 'User',
        role: (roleData?.role as UserRole) || 'client',
        avatar: profileData?.avatar_url || undefined,
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Set basic user info even if profile fetch fails
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.email?.split('@')[0] || 'User',
        role: 'client',
      });
    }
  };

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      return { error: 'Login failed' };
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    role: UserRole,
    fullName?: string
  ): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName || email.split('@')[0],
          },
        },
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      return { error: 'Signup failed' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const loginWithGoogle = async (role?: UserRole): Promise<{ error?: string }> => {
    try {
      // Store selected role in localStorage only for new sign-ups (when role is provided)
      if (role) {
        localStorage.setItem('pendingOAuthRole', role);
      } else {
        localStorage.removeItem('pendingOAuthRole');
      }
      
      const redirectUrl = `${window.location.origin}/`;
      console.log('Google OAuth: Initiating with redirect to:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
      
      if (error) {
        console.error('Google OAuth error:', error);
        localStorage.removeItem('pendingOAuthRole');
        return { error: error.message };
      }
      
      console.log('Google OAuth: Redirect initiated', data);
      return {};
    } catch (error: any) {
      console.error('Google OAuth exception:', error);
      localStorage.removeItem('pendingOAuthRole');
      return { error: error?.message || 'Google login failed' };
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
