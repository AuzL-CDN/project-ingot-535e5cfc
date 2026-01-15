import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface User {
  id: number;
  email: string;
  username?: string;
  display_name: string | null;
  must_change_password?: boolean;
  created_at?: string;
}

interface Profile {
  id: number;
  user_id: number;
  display_name: string | null;
  email: string | null;
  initials?: string | null;
  phone?: string | null;
  profile_completed?: boolean;
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
  mustChangePassword: boolean;
  profileCompleted: boolean;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: any | null }>;
  refreshProfile: () => Promise<void>;
}

// Default context value for when provider isn't available (e.g., during HMR)
const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  profile: null,
  roles: [],
  isAdmin: false,
  isModerator: false,
  isDev: false,
  isM365: false,
  mustChangePassword: false,
  profileCompleted: false,
  loading: true,
  signIn: async () => ({ error: { message: 'Auth not ready' } }),
  signUp: async () => ({ error: { message: 'Auth not ready' } }),
  signOut: async () => {},
  changePassword: async () => ({ error: { message: 'Auth not ready' } }),
  refreshProfile: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => {
  return useContext(AuthContext);
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

  const fetchUserData = useCallback(async () => {
    try {
      console.log('[AuthProvider] Fetching session from PHP API...');
      const response = await api.auth.session();
      
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const profileData = response.data.profile;
        const userRoles = response.data.roles || [];
        
        console.log('[AuthProvider] Session loaded:', {
          username: userData.username,
          email: userData.email,
          roles: userRoles,
          mustChangePassword: userData.must_change_password,
          profileCompleted: profileData?.profile_completed
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
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchUserData();
  }, [user, fetchUserData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const signIn = useCallback(async (username: string, password: string) => {
    try {
      const response = await api.auth.login(username, password);
      
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
  }, [fetchUserData]);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    // Sign up is disabled for Login Prime 1 - admin only user creation
    return { error: { message: 'Registration is disabled. Contact your administrator.' } };
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.auth.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        console.log('[AuthProvider] Password changed successfully');
        await fetchUserData();
        return { error: null };
      } else {
        return { error: { message: response.error || 'Password change failed' } };
      }
    } catch (error) {
      console.error('[AuthProvider] Password change error:', error);
      return { error: { message: 'Network error during password change' } };
    }
  }, [fetchUserData]);

  const signOut = useCallback(async () => {
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
  }, []);

  // Compute derived state
  const mustChangePassword = user?.must_change_password ?? false;
  const profileCompleted = profile?.profile_completed ?? false;

  // In dev mode, override with mock admin user
  const value: AuthContextType = isDevMode ? {
    user: { 
      id: 1, 
      email: 'dev@localhost',
      username: 'devadmin',
      display_name: 'Dev Admin',
      must_change_password: false,
      created_at: new Date().toISOString()
    },
    session: {
      user: { 
        id: 1, 
        email: 'dev@localhost',
        username: 'devadmin',
        display_name: 'Dev Admin',
        must_change_password: false,
        created_at: new Date().toISOString()
      }
    },
    profile: {
      id: 1,
      user_id: 1,
      display_name: 'Dev Admin',
      email: 'dev@localhost',
      initials: 'DA',
      phone: null,
      profile_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    roles: ['admin'],
    isAdmin: true,
    isModerator: false,
    isDev: true,
    isM365: false,
    mustChangePassword: false,
    profileCompleted: true,
    loading: false,
    signIn,
    signUp,
    signOut,
    changePassword,
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
    mustChangePassword,
    profileCompleted,
    loading,
    signIn,
    signUp,
    signOut,
    changePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
