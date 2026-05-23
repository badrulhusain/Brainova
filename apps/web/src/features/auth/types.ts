export type UserRole = 'STUDENT' | 'ADMIN';

export interface AppUser {
  id: string;
  uid: string;          // alias for id — backward compat
  name: string;
  displayName: string;  // alias for name — backward compat
  admissionNo?: string; // students only
  role: UserRole;
}

export interface AuthClaims {
  admin: boolean;
}

export interface AuthProfile {
  uid: string;
  displayName: string | null;
  isAnonymous: false;
  role?: 'student' | 'admin';
}

export interface AuthState {
  user: AppUser | null;
  profile: AuthProfile | null;
  claims: AuthClaims;
  isLoading: boolean;
  isAdmin: boolean;
}
