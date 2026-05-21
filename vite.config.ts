import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Route firebase/* imports to compatibility shims.
      // These let un-migrated pages (TestShell, TestsPage, VerifyEmailPage)
      // compile and run without source changes.
      'firebase/functions': path.resolve(__dirname, 'src/lib/firebase/functions-shim.ts'),
      'firebase/auth': path.resolve(__dirname, 'src/lib/firebase/auth-shim.ts'),
    },
  },
  server: {
    port: 4173,
  },
  preview: {
    port: 4174,
  },
});
