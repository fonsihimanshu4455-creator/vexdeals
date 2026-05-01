import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Split heavy/seldom-used deps so the customer-side bundle is small
        // and browsers can cache them across deploys.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // Firebase is the heaviest single dep — split it out so customers
          // who don't sign in never download it on the critical path.
          if (id.includes('firebase')) return 'vendor-firebase';
          // Everything else (react, router, lucide, etc.) shares one chunk
          // — avoids circular-chunk issues from internal cross-imports.
          return 'vendor';
        },
      },
    },
  },
})
