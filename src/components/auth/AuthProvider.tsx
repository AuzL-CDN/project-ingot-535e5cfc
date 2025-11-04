import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // DEV MODE: Enable admin access on localhost only
  const isDevMode = import.meta.env.DEV && 
    (typeof window !== 'undefined' && 
     (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1'));

  const fetchUserRoles = async (userId: string) => {
    try {
      console.log('[AuthProvider] Fetching roles for user:', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('[AuthProvider] Error fetching roles:', error);
        throw error;
      }
      
      const roles = data?.map(r => r.role) || [];
      console.log('[AuthProvider] Loaded roles:', roles);
      return roles;
    } catch (error) {
      console.error('[AuthProvider] Failed to fetch user roles:', error);
      return [];
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      console.log('[AuthProvider] Fetching profile for user:', userId);
      
      // First try to find by user_id (auth.users reference)
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      // Fallback: try by id if not found
      if (!data && !error) {
        ({ data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle());
      }
      
      if (error) {
        console.error('[AuthProvider] Error fetching profile:', error);
        throw error;
      }
      
      console.log('[AuthProvider] Loaded profile:', data?.display_name);
      return data;
    } catch (error) {
      console.error('[AuthProvider] Failed to fetch profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const [userProfile, userRoles] = await Promise.all([
      fetchProfile(user.id),
      fetchUserRoles(user.id)
    ]);
    setProfile(userProfile);
    setRoles(userRoles);
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AuthProvider] Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer async operations to prevent blocking
          setTimeout(async () => {
            if (!mounted) return;
            
            const [userProfile, userRoles] = await Promise.all([
              fetchProfile(session.user.id),
              fetchUserRoles(session.user.id)
            ]);
            
            if (mounted) {
              setProfile(userProfile);
              setRoles(userRoles);
              setLoading(false);
              
              console.log('[AuthProvider] Auth context ready:', {
                email: session.user.email,
                roles: userRoles,
                isAdmin: userRoles.includes('admin')
              });
            }
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('[AuthProvider] Initial session check:', session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        Promise.all([
          fetchProfile(session.user.id),
          fetchUserRoles(session.user.id)
        ]).then(([userProfile, userRoles]) => {
          if (mounted) {
            setProfile(userProfile);
            setRoles(userRoles);
            setLoading(false);
            
            console.log('[AuthProvider] Initial auth context ready:', {
              email: session.user.email,
              roles: userRoles,
              isAdmin: userRoles.includes('admin')
            });
          }
        }).catch(error => {
          console.error('[AuthProvider] Failed to load user data:', error);
          if (mounted) {
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };

  // In dev mode, override with mock admin user
  const value: AuthContextType = isDevMode ? {
    user: { 
      id: 'dev-user', 
      email: 'dev@localhost',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    } as User,
    session: null,
    profile: {
      id: 'dev-user',
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
    session,
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
