import { defineStore } from 'pinia'

export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  imageUrl?: string
  brand: string
  size?: string
  color?: string
  material?: string
  categoryId: number
  categoryName: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

interface ProductsState {
  products: Product[]
  currentProduct: Product | null
  loading: boolean
  pagination: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

export const useProductsStore = defineStore('products', {
  state: (): ProductsState => ({
    products: [],
    currentProduct: null,
    loading: false,
    pagination: {
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    },
  }),

  actions: {
    async fetchProducts(params: {
      page?: number
      size?: number
      categoryId?: number
      minPrice?: number
      maxPrice?: number
      brand?: string
      productSize?: string
      color?: string
      search?: string
      sortBy?: string
      sortDir?: string
      append?: boolean
    }) {
      if (!process.client) return
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const response = await $api.get<PageResponse<Product>>('/products', { params })
        if (params.append) {
          this.products = [...this.products, ...response.data.content]
        } else {
          this.products = response.data.content
        }
        this.pagination = {
          page: response.data.page,
          size: response.data.size,
          totalElements: response.data.totalElements,
          totalPages: response.data.totalPages,
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchProductById(id: number) {
      if (!process.client) return
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const response = await $api.get<Product>(`/products/${id}`)
        this.currentProduct = response.data
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        this.loading = false
      }
    },
  },
})

