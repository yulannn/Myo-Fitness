import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Plugin Sentry pour uploader les source maps (seulement en production)
    process.env.VITE_SENTRY_ENABLED === 'true' && sentryVitePlugin({
      org: process.env.VITE_SENTRY_ORG,
      project: process.env.VITE_SENTRY_PROJECT,
      authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
      // Désactiver l'upload en développement
      disable: process.env.NODE_ENV !== 'production',
    }),
  ].filter(Boolean),

  build: {
    // Générer les source maps pour Sentry
    sourcemap: true,
  },

  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'localhost',
      port: 5173,
    },
  },
})
