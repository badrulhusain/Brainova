import { apiClient, SESSION_TOKEN_KEY } from '../../lib/api/client';
import type { AppUser, UserRole } from './types';

// ── JWT helpers ───────────────────────────────────────────────────────────────

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isTokenExpired(payload: Record<string, unknown>): boolean {
  const exp = payload['exp'];
  if (typeof exp !== 'number') return true;
  return Date.now() / 1000 >= exp;
}

function payloadToUser(payload: Record<string, unknown>): AppUser {
  const role = (payload['role'] as UserRole) ?? 'STUDENT';
  const id = String(
    payload['sub'] ??
      (role === 'ADMIN' ? payload['adminId'] : payload['studentId']) ??
      '',
  );
  const name = String(
    payload['name'] ??
      payload['username'] ??
      payload['admissionNo'] ??
      (role === 'ADMIN' ? 'Administrator' : 'Student'),
  );
  return {
    id,
    uid: id,
    name,
    displayName: name,
    admissionNo: payload['admissionNo'] ? String(payload['admissionNo']) : undefined,
    role,
  };
}

function storeToken(token: string): void {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem('token');
}

// ── Auth operations ───────────────────────────────────────────────────────────

export async function registerStudent(
  name: string,
  admissionNo: string,
  batch?: string,
): Promise<AppUser> {
  const res = await apiClient.post<{ token: string }>('/auth/student/register', {
    name,
    admissionNo,
    ...(batch ? { batch } : {}),
  });
  const { token } = res.data;
  storeToken(token);
  const payload = decodeJwtPayload(token);
  const fallback = res.data as { student?: { id: string; name: string; admissionNo: string } };
  if (!payload && fallback.student) {
    return {
      id: fallback.student.id,
      uid: fallback.student.id,
      name: fallback.student.name,
      displayName: fallback.student.name,
      admissionNo: fallback.student.admissionNo,
      role: 'STUDENT',
    };
  }
  return payloadToUser(payload ?? {});
}

export async function loginAsStudent(name: string, admissionNo: string): Promise<AppUser> {
  const res = await apiClient.post<{ token: string }>('/auth/student/login', {
    name,
    admissionNo,
  });
  const { token } = res.data;
  storeToken(token);
  const payload = decodeJwtPayload(token);
  const fallback = res.data as { student?: { id: string; name: string; admissionNo: string } };
  if (!payload && fallback.student) {
    return {
      id: fallback.student.id,
      uid: fallback.student.id,
      name: fallback.student.name,
      displayName: fallback.student.name,
      admissionNo: fallback.student.admissionNo,
      role: 'STUDENT',
    };
  }
  return payloadToUser(payload ?? {});
}

export async function loginAsAdmin(username: string, password: string): Promise<AppUser> {
  const res = await apiClient.post<{ token: string }>('/auth/admin/login', {
    username,
    password,
  });
  const { token } = res.data;
  storeToken(token);
  const payload = decodeJwtPayload(token);
  const fallback = res.data as { admin?: { id: string; username: string } };
  if (!payload && fallback.admin) {
    return {
      id: fallback.admin.id,
      uid: fallback.admin.id,
      name: fallback.admin.username,
      displayName: fallback.admin.username,
      role: 'ADMIN',
    };
  }
  return payloadToUser(payload ?? {});
}

export async function logout(): Promise<void> {
  clearToken();
}

export function getSession(): AppUser | null {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload || isTokenExpired(payload)) {
    clearToken();
    return null;
  }

  return payloadToUser(payload);
}
