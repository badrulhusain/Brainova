import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase/client';
import type { AuthClaims, AuthProfile, AuthState } from './types';

const defaultClaims: AuthClaims = {
  admin: false,
};

const AuthContext = createContext<AuthState | null>(null);

function createProfile(user: NonNullable<AuthState['user']>): AuthProfile {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState['user']>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [claims, setClaims] = useState<AuthClaims>(defaultClaims);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (nextUser) => {
      setIsLoading(true);

      if (!nextUser) {
        setUser(null);
        setProfile(null);
        setClaims(defaultClaims);
        setIsLoading(false);
        return;
      }

      nextUser
        .getIdTokenResult()
        .then((tokenResult) => {
          setUser(nextUser);
          setProfile(createProfile(nextUser));
          setClaims({
            admin: tokenResult.claims.admin === true,
          });
        })
        .catch(() => {
          setUser(nextUser);
          setProfile(createProfile(nextUser));
          setClaims(defaultClaims);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      claims,
      isLoading,
      isAdmin: claims.admin,
    }),
    [claims, isLoading, profile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
