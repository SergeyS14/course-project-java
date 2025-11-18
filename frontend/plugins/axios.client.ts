import axios, { type AxiosInstance } from 'axios'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const api: AxiosInstance = axios.create({
    baseURL: config.public.apiBase,
    headers: {
      'Content-Type': 'application/json',
    },
  }) as AxiosInstance

  api.interceptors.request.use(
    (config) => {
      if (process.client) {
        try {
          const authStore = useAuthStore()
          if (!authStore.token) {
            authStore.initAuth()
          }
          const token = authStore.token
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
          }
        } catch (error) {
          console.debug('Auth store not available:', error)
        }
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (process.client && error.response?.status === 401) {
        try {
          const authStore = useAuthStore()
          authStore.logout()
          navigateTo('/login')
        } catch (e) {
          console.error('Error handling 401:', e)
        }
      }
      return Promise.reject(error)
    }
  )

  return {
    provide: {
      api,
    },
  }
})

