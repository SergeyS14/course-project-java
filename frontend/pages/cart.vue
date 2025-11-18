<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Корзина</h1>
    
    <div v-if="cartItems.length === 0" class="text-center py-12 text-gray-500">
      Корзина пуста
      <NuxtLink to="/products" class="text-blue-500 hover:underline block mt-4">
        Перейти к каталогу
      </NuxtLink>
    </div>
    
    <div v-else>
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div v-for="item in cartItems" :key="item.productId" class="flex items-center justify-between border-b pb-4 mb-4">
          <div class="flex-1">
            <h3 class="font-semibold">{{ item.productName }}</h3>
            <p class="text-gray-600">{{ item.price }} ₽ x {{ item.quantity }}</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <button
                @click="updateQuantity(item.productId, item.quantity - 1)"
                class="px-3 py-1 border rounded"
                :disabled="item.quantity <= 1"
              >
                -
              </button>
              <span>{{ item.quantity }}</span>
              <button
                @click="updateQuantity(item.productId, item.quantity + 1)"
                class="px-3 py-1 border rounded"
                :disabled="item.quantity >= item.stock"
              >
                +
              </button>
            </div>
            <span class="font-bold">{{ item.subtotal }} ₽</span>
            <button
              @click="removeFromCart(item.productId)"
              class="text-red-500 hover:underline"
            >
              Удалить
            </button>
          </div>
        </div>
        
        <div class="border-t pt-4">
          <div class="flex justify-between items-center">
            <span class="text-xl font-bold">Итого: {{ totalAmount }} ₽</span>
            <button
              @click="checkout"
              :disabled="loading"
              class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {{ loading ? 'Оформление...' : 'Оформить заказ' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Checkout Form -->
      <div v-if="showCheckoutForm" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-4">Данные доставки</h2>
        <form @submit.prevent="createOrder" class="space-y-4">
          <div class="relative">
            <label class="block text-sm font-medium mb-1">Адрес</label>
            <input
              v-model="shippingForm.shippingAddress"
              type="text"
              required
              placeholder="Начните вводить адрес..."
              class="w-full px-3 py-2 border rounded-lg"
              @input="handleAddressInput"
              @focus="handleAddressFocus"
              @blur="handleAddressBlur"
            />
            <div
              v-if="addressSuggestions.length > 0 && showSuggestions"
              class="absolute z-10 w-full mt-1 border rounded-lg bg-white shadow-lg max-h-48 overflow-y-auto"
            >
              <div
                v-for="(suggestion, index) in addressSuggestions"
                :key="index"
                @mousedown.prevent="selectAddress(suggestion)"
                class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {{ suggestion }}
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Город</label>
              <input
                v-model="shippingForm.shippingCity"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Почтовый индекс</label>
              <input
                v-model="shippingForm.shippingPostalCode"
                type="text"
                required
                placeholder="123456"
                maxlength="6"
                class="w-full px-3 py-2 border rounded-lg"
                @input="handlePostalCodeInput"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Телефон</label>
            <input
              v-model="shippingForm.shippingPhone"
              type="tel"
              required
              placeholder="+7 (999) 123-45-67"
              class="w-full px-3 py-2 border rounded-lg"
              @input="handlePhoneInput"
            />
          </div>
          
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="showCheckoutForm = false"
              class="px-4 py-2 border rounded-lg"
            >
              Отмена
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {{ loading ? 'Создание заказа...' : 'Создать заказ' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const productsStore = useProductsStore()
const { $api } = useNuxtApp()

const cart = useState('cart', () => [] as Array<{ productId: number; quantity: number }>)
const products = useState('cartProducts', () => new Map<number, any>())
const showCheckoutForm = ref(false)
const loading = ref(false)
const addressSuggestions = ref<string[]>([])
const showSuggestions = ref(false)

const { formatPhone, unformatPhone } = usePhoneMask()
const { formatPostalCode } = usePostalCodeMask()

const shippingForm = reactive({
  shippingAddress: '',
  shippingCity: '',
  shippingPostalCode: '',
  shippingPhone: '',
})

const cartItems = computed(() => {
  return cart.value.map(item => {
    const product = products.value.get(item.productId)
    if (!product) return null
    
    return {
      productId: item.productId,
      productName: product.name,
      price: product.price,
      quantity: item.quantity,
      stock: product.stock,
      subtotal: product.price * item.quantity,
    }
  }).filter(Boolean)
})

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.subtotal, 0)
})

const loadCartProducts = async () => {
  const productIds = [...new Set(cart.value.map(item => item.productId))]
  for (const id of productIds) {
    if (!products.value.has(id)) {
      await productsStore.fetchProductById(id)
      if (productsStore.currentProduct) {
        products.value.set(id, productsStore.currentProduct)
      }
    }
  }
}

const updateQuantity = (productId: number, newQuantity: number) => {
  const item = cart.value.find(item => item.productId === productId)
  if (item) {
    const product = products.value.get(productId)
    if (product && newQuantity > 0 && newQuantity <= product.stock) {
      item.quantity = newQuantity
    }
  }
}

const removeFromCart = (productId: number) => {
  const index = cart.value.findIndex(item => item.productId === productId)
  if (index > -1) {
    cart.value.splice(index, 1)
    products.value.delete(productId)
  }
}

const checkout = () => {
  showCheckoutForm.value = true
}

const handlePhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const formatted = formatPhone(target.value)
  shippingForm.shippingPhone = formatted
  target.value = formatted
}

const handlePostalCodeInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const formatted = formatPostalCode(target.value)
  shippingForm.shippingPostalCode = formatted
  target.value = formatted
}

const handleAddressFocus = () => {
  if (addressSuggestions.value.length > 0) {
    showSuggestions.value = true
  }
}

const handleAddressBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const handleAddressInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.trim()
  
  if (value.length < 3) {
    addressSuggestions.value = []
    showSuggestions.value = false
    return
  }
  
  const commonAddresses = [
    'г. Москва, ул. Ленина, д. 1',
    'г. Москва, ул. Пушкина, д. 10',
    'г. Москва, ул. Тверская, д. 5',
    'г. Москва, пр. Мира, д. 100',
    'г. Санкт-Петербург, пр. Невский, д. 25',
    'г. Санкт-Петербург, ул. Садовая, д. 5',
    'г. Санкт-Петербург, ул. Литейный проспект, д. 10',
    'г. Новосибирск, ул. Красный проспект, д. 1',
    'г. Екатеринбург, ул. Ленина, д. 50',
    'г. Казань, ул. Баумана, д. 20',
  ]
  
  addressSuggestions.value = commonAddresses
    .filter(addr => addr.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 5)
  showSuggestions.value = addressSuggestions.value.length > 0
}

const selectAddress = (address: string) => {
  shippingForm.shippingAddress = address
  addressSuggestions.value = []
  showSuggestions.value = false
  
  const cityMatch = address.match(/г\.\s*([^,]+)/i)
  if (cityMatch) {
    shippingForm.shippingCity = cityMatch[1].trim()
  }
}

const { success, error: showError } = useToast()

const createOrder = async () => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    showError('Пожалуйста, войдите в систему для оформления заказа')
    navigateTo('/login')
    return
  }
  
  authStore.initAuth()
  
  loading.value = true
  try {
    const phoneDigits = unformatPhone(shippingForm.shippingPhone)
    if (phoneDigits.length !== 11) {
      showError('Пожалуйста, введите корректный номер телефона')
      loading.value = false
      return
    }
    
    const orderData = {
      items: cart.value.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      shippingAddress: shippingForm.shippingAddress,
      shippingCity: shippingForm.shippingCity,
      shippingPostalCode: shippingForm.shippingPostalCode,
      shippingPhone: phoneDigits,
    }
    
    await ordersStore.createOrder(orderData)
    
    cart.value = []
    products.value.clear()
    showCheckoutForm.value = false
    
    success('Заказ успешно создан!')
    navigateTo('/orders')
  } catch (error: any) {
    if (error.response?.status === 403) {
      showError('Ошибка доступа. Пожалуйста, войдите в систему заново.')
      authStore.logout()
      navigateTo('/login')
    } else {
      showError(error.response?.data?.message || 'Ошибка при создании заказа')
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCartProducts()
})
</script>

