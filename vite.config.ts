import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Optimize for large 3D model files
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
  
  // Configure server for large files
  server: {
    hmr: {
      overlay: false,
    },
    // Enable serving large files
    middlewareMode: false,
  },
  
  // Optimize assets
  assetsInclude: ['**/*.ply', '**/*.splat'],
  
  // Define global constants for better tree shaking
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
})
