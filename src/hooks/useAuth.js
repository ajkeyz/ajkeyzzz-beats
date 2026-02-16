import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/env';
import { localStore } from '../lib/store';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60_000; // 1 minute

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const loginAttempts = useRef(0);
  const lockoutUntil = useRef(0);

  useEffect(() => {
    if (isSupabaseConfigured) {
      // Check current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          // Check admin role from user metadata
          setIsAdmin(session.user.user_metadata?.role === 'admin' || session.user.email === session.user.user_metadata?.admin_email);
        }
        setLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsAdmin(session.user.user_metadata?.role === 'admin' || session.user.email === session.user.user_metadata?.admin_email);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Local mode — check localStorage
      const saved = localStore.getAdmin();
      setIsAdmin(saved === true);
      if (saved) setUser({ email: 'admin@local' });
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    // Rate limit login attempts
    if (Date.now() < lockoutUntil.current) {
      const remaining = Math.ceil((lockoutUntil.current - Date.now()) / 1000);
      return { error: `Too many attempts. Try again in ${remaining}s.` };
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        loginAttempts.current++;
        if (loginAttempts.current >= MAX_LOGIN_ATTEMPTS) {
          lockoutUntil.current = Date.now() + LOCKOUT_DURATION_MS;
          loginAttempts.current = 0;
        }
        return { error: error.message };
      }
      loginAttempts.current = 0;
      setUser(data.user);
      setIsAdmin(data.user.user_metadata?.role === 'admin');
      return { error: null };
    } else {
      // Local fallback — password from env var
      const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || '';
      if (adminPass && password === adminPass) {
        loginAttempts.current = 0;
        setIsAdmin(true);
        setUser({ email: 'admin@local' });
        localStore.setAdmin(true);
        return { error: null };
      }
      loginAttempts.current++;
      if (loginAttempts.current >= MAX_LOGIN_ATTEMPTS) {
        lockoutUntil.current = Date.now() + LOCKOUT_DURATION_MS;
        loginAttempts.current = 0;
        return { error: 'Too many attempts. Try again in 60s.' };
      }
      return { error: 'Incorrect password' };
    }
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsAdmin(false);
    localStore.setAdmin(false);
  }, []);

  return { user, isAdmin, loading, login, logout };
}
