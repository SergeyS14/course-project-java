import { defineStore } from 'pinia'
import type { PageResponse } from './products'

export interface OrderItem {
  id: number
  productId: number
  productName: string
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  id: number
  userId: number
  username: string
  orderDate: string
  totalAmount: number
  status: string
  shippingAddress: string
  shippingCity: string
  shippingPostalCode: string
  shippingPhone: string
  items: OrderItem[]
}

interface OrdersState {
  orders: Order[]
  currentOrder: Order | null
  loading: boolean
  pagination: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

export const useOrdersStore = defineStore('orders', {
  state: (): OrdersState => ({
    orders: [],
    currentOrder: null,
    loading: false,
    pagination: {
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    },
  }),

  actions: {
    async fetchOrders(params: {
      page?: number
      size?: number
      userId?: number
      sortBy?: string
      sortDir?: string
      append?: boolean
    }) {
      if (!process.client) return
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const response = await $api.get<PageResponse<Order>>('/orders', { params })
        if (params.append) {
          this.orders = [...this.orders, ...response.data.content]
        } else {
          this.orders = response.data.content
        }
        this.pagination = {
          page: response.data.page,
          size: response.data.size,
          totalElements: response.data.totalElements,
          totalPages: response.data.totalPages,
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchOrderById(id: number) {
      if (!process.client) return
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const response = await $api.get<Order>(`/orders/${id}`)
        this.currentOrder = response.data
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        this.loading = false
      }
    },

    async createOrder(orderData: any) {
      if (!process.client) throw new Error('Cannot create order on server')
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const response = await $api.post<Order>('/orders', orderData)
        return response.data
      } catch (error) {
        console.error('Error creating order:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})

