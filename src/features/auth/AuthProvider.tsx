import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import { getSession, logout } from './authService';
import type { AppUser, AuthClaims, AuthProfile, AuthState } from './types';

const defaultClaims: AuthClaims = { admin: false };

const AuthContext = createContext<AuthState & { login: (user: AppUser) => void; signOut: () => Promise<void> } | null>(null);

function toProfile(user: AppUser): AuthProfile {
  return {
    uid: user.uid,
    displayName: user.displayName,
    isAnonymous: false,
    role: user.role === 'ADMIN' ? 'admin' : 'student',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // getSession() reads localStorage synchronously — no async/loading needed
  const [user, setUser] = useState<AppUser | null>(() => getSession());

  function login(appUser: AppUser) {
    setUser(appUser);
  }

  async function signOut() {
    await logout();
    setUser(null);
  }

  const value = useMemo(() => {
    const isAdmin = user?.role === 'ADMIN';
    return {
      user,
      profile: user ? toProfile(user) : null,
      claims: { admin: isAdmin } satisfies AuthClaims,
      isLoading: false,
      isAdmin,
      login,
      signOut,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
