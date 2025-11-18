export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  authStore.initAuth()
  
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
  
  if (!authStore.isManager) {
    return navigateTo('/')
  }
})

