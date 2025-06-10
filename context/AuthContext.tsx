import React, { createContext, useContext, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { supabase, isDemoModeActive, DEMO_USER } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isDemoMode: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isDemoMode: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoModeActive) {
      // In demo mode, simulate a logged-in user
      console.log('🎭 Demo mode: Simulating logged-in user');
      setUser(DEMO_USER as User);
      setLoading(false);
      return;
    }

    // Check current auth status
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth session error:', error);
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user && !isDemoModeActive) {
        router.replace('/auth/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode: isDemoModeActive }}>
      {children}
    </AuthContext.Provider>
  );
}