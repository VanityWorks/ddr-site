import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// SPA fallback: serve index.html for client-side routes (fixes 404 on refresh)
function spaFallback() {
  const handler = (req, res, next) => {
    if (req.url?.startsWith('/api')) return next()
    if (req.url?.includes('.')) return next() // static assets
    req.url = '/index.html'
    next()
  }
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
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
