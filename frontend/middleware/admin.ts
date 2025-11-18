export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const authStore = useAuthStore()
    authStore.initAuth()

    if (!authStore.isAuthenticated) {
      return navigateTo('/login')
    }

    if (!authStore.isAdmin) {
      return navigateTo('/')
    }
  }
})

