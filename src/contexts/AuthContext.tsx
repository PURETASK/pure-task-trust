import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, role: UserRole) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  loginWithGoogle: (role: UserRole) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // In production, this would call the auth API
      // For now, check localStorage for demo purposes
      const storedUser = localStorage.getItem('puretask_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to check session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      // In production, this would call the auth API
      // Demo: accept any email/password
      const mockUser: User = {
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0],
        role: 'client',
      };
      setUser(mockUser);
      localStorage.setItem('puretask_user', JSON.stringify(mockUser));
      return {};
    } catch (error) {
      return { error: 'Login failed' };
    }
  };

  const signup = async (email: string, password: string, role: UserRole): Promise<{ error?: string }> => {
    try {
      const mockUser: User = {
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0],
        role,
      };
      setUser(mockUser);
      localStorage.setItem('puretask_user', JSON.stringify(mockUser));
      return {};
    } catch (error) {
      return { error: 'Signup failed' };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('puretask_user');
  };

  const loginWithGoogle = async (role: UserRole): Promise<{ error?: string }> => {
    try {
      // In production, this would initiate OAuth flow
      const mockUser: User = {
        id: crypto.randomUUID(),
        email: 'demo@example.com',
        name: 'Demo User',
        role,
      };
      setUser(mockUser);
      localStorage.setItem('puretask_user', JSON.stringify(mockUser));
      return {};
    } catch (error) {
      return { error: 'Google login failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
