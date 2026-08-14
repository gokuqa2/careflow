import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev proxy target: point to Azure so mobile and web always hit the same live database.
// Switch to 'http://localhost:5000' if you want to develop against a local API instead.
const API_PROXY_TARGET = 'https://careflow-api-sofclj.azurewebsites.net';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
