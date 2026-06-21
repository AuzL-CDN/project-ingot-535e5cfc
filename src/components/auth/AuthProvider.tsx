import { createContext, useContext, ReactNode } from 'react';

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
  signIn: (username: string, password: string) => Promise<{ error: { message: string } | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: { message: string } | null }>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: { message: string } | null }>;
  refreshProfile: () => Promise<void>;
}

const mockAuthContext: AuthContextType = {
  user: {
    id: 1,
    email: 'inspector@ingot.local',
    username: 'inspector',
    display_name: 'Inspector',
    must_change_password: false,
    created_at: new Date().toISOString()
  },
  session: {
    user: {
      id: 1,
      email: 'inspector@ingot.local',
      username: 'inspector',
      display_name: 'Inspector',
      must_change_password: false,
      created_at: new Date().toISOString()
    }
  },
  profile: {
    id: 1,
    user_id: 1,
    display_name: 'Inspector',
    email: 'inspector@ingot.local',
    initials: 'IN',
    phone: null,
    profile_completed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  roles: ['admin'],
  isAdmin: true,
  isModerator: false,
  isDev: false,
  isM365: false,
  mustChangePassword: false,
  profileCompleted: true,
  loading: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: { message: 'Registration disabled' } }),
  signOut: async () => {},
  changePassword: async () => ({ error: null }),
  refreshProfile: async () => {},
};

const AuthContext = createContext<AuthContextType>(mockAuthContext);

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  return <AuthContext.Provider value={mockAuthContext}>{children}</AuthContext.Provider>;
};
