<template>
  <div v-if="productsStore.loading" class="text-center py-12">
    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
  
  <div v-else-if="productsStore.currentProduct" class="max-w-6xl mx-auto">
    <div class="bg-white rounded-lg shadow-lg p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div class="h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <span v-if="!productsStore.currentProduct.imageUrl" class="text-gray-400">Нет изображения</span>
            <img
              v-else
              :src="productsStore.currentProduct.imageUrl"
              :alt="productsStore.currentProduct.name"
              class="h-full w-full object-cover rounded-lg"
            />
          </div>
        </div>
        
        <div>
          <h1 class="text-3xl font-bold mb-4">{{ productsStore.currentProduct.name }}</h1>
          <p class="text-xl text-blue-600 font-bold mb-4">
            {{ productsStore.currentProduct.price }} ₽
          </p>
          
          <div class="space-y-2 mb-6">
            <p><strong>Бренд:</strong> {{ productsStore.currentProduct.brand }}</p>
            <p><strong>Категория:</strong> {{ productsStore.currentProduct.categoryName }}</p>
            <p v-if="productsStore.currentProduct.size"><strong>Размер:</strong> {{ productsStore.currentProduct.size }}</p>
            <p v-if="productsStore.currentProduct.color"><strong>Цвет:</strong> {{ productsStore.currentProduct.color }}</p>
            <p v-if="productsStore.currentProduct.material"><strong>Материал:</strong> {{ productsStore.currentProduct.material }}</p>
            <p><strong>В наличии:</strong> {{ productsStore.currentProduct.stock }} шт.</p>
          </div>
          
          <div class="mb-6">
            <h3 class="font-semibold mb-2">Описание:</h3>
            <p class="text-gray-600">{{ productsStore.currentProduct.description || 'Нет описания' }}</p>
          </div>
          
          <div v-if="authStore.isAuthenticated" class="flex items-center space-x-4">
            <input
              v-model.number="quantity"
              type="number"
              min="1"
              :max="productsStore.currentProduct.stock"
              class="w-20 px-3 py-2 border rounded-lg"
            />
            <button
              @click="addToCart"
              :disabled="!quantity || quantity > productsStore.currentProduct.stock"
              class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Добавить в корзину
            </button>
          </div>
          
          <div v-else class="text-gray-500">
            <NuxtLink to="/login" class="text-blue-500 hover:underline">
              Войдите
            </NuxtLink>
            , чтобы добавить товар в корзину
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const productsStore = useProductsStore()
const authStore = useAuthStore()
const { success, error: showError } = useToast()

const quantity = ref(1)
const cart = useState('cart', () => [] as Array<{ productId: number; quantity: number }>)

onMounted(async () => {
  await productsStore.fetchProductById(Number(route.params.id))
})

const addToCart = () => {
  if (!productsStore.currentProduct) return
  
  if (quantity.value > productsStore.currentProduct.stock) {
    showError('Недостаточно товара на складе')
    return
  }
  
  const existingItem = cart.value.find(item => item.productId === productsStore.currentProduct!.id)
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity.value
    if (newQuantity > productsStore.currentProduct.stock) {
      showError('Недостаточно товара на складе')
      return
    }
    existingItem.quantity = newQuantity
  } else {
    cart.value.push({
      productId: productsStore.currentProduct.id,
      quantity: quantity.value,
    })
  }
  success('Товар добавлен в корзину!')
  quantity.value = 1
}
</script>

