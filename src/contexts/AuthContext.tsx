import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/services/supabaseClient';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isOfflineOnly?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  signupLocal: (name: string, email: string, password: string) => Promise<void>;
  loginLocal: (email: string, password: string) => Promise<void>;
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
    const initAuth = async () => {
      // Check for local session first
      const localSession = readSession();
      if (localSession) {
        setUser(localSession);
        setIsLoading(false);
        // If it's an online account (has ID that looks like UUID and not local), try to sync if online
        if (isSupabaseConfigured() && navigator.onLine) {
          // Background sync
          import('../services/syncService').then(({ syncService }) => {
            syncService.startAutoSync();
          });
        }
        return;
      }

      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        const { data } = await supabase.auth.getSession();
        const u = data.session?.user;
        if (u) {
          const user: AuthUser = {
            id: u.id,
            name: (u.user_metadata?.name as string) || u.email || 'User',
            email: u.email || '',
            isOfflineOnly: false
          };
          setUser(user);
          writeSession(user); // Persist to local storage for offline access

          // Start sync
          import('../services/syncService').then(({ syncService }) => {
            syncService.startAutoSync();
          });
        }
        setIsLoading(false);

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          const u = session?.user;
          if (u) {
            const user: AuthUser = {
              id: u.id,
              name: (u.user_metadata?.name as string) || u.email || 'User',
              email: u.email || '',
              isOfflineOnly: false
            };
            setUser(user);
            writeSession(user);
          } else {
            // Only clear if we were using an online account
            // This might be tricky if we want to switch between local/online. 
            // For now, if Supabase says sign out, we sign out.
            // But wait, if we are offline, onAuthStateChange might not fire or might be weird.
            // Let's rely on explicit logout for clearing local session.
          }
        });
        return () => { sub?.subscription?.unsubscribe(); };
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string, remember: boolean = true) => {
    // Smart auto-detection: Try Supabase first if online, then fall back to local

    // Attempt 1: Try Supabase (Online Account) if configured and online
    if (isSupabaseConfigured() && navigator.onLine) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (!error && data.user) {
          // Supabase login successful
          const u = data.user;
          const user: AuthUser = {
            id: u.id,
            name: (u.user_metadata?.name as string) || u.email || 'User',
            email: u.email || '',
            isOfflineOnly: false
          };
          setUser(user);
          writeSession(user);
          try { localStorage.setItem('remember_me', remember ? '1' : '0'); } catch { }

          // Trigger sync
          import('../services/syncService').then(({ syncService }) => {
            syncService.pullChanges();
            syncService.pushChanges();
          });
          return;
        }
        // If error, fall through to try local login
      } catch (e) {
        // Supabase failed, try local
      }
    }

    // Attempt 2: Try local DB (Offline Account)
    try {
      const { getUser } = await import('../services/db');
      const localUser = await getUser(email.toLowerCase());
      if (localUser) {
        const hash = await hashPassword(password);
        if (hash === localUser.passwordHash) {
          const user: AuthUser = {
            id: localUser.id,
            name: localUser.name,
            email: localUser.email,
            isOfflineOnly: true
          };
          setUser(user);
          writeSession(user);
          return;
        } else {
          throw new Error('Invalid credentials');
        }
      }
    } catch (e) {
      // If not a credentials error, continue to legacy check
      if ((e as Error).message === 'Invalid credentials') {
        throw e;
      }
    }

    // Attempt 3: Fallback to localStorage 'auth_users' (Legacy Local)
    const users = readUsers();
    const u = users[email.toLowerCase()];
    if (u) {
      const hash = await hashPassword(password);
      if (hash !== u.passwordHash) throw new Error('Invalid credentials');
      const sessionUser: AuthUser = { id: u.id, name: u.name, email: u.email, isOfflineOnly: true };
      setUser(sessionUser);
      writeSession(sessionUser);
      return;
    }

    throw new Error('Invalid email or password');
  };

  const loginLocal = async (email: string, password: string) => {
    // 1. Try to find in local DB 'users' store
    try {
      const { getUser } = await import('../services/db');
      const localUser = await getUser(email.toLowerCase());
      if (localUser) {
        const hash = await hashPassword(password);
        if (hash === localUser.passwordHash) {
          const user: AuthUser = {
            id: localUser.id,
            name: localUser.name,
            email: localUser.email,
            isOfflineOnly: true
          };
          setUser(user);
          writeSession(user);
          return;
        } else {
          throw new Error('Invalid credentials');
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'Invalid credentials') throw e;
    }

    // 2. Fallback to localStorage 'auth_users'
    const users = readUsers();
    const u = users[email.toLowerCase()];
    if (u) {
      const hash = await hashPassword(password);
      if (hash !== u.passwordHash) throw new Error('Invalid credentials');
      const sessionUser: AuthUser = { id: u.id, name: u.name, email: u.email, isOfflineOnly: true };
      setUser(sessionUser);
      writeSession(sessionUser);
      return;
    }

    throw new Error('Offline account not found.');
  };

  const signup = async (name: string, email: string, password: string) => {
    if (isSupabaseConfigured() && navigator.onLine) {
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
        const user: AuthUser = {
          id: u.id,
          name: name || u.email || 'User',
          email: u.email || '',
          isOfflineOnly: false
        };
        setUser(user);

        if (!u.confirmed_at && data.session === null) {
          throw new Error('Please check your email to confirm your account before logging in.');
        }
      }
      return;
    }
    throw new Error('Cannot create online account while offline.');
  };

  const signupLocal = async (name: string, email: string, password: string) => {
    const { getUser, putUser } = await import('../services/db');
    const existing = await getUser(email.toLowerCase());
    if (existing) throw new Error('Email already registered locally');

    const passwordHash = await hashPassword(password);
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString()
    };

    await putUser(newUser);

    const user: AuthUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      isOfflineOnly: true
    };
    setUser(user);
    writeSession(user);
  };

  const logout = async () => {
    if (isSupabaseConfigured() && navigator.onLine) {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    }
    setUser(null);
    writeSession(null);
  };

  const requestPasswordReset = async (email: string) => {
    if (isSupabaseConfigured() && navigator.onLine) {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw new Error(error.message);
      return;
    }
    throw new Error('Password reset requires internet connection.');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, signupLocal, loginLocal, logout, requestPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}