import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGithub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', { event, hasSession: !!session, userId: session?.user?.id });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Handle OAuth callback from Electron (production only)
    const handleOAuthCallback = async (_event: any, url: string) => {
      console.log('Handling OAuth callback:', url);

      // Extract the hash fragment from the custom protocol URL
      // Format: skreenpro://auth/callback#access_token=...
      const hashIndex = url.indexOf('#');
      if (hashIndex !== -1) {
        const hash = url.substring(hashIndex);

        // Parse the hash to get session data
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
          // Set the session using the tokens from the callback
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (error) {
            console.error('Error setting session from OAuth callback:', error);
          } else {
            console.log('Successfully authenticated via OAuth callback');
          }
        }
      }
    };

    // Listen for OAuth callbacks from Electron
    if (window.electronAPI) {
      (window as any).electron?.ipcRenderer?.on('oauth-callback', handleOAuthCallback);
    }

    return () => {
      subscription.unsubscribe();
      if (window.electronAPI) {
        (window as any).electron?.ipcRenderer?.removeListener('oauth-callback', handleOAuthCallback);
      }
    };
  }, []);

  const signInWithGithub = async () => {
    // Use custom protocol for Electron, localhost for dev
    const redirectTo = window.location.protocol === 'file:'
      ? 'skreenpro://auth/callback'
      : window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo,
      },
    });
    if (error) {
      console.error('Error signing in with GitHub:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    // Use custom protocol for Electron, localhost for dev
    const redirectTo = window.location.protocol === 'file:'
      ? 'skreenpro://auth/callback'
      : window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('SignOut called - clearing all sessions');

      // First, clear React state immediately to update UI
      setUser(null);
      setSession(null);

      // Then try to sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'local' });

      if (error) {
        console.error('Error signing out from Supabase:', error);
      }

      // Force clear all Supabase-related localStorage items
      console.log('Force clearing localStorage');
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => {
        console.log('Removing localStorage key:', key);
        localStorage.removeItem(key);
      });

      console.log('SignOut completed - all sessions cleared');
    } catch (error: any) {
      console.error('Exception during signOut:', error);
      // Still clear React state even if error occurs
      setUser(null);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithGithub,
        signInWithGoogle,
        signOut,
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
