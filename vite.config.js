import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

// L'API passe par un proxy : le navigateur reste en même origine que le site
// (aucun blocage CORS), même quand le dev server est partagé sur le réseau
// local (http://IP:port). Vite transmet à l'API en se présentant avec une
// origine autorisée par le backend.
const makeProxy = (target) => ({
  '/api': {
    target,
    changeOrigin: true,
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('origin', 'https://beaute-halal.aeemci-ce.ci')
      })
    },
  },
})

// Par défaut le dev utilise le backend EN LIGNE. Pour tester les nouveautés pas encore déployées (paiement, consultation…),
// lancez le backend local et mettez dans .env.local : VITE_PROXY_TARGET=http://localhost:4000
export default defineConfig(({ mode }) => {
  const apiProxy = makeProxy(loadEnv(mode, process.cwd(), '').VITE_PROXY_TARGET || 'https://backend-beaute-halal.aeemci-ce.ci')
  return {
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // host: true → écoute sur toutes les interfaces : partage LAN direct via l'IP de la machine.
  server: { host: true, proxy: apiProxy },
  preview: { host: true, proxy: apiProxy },
  build: { target: 'es2020' },
  // Tests unitaires : `npm test` (Vitest, sans navigateur ni réseau).
  test: { environment: 'happy-dom', include: ['src/**/*.test.js'] },
  }
})
