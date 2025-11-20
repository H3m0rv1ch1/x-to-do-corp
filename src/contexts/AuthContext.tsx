import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/services/supabaseClient';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

type StoredUser = { id: string; name: string; email: string; passwordHash: string };

function readUsers(): Record<string, StoredUser> {
  try {
    const raw = localStorage.getItem('auth_users');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, StoredUser>) {
  try { localStorage.setItem('auth_users', JSON.stringify(users)); } catch { }
}

function readSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem('auth_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(user: AuthUser | null) {
  try {
    if (user) localStorage.setItem('auth_session', JSON.stringify(user));
    else localStorage.removeItem('auth_session');
  } catch { }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth wiring: Supabase first, else local fallback
  useEffect(() => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      // Initialize from current session
      void supabase.auth.getSession().then(({ data }) => {
        const u = data.session?.user;
        if (u) {
          setUser({ id: u.id, name: (u.user_metadata?.name as string) || u.email || 'User', email: u.email || '' });
        }
        setIsLoading(false);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        const u = session?.user;
        if (u) {
          setUser({ id: u.id, name: (u.user_metadata?.name as string) || u.email || 'User', email: u.email || '' });
        } else {
          setUser(null);
        }
      });
      return () => { sub?.subscription?.unsubscribe(); };
    }

    const existing = readSession();
    if (existing) setUser(existing);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, remember: boolean = true) => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      const u = data.user;
      if (u) setUser({ id: u.id, name: (u.user_metadata?.name as string) || u.email || 'User', email: u.email || '' });
      // Supabase persists sessions by default; reflect checkbox in a flag only
      try { localStorage.setItem('remember_me', remember ? '1' : '0'); } catch { }
      return;
    }
    // Local fallback
    const users = readUsers();
    const u = users[email.toLowerCase()];
    if (!u) throw new Error('Account not found');
    const hash = await hashPassword(password);
    if (hash !== u.passwordHash) throw new Error('Invalid credentials');
    const sessionUser: AuthUser = { id: u.id, name: u.name, email: u.email };
    setUser(sessionUser);
    if (remember) writeSession(sessionUser); else writeSession(null);
  };

  const signup = async (name: string, email: string, password: string) => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: window.location.origin + '/app'
        },
      });
      if (error) {
        throw new Error(error.message);
      }
      const u = data.user;
      if (u) {
        // Set user immediately even if email not confirmed
        // Supabase session will be active if auto-confirm is enabled
        setUser({ id: u.id, name: name || u.email || 'User', email: u.email || '' });

        // If email confirmation is required and not confirmed yet
        if (!u.confirmed_at && data.session === null) {
          throw new Error('Please check your email to confirm your account before logging in.');
        }
      }
      return;
    }
    // Local fallback
    const users = readUsers();
    const key = email.toLowerCase();
    if (users[key]) throw new Error('Email already registered');
    const passwordHash = await hashPassword(password);
    const newUser: StoredUser = { id: crypto.randomUUID(), name, email: key, passwordHash };
    users[key] = newUser;
    writeUsers(users);
    const sessionUser: AuthUser = { id: newUser.id, name, email: key };
    setUser(sessionUser);
    writeSession(sessionUser);
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      setUser(null);
      return;
    }
    setUser(null);
    writeSession(null);
  };

  const requestPasswordReset = async (email: string) => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw new Error(error.message);
      return;
    }
    // Local-only demo: simulate sending a reset link
    const users = readUsers();
    const key = email.toLowerCase();
    if (!users[key]) throw new Error('Email not found');
    try {
      const token = crypto.randomUUID();
      localStorage.setItem(`reset_${key}`, token);
    } catch { }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout, requestPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}