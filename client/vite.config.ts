import { defineConfig } from 'vitest/config';
import plugin from '@vitejs/plugin-react';
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [plugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
      port: 3000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
