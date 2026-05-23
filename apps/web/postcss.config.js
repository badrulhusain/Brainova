import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    tailwindcss: {
      config: resolve(webRoot, 'tailwind.config.ts'),
    },
    autoprefixer: {},
  },
};
