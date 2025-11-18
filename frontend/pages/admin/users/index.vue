<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Управление пользователями</h1>
      <button
        @click="showCreateModal = true"
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Добавить пользователя
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="mb-4 flex gap-4">
      <input
        v-model="searchQuery"
        @input="debouncedSearch"
        type="text"
        placeholder="Поиск по имени, email, username..."
        class="flex-1 px-4 py-2 border rounded-lg"
      />
      <select
        v-model="roleFilter"
        @change="loadUsers"
        class="px-4 py-2 border rounded-lg"
      >
        <option value="">Все роли</option>
        <option value="ROLE_USER">Пользователь</option>
        <option value="ROLE_MANAGER">Менеджер</option>
      </select>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ user.id }}</td>
            <td class="px-6 py-4">{{ user.username }}</td>
            <td class="px-6 py-4">{{ user.email }}</td>
            <td class="px-6 py-4">{{ user.firstName }} {{ user.lastName }}</td>
            <td class="px-6 py-4">
              <span
                :class="{
                  'bg-green-100 text-green-800': user.role === 'ROLE_MANAGER',
                  'bg-blue-100 text-blue-800': user.role === 'ROLE_USER',
                }"
                class="px-2 py-1 rounded text-xs font-medium"
              >
                {{ user.role === 'ROLE_MANAGER' ? 'Менеджер' : 'Пользователь' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span
                :class="{
                  'bg-green-100 text-green-800': user.enabled,
                  'bg-red-100 text-red-800': !user.enabled,
                }"
                class="px-2 py-1 rounded text-xs font-medium"
              >
                {{ user.enabled ? 'Активен' : 'Заблокирован' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <button
                @click="editUser(user)"
                class="text-blue-500 hover:underline mr-4"
              >
                Редактировать
              </button>
              <button
                @click="deleteUser(user.id)"
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
    <div v-if="loadingMore" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || editingUser" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">{{ editingUser ? 'Редактировать пользователя' : 'Создать пользователя' }}</h2>

        <form @submit.prevent="saveUser" class="space-y-4">
          <div v-if="!editingUser" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Username *</label>
              <input
                v-model="userForm.username"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Email *</label>
              <input
                v-model="userForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div v-else class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Username</label>
              <input
                :value="editingUser.username"
                type="text"
                disabled
                class="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Email *</label>
              <input
                v-model="userForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Имя *</label>
              <input
                v-model="userForm.firstName"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Фамилия *</label>
              <input
                v-model="userForm.lastName"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Телефон</label>
            <input
              v-model="userForm.phone"
              type="text"
              class="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Пароль {{ editingUser ? '(оставьте пустым, чтобы не менять)' : '*' }}</label>
            <input
              v-model="userForm.password"
              type="password"
              :required="!editingUser"
              class="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Роль *</label>
            <select
              v-model="userForm.role"
              required
              class="w-full px-3 py-2 border rounded-lg"
            >
              <option value="ROLE_USER">Пользователь</option>
              <option value="ROLE_MANAGER">Менеджер</option>
            </select>
          </div>

          <div v-if="editingUser" class="flex items-center">
            <input
              v-model="userForm.enabled"
              type="checkbox"
              id="enabled"
              class="mr-2"
            />
            <label for="enabled" class="text-sm font-medium">Активен</label>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="cancelEdit"
              class="px-4 py-2 border rounded-lg"
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
  middleware: 'admin',
})

const { $api } = useNuxtApp()

interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'ROLE_USER' | 'ROLE_MANAGER' | 'ROLE_ADMIN'
  enabled: boolean
}

interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

const users = ref<User[]>([])
const showCreateModal = ref(false)
const editingUser = ref<User | null>(null)
const searchQuery = ref('')
const roleFilter = ref('')
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)

const pagination = reactive({
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  last: false,
})

const userForm = reactive({
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  role: 'ROLE_USER' as 'ROLE_USER' | 'ROLE_MANAGER',
  enabled: true,
})

let searchTimeout: NodeJS.Timeout | null = null

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    pagination.page = 0
    users.value = [] // Reset users
    loadUsers(0, false)
  }, 500)
}

const loadUsers = async (page = 0, append = false) => {
  if (loadingMore.value) return
  loadingMore.value = true
  
  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop
  
  try {
    const params: any = {
      page,
      size: pagination.size,
      sortBy: 'id',
      sortDir: 'DESC',
    }

    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim()
    }

    const response = await $api.get<PageResponse<User>>('/users', { params })

    let filteredUsers = response.data.content
    if (roleFilter.value) {
      filteredUsers = filteredUsers.filter((u) => u.role === roleFilter.value)
    }

    if (append) {
      users.value = [...users.value, ...filteredUsers]
    } else {
      users.value = filteredUsers
    }
    
    pagination.page = response.data.page
    pagination.totalElements = response.data.totalElements
    pagination.totalPages = response.data.totalPages
    pagination.last = response.data.last
    hasMore.value = !response.data.last
    
    if (append) {
      await nextTick()
      window.scrollTo({
        top: scrollPosition,
        behavior: 'instant'
      })
    }
  } catch (error: any) {
    console.error('Error loading users:', error)
    showError(error.response?.data?.message || 'Ошибка при загрузке пользователей')
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
    const nextPage = pagination.page + 1
    if (nextPage < pagination.totalPages) {
      loadUsers(nextPage, true)
    }
  }
}

const editUser = (user: User) => {
  editingUser.value = user
  Object.assign(userForm, {
    username: user.username,
    email: user.email,
    password: '',
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || '',
    role: user.role === 'ROLE_ADMIN' ? 'ROLE_USER' : user.role,
    enabled: user.enabled,
  })
}

const cancelEdit = () => {
  showCreateModal.value = false
  editingUser.value = null
  Object.assign(userForm, {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'ROLE_USER',
    enabled: true,
  })
}

const { success, error: showError } = useToast()

const saveUser = async () => {
  try {
    if (editingUser.value) {
      const updateData: any = {
        email: userForm.email,
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        phone: userForm.phone,
        role: userForm.role,
        enabled: userForm.enabled,
      }

      if (userForm.password.trim()) {
        updateData.password = userForm.password
      }

      await $api.put(`/users/${editingUser.value.id}`, updateData)
    } else {
      await $api.post('/users', {
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        phone: userForm.phone,
        role: userForm.role,
      })
    }
    await loadUsers(0, false)
    cancelEdit()
    success('Пользователь успешно сохранен')
  } catch (error: any) {
    console.error('Error saving user:', error)
    showError(error.response?.data?.message || 'Ошибка при сохранении пользователя')
  }
}

const deleteUser = async (id: number) => {
  if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return

  try {
    await $api.delete(`/users/${id}`)
    await loadUsers(0, false)
    success('Пользователь успешно удален')
  } catch (error: any) {
    console.error('Error deleting user:', error)
    showError(error.response?.data?.message || 'Ошибка при удалении пользователя')
  }
}

onMounted(() => {
  loadUsers(0, false)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

