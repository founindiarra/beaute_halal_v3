import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// L'API passe par un proxy : le navigateur reste en même origine que le site
// (aucun blocage CORS), même quand le dev server est partagé sur le réseau
// local (http://IP:port). Vite transmet à l'API en se présentant avec une
// origine autorisée par le backend.
const apiProxy = {
  '/api': {
    target: 'https://backend-beaute-halal.aeemci-ce.ci',
    changeOrigin: true,
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('origin', 'https://beaute-halal.aeemci-ce.ci')
      })
    },
  },
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // host: true → écoute sur toutes les interfaces : partage LAN direct via l'IP de la machine.
  server: { host: true, proxy: apiProxy },
  preview: { host: true, proxy: apiProxy },
  build: { target: 'es2020' },
})
