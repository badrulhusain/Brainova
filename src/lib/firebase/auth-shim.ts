/**
 * Drop-in shim for `firebase/auth`.
 * Provides only the functions that the app still references in un-migrated pages.
 * Aliased via vite.config.ts: 'firebase/auth' → this file.
 */
import { getSession } from '../../features/auth/authService';

/**
 * Replaces Firebase's `reload(user)`.
 * Re-fetches the current session from the server so `emailVerified` is up to date.
 * The caller should trigger a UI re-render (e.g. via useAuth) after this resolves.
 */
export async function reload(_user: unknown): Promise<void> {
  await getSession();
}
