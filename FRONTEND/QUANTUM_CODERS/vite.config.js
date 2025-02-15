import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// Vite config to handle WebSocket and polyfills for SockJS and StompJS
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer',
      process: 'process/browser',  // Polyfill for process
    },
  },
  define: {
    // Define global in the window object
    'global': 'window',
  },
  optimizeDeps: {
    include: ['sockjs-client', 'stompjs', 'buffer', 'process'], // Ensure dependencies are included for optimization
  },
});
