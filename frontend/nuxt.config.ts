import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineNuxtConfig({
  compatibilityDate: '2025-11-09',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/tailwind.css'],
  ssr: false,
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' },
      ],
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8080/api')
    }
  },
  nitro: {
    prerender: {
      routes: ['/']
    },
    esbuild: {
      options: {
        target: 'node18',
      },
    },
    externals: {
      inline: [],
    },
  },
  vite: {
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer(),
        ],
      },
    },
    ssr: {
      noExternal: [],
      external: ['axios', 'form-data'],
    },
    resolve: {
      alias: {
        'form-data': false,
      },
    },
    optimizeDeps: {
      exclude: ['form-data', 'axios'],
    },
  },
})

