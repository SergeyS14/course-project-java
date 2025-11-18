<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Управление заказами</h1>
    
    <div v-if="ordersStore.loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
            <p class="text-gray-600">Пользователь: {{ order.username }}</p>
            <p class="text-gray-600 text-sm">{{ new Date(order.orderDate).toLocaleString('ru-RU') }}</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-blue-600">{{ order.totalAmount }} ₽</p>
            <select
              :value="order.status"
              @change="updateOrderStatus(order.id, $event.target.value)"
              class="mt-2 px-3 py-1 border rounded-lg"
            >
              <option value="PENDING">Ожидает обработки</option>
              <option value="PROCESSING">В обработке</option>
              <option value="SHIPPED">Отправлен</option>
              <option value="DELIVERED">Доставлен</option>
              <option value="CANCELLED">Отменен</option>
            </select>
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
  middleware: 'manager',
})

const ordersStore = useOrdersStore()
const { $api } = useNuxtApp()

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

const { success, error: showError } = useToast()

const updateOrderStatus = async (orderId: number, status: string) => {
  try {
    await $api.put(`/orders/${orderId}/status`, null, {
      params: { status },
    })
    await loadOrders(0, false)
    success('Статус заказа обновлен')
  } catch (error) {
    console.error('Error updating order status:', error)
    showError('Ошибка при обновлении статуса заказа')
  }
}

onMounted(() => {
  loadOrders(0, false)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

