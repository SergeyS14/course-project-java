<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Управление товарами</h1>
      <button
        @click="showCreateModal = true"
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Добавить товар
      </button>
    </div>
    
    <!-- Products Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Остаток</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in productsStore.products" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ product.id }}</td>
              <td class="px-6 py-4">{{ product.name }}</td>
              <td class="px-6 py-4">{{ product.price }} ₽</td>
              <td class="px-6 py-4">{{ product.stock }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="editProduct(product)"
                  class="text-blue-500 hover:underline mr-4"
                >
                  Редактировать
                </button>
                <button
                  v-if="authStore.isAdmin"
                  @click="deleteProduct(product.id)"
                  class="text-red-500 hover:underline"
                >
                  Удалить
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Infinite Scroll Loader -->
      <div v-if="loadingMore" class="text-center py-4">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || editingProduct" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">{{ editingProduct ? 'Редактировать товар' : 'Создать товар' }}</h2>
        
        <form @submit.prevent="saveProduct" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Название</label>
            <input v-model="productForm.name" type="text" required class="w-full px-3 py-2 border rounded-lg" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Описание</label>
            <textarea v-model="productForm.description" class="w-full px-3 py-2 border rounded-lg" rows="3"></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Цена</label>
              <input v-model.number="productForm.price" type="number" step="0.01" required class="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Остаток</label>
              <input v-model.number="productForm.stock" type="number" required class="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Категория</label>
            <select v-model.number="productForm.categoryId" required class="w-full px-3 py-2 border rounded-lg">
              <option value="">Выберите категорию</option>
              <option v-for="cat in categoriesStore.categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Бренд</label>
            <div class="flex gap-2">
              <select v-model="productForm.brand" required class="flex-1 px-3 py-2 border rounded-lg">
                <option value="">Выберите бренд</option>
                <option v-for="brand in brands" :key="brand" :value="brand">
                  {{ brand }}
                </option>
                <option value="__NEW__">+ Добавить новый</option>
              </select>
              <input
                v-if="productForm.brand === '__NEW__'"
                v-model="newBrand"
                type="text"
                placeholder="Название бренда"
                class="flex-1 px-3 py-2 border rounded-lg"
                @blur="addNewBrand"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Изображение товара</label>
            <div class="space-y-2">
              <label
                ref="dropZone"
                class="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all"
                :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
              >
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="mb-2 text-sm text-gray-500">
                    <span class="font-semibold">Нажмите для загрузки</span> или перетащите файл
                  </p>
                  <p class="text-xs text-gray-500">PNG, JPG, GIF до 10MB</p>
                </div>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="hidden"
                />
              </label>
              
              <div v-if="imagePreview" class="mt-2 relative">
                <img :src="imagePreview" alt="Preview" class="w-full h-64 object-cover rounded-lg border-2 border-blue-500" />
                <button
                  type="button"
                  @click="clearImage"
                  class="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
                >
                  ✕ Удалить
                </button>
              </div>
              <div v-else-if="productForm.imageUrl" class="mt-2 relative">
                <p class="text-sm text-gray-500 mb-2">Текущее изображение:</p>
                <img :src="productForm.imageUrl" alt="Current" class="w-full h-64 object-cover rounded-lg border-2 border-gray-300" />
                <button
                  type="button"
                  @click="clearImage"
                  class="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
                >
                  ✕ Удалить
                </button>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Размер</label>
              <select v-model="productForm.size" class="w-full px-3 py-2 border rounded-lg">
                <option value="">Выберите размер</option>
                <option value="XXS">XXS</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Цвет</label>
              <div class="flex gap-2">
                <select v-model="productForm.color" class="flex-1 px-3 py-2 border rounded-lg">
                  <option value="">Выберите цвет</option>
                  <option v-for="color in colors" :key="color" :value="color">
                    {{ color }}
                  </option>
                  <option value="__NEW__">+ Добавить новый</option>
                </select>
                <input
                  v-if="productForm.color === '__NEW__'"
                  v-model="newColor"
                  type="text"
                  placeholder="Название цвета"
                  class="flex-1 px-3 py-2 border rounded-lg"
                  @blur="addNewColor"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Материал</label>
              <input v-model="productForm.material" type="text" class="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          
          <div class="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              @click="cancelEdit"
              class="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'

definePageMeta({
  middleware: 'manager',
})

const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()
const authStore = useAuthStore()
const { $api } = useNuxtApp()

const showCreateModal = ref(false)
const editingProduct = ref(null as any)
const fileInput = ref<HTMLInputElement | null>(null)
const dropZone = ref<HTMLLabelElement | null>(null)
const imagePreview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const brands = ref<string[]>([])
const colors = ref<string[]>([])
const newBrand = ref('')
const newColor = ref('')
const loadingMore = ref(false)
const hasMore = ref(true)
const isDragging = ref(false)

const productForm = reactive({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  categoryId: 0,
  brand: '',
  imageUrl: '',
  size: '',
  color: '',
  material: '',
})

const loadProducts = async (page = 0, append = false) => {
  if (loadingMore.value) return
  loadingMore.value = true
  
  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop
  
  try {
    await productsStore.fetchProducts({ page, size: 20, append })
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

const loadBrands = async () => {
  try {
    const response = await $api.get<string[]>('/products/brands')
    brands.value = response.data
  } catch (error) {
    console.error('Error loading brands:', error)
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

const addNewBrand = () => {
  if (newBrand.value && !brands.value.includes(newBrand.value)) {
    brands.value.push(newBrand.value)
    brands.value.sort()
    productForm.brand = newBrand.value
    newBrand.value = ''
  }
}

const addNewColor = () => {
  if (newColor.value && !colors.value.includes(newColor.value)) {
    colors.value.push(newColor.value)
    colors.value.sort()
    productForm.color = newColor.value
    newColor.value = ''
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
}

const { error: showError, success } = useToast()

const processFile = (file: File) => {
  if (file.size > 10 * 1024 * 1024) {
    showError('Файл слишком большой. Максимальный размер: 10MB')
    return
  }
  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const clearImage = () => {
  imagePreview.value = null
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  productForm.imageUrl = ''
}

const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await $api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  return response.data.url
}

const editProduct = (product: any) => {
  editingProduct.value = product
  Object.assign(productForm, {
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    categoryId: product.categoryId,
    brand: product.brand || '',
    imageUrl: product.imageUrl || '',
    size: product.size || '',
    color: product.color || '',
    material: product.material || '',
  })
  imagePreview.value = null
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const cancelEdit = () => {
  showCreateModal.value = false
  editingProduct.value = null
  Object.assign(productForm, {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: 0,
    brand: '',
    imageUrl: '',
    size: '',
    color: '',
    material: '',
  })
  clearImage()
  newBrand.value = ''
  newColor.value = ''
}

const saveProduct = async () => {
  try {
    if (selectedFile.value) {
      try {
        productForm.imageUrl = await uploadImage(selectedFile.value)
      } catch (err) {
        console.error('Error uploading image:', err)
        showError('Ошибка при загрузке изображения')
        return
      }
    }
    
    if (editingProduct.value) {
      await $api.put(`/products/${editingProduct.value.id}`, productForm)
    } else {
      await $api.post('/products', productForm)
    }
    await loadProducts(0, false)
    await loadBrands()
    await loadColors()
    cancelEdit()
    success('Товар успешно сохранен')
  } catch (err) {
    console.error('Error saving product:', err)
    showError('Ошибка при сохранении товара')
  }
}

const deleteProduct = async (id: number) => {
  if (!confirm('Вы уверены, что хотите удалить этот товар?')) return
  
  try {
    await $api.delete(`/products/${id}`)
    await loadProducts(0, false)
    success('Товар успешно удален')
  } catch (err) {
    console.error('Error deleting product:', err)
    showError('Ошибка при удалении товара')
  }
}

const handleScroll = () => {
  if (loadingMore.value || !hasMore.value) return
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  if (scrollTop + windowHeight >= documentHeight - 100) {
    const nextPage = productsStore.pagination.page + 1
    if (nextPage < productsStore.pagination.totalPages) {
      loadProducts(nextPage, true)
    }
  }
}

onMounted(async () => {
  await categoriesStore.fetchCategories()
  await loadBrands()
  await loadColors()
  await loadProducts(0, false)
  
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
