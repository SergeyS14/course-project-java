<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Каталог товаров</h1>
    
    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Поиск</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Название, описание, бренд..."
            class="w-full px-3 py-2 border rounded-lg"
            @input="debouncedSearch"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Категория</label>
          <select
            v-model="filters.categoryId"
            class="w-full px-3 py-2 border rounded-lg"
            @change="applyFilters"
          >
            <option :value="undefined">Все категории</option>
            <option v-for="cat in categoriesStore.categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Бренд</label>
          <select
            v-model="filters.brand"
            class="w-full px-3 py-2 border rounded-lg"
            @change="applyFilters"
          >
            <option :value="undefined">Все бренды</option>
            <option v-for="brand in brands" :key="brand" :value="brand">
              {{ brand }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Размер</label>
          <select
            v-model="filters.productSize"
            class="w-full px-3 py-2 border rounded-lg"
            @change="applyFilters"
          >
            <option :value="undefined">Все размеры</option>
            <option v-for="size in sizes" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Цвет</label>
          <select
            v-model="filters.color"
            class="w-full px-3 py-2 border rounded-lg"
            @change="applyFilters"
          >
            <option :value="undefined">Все цвета</option>
            <option v-for="color in colors" :key="color" :value="color">
              {{ color }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Цена от</label>
          <input
            v-model.number="filters.minPrice"
            type="number"
            placeholder="0"
            class="w-full px-3 py-2 border rounded-lg"
            @change="applyFilters"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Цена до</label>
          <input
            v-model.number="filters.maxPrice"
            type="number"
            placeholder="100000"
            class="w-full px-3 py-2 border rounded-lg"
            @change="applyFilters"
          />
        </div>
        
        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>
    </div>
    
    <!-- Products Grid -->
    <div v-if="productsStore.loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="productsStore.products.length === 0" class="text-center py-12 text-gray-500">
      Товары не найдены
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
      <div
        v-for="product in productsStore.products"
        :key="product.id"
        class="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
        @click="navigateTo(`/products/${product.id}`)"
      >
        <div class="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
          <span v-if="!product.imageUrl" class="text-gray-400">Нет изображения</span>
          <img v-else :src="product.imageUrl" :alt="product.name" class="h-full w-full object-cover rounded-t-lg" />
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-lg mb-2">{{ product.name }}</h3>
          <p class="text-gray-600 text-sm mb-2">{{ product.brand }}</p>
          <p class="text-blue-600 font-bold text-xl">{{ product.price }} ₽</p>
          <p class="text-sm text-gray-500 mt-2">В наличии: {{ product.stock }}</p>
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

const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()
const { $api } = useNuxtApp()

const filters = reactive({
  search: '',
  categoryId: undefined as number | undefined,
  brand: undefined as string | undefined,
  productSize: undefined as string | undefined,
  color: undefined as string | undefined,
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  page: 0,
  size: 12,
  sortBy: 'id',
  sortDir: 'ASC',
})

const brands = ref<string[]>([])
const sizes = ref<string[]>([])
const colors = ref<string[]>([])
const loadingMore = ref(false)
const hasMore = ref(true)

let searchTimeout: NodeJS.Timeout

const loadBrands = async () => {
  try {
    const response = await $api.get<string[]>('/products/brands')
    brands.value = response.data
  } catch (error) {
    console.error('Error loading brands:', error)
  }
}

const loadSizes = async () => {
  try {
    const response = await $api.get<string[]>('/products/sizes')
    sizes.value = response.data
  } catch (error) {
    console.error('Error loading sizes:', error)
  }
}

const loadColors = async () => {
  try {
    const response = await $api.get<string[]>('/products/colors')
    colors.value = response.data
  } catch (error) {
    console.error('Error loading colors:', error)
  }
}

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const applyFilters = () => {
  filters.page = 0
  productsStore.products = [] // Reset products
  loadProducts(0, false)
}

const clearFilters = () => {
  filters.search = ''
  filters.categoryId = undefined
  filters.brand = undefined
  filters.productSize = undefined
  filters.color = undefined
  filters.minPrice = undefined
  filters.maxPrice = undefined
  applyFilters()
}

const loadProducts = async (page = 0, append = false) => {
  if (loadingMore.value) return
  loadingMore.value = true
  
  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop
  
  try {
    await productsStore.fetchProducts({ ...filters, page, append })
    hasMore.value = !productsStore.pagination.last
    
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
    const nextPage = productsStore.pagination.page + 1
    if (nextPage < productsStore.pagination.totalPages) {
      loadProducts(nextPage, true)
    }
  }
}

onMounted(async () => {
  await categoriesStore.fetchCategories()
  await loadBrands()
  await loadSizes()
  await loadColors()
  await loadProducts(0, false)
  
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

