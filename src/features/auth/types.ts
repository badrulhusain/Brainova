import type { User } from 'firebase/auth';

export interface AuthClaims {
  admin: boolean;
}

export interface AuthProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export interface AuthState {
  user: User | null;
  profile: AuthProfile | null;
  claims: AuthClaims;
  isLoading: boolean;
  isAdmin: boolean;
}
