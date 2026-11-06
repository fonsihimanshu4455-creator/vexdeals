import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const build = (process.env.VERCEL_GIT_COMMIT_SHA || 'local').slice(0, 7)

export default defineConfig({
  plugins: [react()],
  define: { __BUILD__: JSON.stringify(build) },
})
