import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 4173 },
  preview: { port: 4173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/src/data/apis/')) return undefined
          if (/\/src\/data\/apis\/(helpers|types|modules|inventory)\.ts$/.test(id)) return 'api-shared'
          if (id.includes('/http-studio-interviews')) return 'api-http-interviews'
          if (id.includes('/http-studio-resume')) return 'api-http-resumes'
          if (id.includes('/http-studio-workspace') || id.includes('/http-studio-mail') || id.includes('/http-studio-upload')) return 'api-http-ops'
          if (id.includes('/ai-interview/http-')) return 'api-http-foundation'
          if (id.includes('/ai-interview/')) return 'api-core'
          return undefined
        },
      },
    },
  },
})
