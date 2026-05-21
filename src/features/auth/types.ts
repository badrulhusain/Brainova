/**
 * Auth types — migrated from Firebase to Better Auth / NestJS.
 * `uid` is kept as an alias for `id` so existing code that reads `user.uid`
 * continues to work without changes.
 */

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface AppUser {
  id: string;
  uid: string;          // alias for id — backward compat
  email: string;
  name: string | null;
  displayName: string | null; // alias for name — backward compat
  image: string | null;
  photoURL: string | null;    // alias for image — backward compat
  emailVerified: boolean;
  role: UserRole;
}

export interface AuthClaims {
  admin: boolean;
}

/** Kept for backward compat — maps to AppUser fields. */
export interface AuthProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: false;
  role?: 'student' | 'admin' | 'teacher';
}

export interface AuthState {
  user: AppUser | null;
  profile: AuthProfile | null;
  claims: AuthClaims;
  isLoading: boolean;
  isAdmin: boolean;
}
