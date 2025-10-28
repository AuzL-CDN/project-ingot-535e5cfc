import { createContext, useContext, ReactNode } from 'react';

// Stub auth context for SharePoint migration
interface AuthContextType {
  user: any | null;
  session: any | null;
  profile: any | null;
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
  // DEV MODE: Enable admin access on localhost only
  const isDevMode = import.meta.env.DEV && 
    (typeof window !== 'undefined' && 
     (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1'));

  const value: AuthContextType = {
    user: isDevMode ? { 
      id: 'dev-user', 
      email: 'dev@localhost',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    } : null,
    session: null,
    profile: isDevMode ? {
      id: 'dev-user',
      display_name: 'Dev Admin',
      email: 'dev@localhost'
    } : null,
    roles: isDevMode ? ['admin'] : [],
    isAdmin: isDevMode,
    isModerator: false,
    isDev: isDevMode,
    isM365: false,
    loading: false,
    signIn: async () => ({ error: { message: 'Auth not configured - Dev mode active' } }),
    signUp: async () => ({ error: { message: 'Auth not configured - Dev mode active' } }),
    signOut: async () => {},
    refreshProfile: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
