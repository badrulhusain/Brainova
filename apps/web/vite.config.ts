import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: webRoot,
  plugins: [react()],
  server: {
    port: 4173,
    watch: {
      ignored: (filePath: string) =>
        filePath.includes('/node_modules/') ||
        filePath.includes('/apps/api/dist/') ||
        filePath.includes('/apps/api/node_modules/') ||
        filePath.includes('/.git/') ||
        filePath.includes('/coverage/') ||
        filePath.includes('/dist/'),
    },
  },
  preview: {
    port: 4174,
  },
});
