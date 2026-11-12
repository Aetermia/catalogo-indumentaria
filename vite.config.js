import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// PHP_DEV_SERVER=http://localhost:8000 en .env.local redirige /backend al servidor PHP
// (php -S localhost:8000 desde la raíz del proyecto) durante el desarrollo.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: './',
    plugins: [react()],
    server: env.PHP_DEV_SERVER
      ? { proxy: { '/backend': { target: env.PHP_DEV_SERVER, changeOrigin: true } } }
      : undefined,
  };
});
