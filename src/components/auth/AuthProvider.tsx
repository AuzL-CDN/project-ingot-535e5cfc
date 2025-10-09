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
  // Stub implementation - will be replaced with SharePoint auth
  const value: AuthContextType = {
    user: null,
    session: null,
    profile: null,
    roles: [],
    isAdmin: false,
    isModerator: false,
    isDev: false,
    isM365: false,
    loading: false,
    signIn: async () => ({ error: { message: 'Auth not configured' } }),
    signUp: async () => ({ error: { message: 'Auth not configured' } }),
    signOut: async () => {},
    refreshProfile: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
