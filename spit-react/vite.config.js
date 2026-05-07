import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: { port: 3001 },
    define: {
      // sockjs-client needs global to be defined in browser
      global: 'globalThis',
    },
    build: {
      // Split vendor chunks for better browser caching
      rollupOptions: {
        output: {
          manualChunks: {
            vendor:    ['react', 'react-dom', 'react-router-dom'],
            charts:    ['recharts'],
            map:       ['leaflet'],
            websocket: ['@stomp/stompjs', 'sockjs-client'],
          },
        },
      },
      // Warn if any chunk exceeds 600kb
      chunkSizeWarningLimit: 600,
    },
  };
});
