/**
 * Create an admin account via the REST API.
 *
 * Usage:
 *   npm run admin:grant -- <username> <password>
 */

import axios from 'axios';

const [, , newUsername, newPassword] = process.argv;

if (!newUsername || !newPassword) {
  process.stderr.write('Usage: npm run admin:grant -- <username> <password>\n');
  process.exit(1);
}

const API_URL = 'http://localhost:3000/api';
const ADMIN_USER = process.env['ADMIN_USERNAME'] ?? 'admin';
const ADMIN_PASS = process.env['ADMIN_PASSWORD'] ?? 'Admin@1234';

const http = axios.create({ baseURL: API_URL });
http.interceptors.response.use((res) => {
  const d = res.data as { success?: boolean; data?: unknown };
  if (d?.success === true && 'data' in d) res.data = d.data;
  return res;
});

async function main() {
  const loginRes = await http.post('/auth/admin/login', {
    username: ADMIN_USER, password: ADMIN_PASS,
  });
  const token = (loginRes.data as unknown as { token: string }).token;
  http.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  await http.post('/admins', { username: newUsername, password: newPassword });
  process.stdout.write(`Admin "${newUsername}" created successfully.\n`);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`Failed: ${msg}\n`);
  process.exit(1);
});
