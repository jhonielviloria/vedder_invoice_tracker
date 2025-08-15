import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

interface AuthContextValue {
  session: any;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any } | void>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: any } | void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Auth disabled -> mark loading false and leave session null so UI can decide to bypass
      setLoading(false);
      return;
    }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  async function signInWithEmail(email: string, password: string) {
    if (!isSupabaseConfigured || !supabase) return { error: { message: 'Auth disabled' } };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }
  async function signUpWithEmail(email: string, password: string) {
    if (!isSupabaseConfigured || !supabase) return { error: { message: 'Auth disabled' } };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  }
  async function signOut() { if (isSupabaseConfigured && supabase) await supabase.auth.signOut(); }

  return (
    <AuthContext.Provider value={{ session, loading, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
