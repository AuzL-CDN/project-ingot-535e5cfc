import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User {
  id: number;
  email: string;
  display_name: string | null;
  created_at: string;
}

interface Profile {
  id: number;
  user_id: number;
  display_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: { user: User } | null;
  profile: Profile | null;
  roles: string[];
  isAdmin: boolean;
  isModerator: boolean;
  isDev: boolean;
  isM365: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // DEV MODE: Enable admin access on localhost only
  const isDevMode = import.meta.env.DEV && 
    (typeof window !== 'undefined' && 
     (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1'));

  const fetchUserData = async () => {
    try {
      console.log('[AuthProvider] Fetching session from PHP API...');
      const response = await api.auth.session();
      
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const profileData = response.data.profile;
        const userRoles = response.data.roles || [];
        
        console.log('[AuthProvider] Session loaded:', {
          email: userData.email,
          roles: userRoles,
          isAdmin: userRoles.includes('admin')
        });
        
        setUser(userData);
        setProfile(profileData);
        setRoles(userRoles);
      } else {
        console.log('[AuthProvider] No active session');
        setUser(null);
        setProfile(null);
        setRoles([]);
      }
    } catch (error) {
      console.error('[AuthProvider] Failed to fetch session:', error);
      setUser(null);
      setProfile(null);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    await fetchUserData();
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password);
      
      if (response.success) {
        console.log('[AuthProvider] Sign in successful');
        await fetchUserData();
        return { error: null };
      } else {
        return { error: { message: response.error || 'Login failed' } };
      }
    } catch (error) {
      console.error('[AuthProvider] Sign in error:', error);
      return { error: { message: 'Network error during login' } };
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const response = await api.auth.register(email, password, displayName);
      
      if (response.success) {
        console.log('[AuthProvider] Sign up successful');
        await fetchUserData();
        return { error: null };
      } else {
        return { error: { message: response.error || 'Registration failed' } };
      }
    } catch (error) {
      console.error('[AuthProvider] Sign up error:', error);
      return { error: { message: 'Network error during registration' } };
    }
  };

  const signOut = async () => {
    try {
      await api.auth.logout();
      console.log('[AuthProvider] Signed out');
    } catch (error) {
      console.error('[AuthProvider] Sign out error:', error);
    } finally {
      setUser(null);
      setProfile(null);
      setRoles([]);
    }
  };

  // In dev mode, override with mock admin user
  const value: AuthContextType = isDevMode ? {
    user: { 
      id: 1, 
      email: 'dev@localhost',
      display_name: 'Dev Admin',
      created_at: new Date().toISOString()
    },
    session: {
      user: { 
        id: 1, 
        email: 'dev@localhost',
        display_name: 'Dev Admin',
        created_at: new Date().toISOString()
      }
    },
    profile: {
      id: 1,
      user_id: 1,
      display_name: 'Dev Admin',
      email: 'dev@localhost',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    roles: ['admin'],
    isAdmin: true,
    isModerator: false,
    isDev: true,
    isM365: false,
    loading: false,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  } : {
    user,
    session: user ? { user } : null,
    profile,
    roles,
    isAdmin: roles.includes('admin'),
    isModerator: roles.includes('moderator'),
    isDev: false,
    isM365: false,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
