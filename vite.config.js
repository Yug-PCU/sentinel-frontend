import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // The dev and preview servers forward POST /analyze to the backend, so the
  // browser never makes a cross-origin request. Set API_PROXY_TARGET in
  // .env.local (or the shell) if the backend isn't on port 8000.
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = {
    '/analyze': {
      target: env.API_PROXY_TARGET || 'http://localhost:8000',
      changeOrigin: true,
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    server: { proxy },
    preview: { proxy },
    // three.js (~550 kB, ~140 kB gzipped) lives in its own chunk that loads after
    // the page renders, so its size doesn't hold anything up.
    build: { chunkSizeWarningLimit: 600 },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      restoreMocks: true,
      unstubEnvs: true,
      unstubGlobals: true,
    },
  }
})
