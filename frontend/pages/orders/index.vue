<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Мои заказы</h1>
    
    <div v-if="ordersStore.loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="ordersStore.orders.length === 0" class="text-center py-12 text-gray-500">
      У вас пока нет заказов
    </div>
    
    <div v-else class="space-y-4">
      <div
        v-for="order in ordersStore.orders"
        :key="order.id"
        class="bg-white rounded-lg shadow p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-semibold">Заказ #{{ order.id }}</h3>
            <p class="text-gray-600 text-sm">{{ new Date(order.orderDate).toLocaleString('ru-RU') }}</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-blue-600">{{ order.totalAmount }} ₽</p>
            <span
              class="inline-block px-3 py-1 rounded-full text-sm"
              :class="getStatusClass(order.status)"
            >
              {{ getStatusText(order.status) }}
            </span>
          </div>
        </div>
        
        <div class="border-t pt-4">
          <h4 class="font-semibold mb-2">Товары:</h4>
          <ul class="space-y-2">
            <li v-for="item in order.items" :key="item.id" class="flex justify-between">
              <span>{{ item.productName }} x{{ item.quantity }}</span>
              <span>{{ item.subtotal }} ₽</span>
            </li>
          </ul>
        </div>
        
        <div class="border-t pt-4 mt-4">
          <p><strong>Адрес доставки:</strong> {{ order.shippingAddress }}, {{ order.shippingCity }}, {{ order.shippingPostalCode }}</p>
          <p><strong>Телефон:</strong> {{ order.shippingPhone }}</p>
        </div>
      </div>
    </div>
    
    <!-- Infinite Scroll Loader -->
    <div v-if="loadingMore" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'

definePageMeta({
  middleware: 'auth',
})

const ordersStore = useOrdersStore()

const filters = reactive({
  page: 0,
  size: 10,
  sortBy: 'id',
  sortDir: 'DESC',
})

const loadingMore = ref(false)
const hasMore = ref(true)

const loadOrders = async (page = 0, append = false) => {
  if (loadingMore.value) return
  loadingMore.value = true
  
  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  
  try {
    await ordersStore.fetchOrders({ ...filters, page, append })
    hasMore.value = !ordersStore.pagination.last
    
    if (append) {
      await nextTick()
      window.scrollTo({
        top: scrollPosition,
        behavior: 'instant'
      })
    }
  } finally {
    loadingMore.value = false
  }
}

const handleScroll = () => {
  if (loadingMore.value || !hasMore.value) return
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  if (scrollTop + windowHeight >= documentHeight - 200) {
    const nextPage = ordersStore.pagination.page + 1
    if (nextPage < ordersStore.pagination.totalPages) {
      loadOrders(nextPage, true)
    }
  }
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: 'Ожидает обработки',
    PROCESSING: 'В обработке',
    SHIPPED: 'Отправлен',
    DELIVERED: 'Доставлен',
    CANCELLED: 'Отменен',
  }
  return statusMap[status] || status
}

const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }
  return classMap[status] || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  loadOrders(0, false)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

