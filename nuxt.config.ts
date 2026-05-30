export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  css: ['bootstrap/dist/css/bootstrap.css', 'bootstrap-icons/font/bootstrap-icons.css', 'leaflet/dist/leaflet.css', '~/assets/styles/main.css'],
  build: {
    transpile: ['bootstrap', 'leaflet', 'mqtt']
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'tirtha-pawitan-secret-key-2026',
    public: {
      // Supabase removed
    }

  }
})
