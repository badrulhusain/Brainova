import { apiClient, SESSION_TOKEN_KEY } from '../../lib/api/client';
import { disconnectSocket } from '../../lib/socket/client';
import type { LoginFormValues, ResetPasswordFormValues, SignupFormValues } from '../../lib/validators/auth';
import type { AppUser } from './types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function storeToken(token: string | undefined): void {
  if (token) localStorage.setItem(SESSION_TOKEN_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(SESSION_TOKEN_KEY);
}

function mapUser(raw: Record<string, unknown>): AppUser {
  const id = String(raw['id'] ?? '');
  const name = (raw['name'] as string | null) ?? null;
  const image = (raw['image'] as string | null) ?? null;
  const role = (raw['role'] as string) ?? 'STUDENT';

  return {
    id,
    uid: id,
    email: String(raw['email'] ?? ''),
    name,
    displayName: name,
    image,
    photoURL: image,
    emailVerified: Boolean(raw['emailVerified']),
    role: role as AppUser['role'],
  };
}

// ── Auth operations ───────────────────────────────────────────────────────────

export async function loginWithEmail(values: LoginFormValues): Promise<AppUser> {
  const res = await apiClient.post<{ token?: string; user: Record<string, unknown> }>(
    '/api/auth/sign-in/email',
    { email: values.email, password: values.password },
  );
  storeToken(res.data.token);
  return mapUser(res.data.user);
}

export async function signupWithEmail(values: SignupFormValues): Promise<AppUser> {
  const res = await apiClient.post<{ token?: string; user: Record<string, unknown> }>(
    '/api/auth/sign-up/email',
    {
      email: values.email,
      password: values.password,
      name: values.displayName,
    },
  );
  storeToken(res.data.token);
  return mapUser(res.data.user);
}

/** Redirects browser to Google OAuth flow — no return value. */
export function loginWithGoogle(): void {
  const callbackURL = encodeURIComponent(`${window.location.origin}/dashboard`);
  window.location.href = `${import.meta.env.VITE_API_URL ?? ''}/api/auth/sign-in/google?callbackURL=${callbackURL}`;
}

export async function requestPasswordReset(values: ResetPasswordFormValues): Promise<void> {
  await apiClient.post('/api/auth/forget-password', { email: values.email });
}

// `_user` is accepted for backward compat with VerifyEmailPage.tsx which calls
// resendVerificationEmail(user). The server derives the user from the session.
export async function resendVerificationEmail(_user?: unknown): Promise<void> {
  await apiClient.post('/api/auth/send-verification-email');
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/api/auth/sign-out');
  } finally {
    clearToken();
    disconnectSocket(); // destroy socket so the next login gets a fresh token
  }
}

/**
 * Guest / anonymous sign-in is not supported in the new auth stack.
 * This stub is kept so LoginPage and SignupPage continue to compile without changes.
 * The UI buttons that call this should be hidden or removed in a follow-up.
 */
export async function continueAsGuest(): Promise<never> {
  throw new Error('Guest access is no longer available. Please create a free account to continue.');
}

export async function getSession(): Promise<AppUser | null> {
  try {
    const res = await apiClient.get<{
      user: Record<string, unknown>;
      session: Record<string, unknown>;
    }>('/api/auth/session');

    if (!res.data?.user) return null;
    storeToken(res.data.session?.['token'] as string | undefined);
    return mapUser(res.data.user);
  } catch {
    return null;
  }
}
