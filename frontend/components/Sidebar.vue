<template>
  <div>
    <!-- Mobile menu button -->
    <button
      @click="sidebarOpen = !sidebarOpen"
      class="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path v-if="!sidebarOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Sidebar overlay for mobile -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 h-full bg-gray-900 text-white z-40 transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0 w-64'
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="p-6 border-b border-gray-700">
          <NuxtLink to="/" class="flex items-center space-x-2">
            <span class="material-icons text-2xl">terrain</span>
            <span class="text-xl font-bold">Tourist Shop</span>
          </NuxtLink>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto p-4">
          <div class="space-y-2">
            <!-- Public links -->
            <NuxtLink
              to="/products"
              class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">shopping_bag</span>
              <span>Товары</span>
            </NuxtLink>

            <!-- Authenticated user links -->
            <template v-if="authStore.isAuthenticated">
              <NuxtLink
                to="/cart"
                class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                @click="sidebarOpen = false"
              >
                <span class="material-icons">shopping_cart</span>
                <span>Корзина</span>
              </NuxtLink>

              <NuxtLink
                to="/orders"
                class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                @click="sidebarOpen = false"
              >
                <span class="material-icons">inventory</span>
                <span>Мои заказы</span>
              </NuxtLink>

              <!-- Manager section -->
              <div v-if="authStore.isManager" class="pt-4 mt-4 border-t border-gray-700">
                <div class="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
                  Управление
                </div>
                <NuxtLink
                  to="/admin/products"
                  class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  @click="sidebarOpen = false"
                >
                  <span class="material-icons">inventory_2</span>
                  <span>Товары</span>
                </NuxtLink>
                <NuxtLink
                  to="/admin/orders"
                  class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  @click="sidebarOpen = false"
                >
                  <span class="material-icons">receipt_long</span>
                  <span>Заказы</span>
                </NuxtLink>
              </div>

              <!-- Admin section -->
              <div v-if="authStore.isAdmin" class="pt-4 mt-4 border-t border-gray-700">
                <div class="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
                  Администрирование
                </div>
                <NuxtLink
                  to="/admin/users"
                  class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  @click="sidebarOpen = false"
                >
                  <span class="material-icons">people</span>
                  <span>Пользователи</span>
                </NuxtLink>
              </div>
            </template>

            <!-- Guest links -->
            <template v-else>
              <NuxtLink
                to="/login"
                class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                @click="sidebarOpen = false"
              >
                <span class="material-icons">login</span>
                <span>Вход</span>
              </NuxtLink>
              <NuxtLink
                to="/register"
                class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                @click="sidebarOpen = false"
              >
                <span class="material-icons">person_add</span>
                <span>Регистрация</span>
              </NuxtLink>
            </template>
          </div>
        </nav>

        <!-- User info and logout -->
        <div v-if="authStore.isAuthenticated" class="p-4 border-t border-gray-700">
          <div class="mb-3 px-4">
            <div class="text-sm text-gray-400">Пользователь</div>
            <div class="font-semibold">{{ authStore.user?.username }}</div>
            <div class="text-xs text-gray-500 mt-1">
              {{ authStore.isAdmin ? 'Администратор' : authStore.isManager ? 'Менеджер' : 'Пользователь' }}
            </div>
          </div>
          <button
            @click="handleLogout"
            class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            <span class="material-icons">logout</span>
            <span>Выход</span>
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const sidebarOpen = ref(false)

const handleLogout = () => {
  authStore.logout()
  navigateTo('/')
  sidebarOpen.value = false
}

if (process.client) {
  watch(() => useRoute().path, () => {
    if (window.innerWidth < 1024) {
      sidebarOpen.value = false
    }
  })
}
</script>

