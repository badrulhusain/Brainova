import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getSession } from './authService';
import type { AppUser, AuthClaims, AuthProfile, AuthState } from './types';

const defaultClaims: AuthClaims = { admin: false };

const AuthContext = createContext<AuthState | null>(null);

function toProfile(user: AppUser): AuthProfile {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isAnonymous: false,
    role: user.role === 'ADMIN' ? 'admin' : user.role === 'TEACHER' ? 'teacher' : 'student',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Replace Firebase onIdTokenChanged with a single session check on mount.
    // Better Auth manages session refresh automatically via cookies.
    let cancelled = false;

    getSession()
      .then((appUser) => {
        if (!cancelled) setUser(appUser);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthState>(() => {
    const isAdmin = user?.role === 'ADMIN';
    return {
      user,
      profile: user ? toProfile(user) : null,
      claims: { admin: isAdmin },
      isLoading,
      isAdmin,
    };
  }, [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
