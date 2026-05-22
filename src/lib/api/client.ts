import axios, { type AxiosError } from 'axios';

// Session token key — written by authService on sign-in, read here on every request.
export const SESSION_TOKEN_KEY = 'ba_session_token';

export const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL ?? 'http://localhost:3000') + '/api',
  withCredentials: true, // send cookies for cookie-based sessions
  headers: { 'Content-Type': 'application/json' },
});

// Attach bearer token when present (complements cookie-based auth)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Unwrap NestJS { success: true, data: ... } envelope.
// Better Auth routes return raw responses and pass through unchanged.
apiClient.interceptors.response.use(
  (response) => {
    const d = response.data as unknown;
    if (
      d !== null &&
      typeof d === 'object' &&
      'success' in d &&
      (d as Record<string, unknown>)['success'] === true &&
      'data' in d
    ) {
      return { ...response, data: (d as Record<string, unknown>)['data'] };
    }
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data?.message ?? error.message ?? 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  },
);
