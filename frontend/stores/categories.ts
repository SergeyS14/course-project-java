import { defineStore } from 'pinia'

export interface Category {
  id: number
  name: string
  description?: string
}

interface CategoriesState {
  categories: Category[]
  loading: boolean
}

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    categories: [],
    loading: false,
  }),

  actions: {
    async fetchCategories() {
      if (!process.client) return
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const response = await $api.get<Category[]>('/categories')
        this.categories = response.data
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        this.loading = false
      }
    },
  },
})

