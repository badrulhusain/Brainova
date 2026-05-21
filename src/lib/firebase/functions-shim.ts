/**
 * Drop-in shim for `firebase/functions`.
 * Routes known callable-function names to the NestJS REST API so that
 * components that import { httpsCallable } from 'firebase/functions' continue
 * to work without modification (TestShell.tsx, TestsPage.tsx).
 *
 * Aliased via vite.config.ts:
 *   'firebase/functions' → 'src/lib/firebase/functions-shim.ts'
 */
import { apiClient } from '../api/client';

type CallableFn<I, O> = (data: I) => Promise<{ data: O }>;

/**
 * Routes by function name → REST endpoint.
 * Add new entries here as Cloud Functions are migrated.
 */
const ROUTES: Record<string, (data: unknown) => Promise<unknown>> = {
  // TestsPage: start a new test session
  startTest: async (data) => {
    const { configId } = data as { configId: string };
    const res = await apiClient.post<{ sessionId: string }>('/sessions', { configId });
    return res.data;
  },
  createTestSession: async (data) => {
    const { configId } = data as { configId: string };
    const res = await apiClient.post<{ sessionId: string }>('/sessions', { configId });
    return res.data;
  },
  // TestShell: submit completed session
  submitTest: async (data) => {
    const { sessionId } = data as { sessionId: string };
    const res = await apiClient.post<{ resultId: string }>(`/sessions/${sessionId}/submit`);
    return res.data;
  },
};

export function httpsCallable<I = unknown, O = unknown>(
  _functions: unknown,
  name: string,
): CallableFn<I, O> {
  return async (data: I): Promise<{ data: O }> => {
    const handler = ROUTES[name];
    if (!handler) throw new Error(`httpsCallable shim: unknown function "${name}"`);
    const result = await handler(data);
    return { data: result as O };
  };
}
