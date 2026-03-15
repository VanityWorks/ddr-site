import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import history from 'connect-history-api-fallback'

// SPA fallback: serve index.html for client-side routes (fixes 404 on direct URL / refresh)
function spaFallback() {
  const historyMiddleware = history({
    index: '/index.html',
    rewrites: [{ from: /^\/api/, to: (ctx) => ctx.parsedUrl.pathname }],
  })
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.stack.unshift({ route: '', handle: historyMiddleware })
    },
    configurePreviewServer(server) {
      server.middlewares.stack.unshift({ route: '', handle: historyMiddleware })
    },
  }
}

export default defineConfig({
  plugins: [react(), spaFallback()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
