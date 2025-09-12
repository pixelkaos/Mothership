import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(() => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      // Proxy local Ollama API to avoid CORS issues in dev
      '/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}));
