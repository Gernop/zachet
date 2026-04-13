import { reactive, readonly } from 'vue'

const API_URL = '/api'

const state = reactive({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
})

// Загрузка из localStorage
const savedUser = localStorage.getItem('currentUser')
if (savedUser) {
  state.user = JSON.parse(savedUser)
  state.isAuthenticated = true
}

export const authStore = {
  state: readonly(state),

  async login(username, password) {
    state.loading = true
    state.error = null
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (!response.ok) {
        state.error = data.error || 'Ошибка авторизации'
        state.loading = false
        throw new Error(data.error)
      }

      state.user = data.user
      state.isAuthenticated = true
      localStorage.setItem('currentUser', JSON.stringify(data.user))
      state.loading = false
      return data.user
    } catch (error) {
      state.loading = false
      if (!state.error) {
        state.error = 'Сервер недоступен. Проверьте подключение.'
      }
      throw error
    }
  },

  logout() {
    state.user = null
    state.isAuthenticated = false
    state.error = null
    localStorage.removeItem('currentUser')
  },

  clearError() {
    state.error = null
  },
}

// API сервис для CRUD операций с реальным бэкендом
export const apiService = {
  async get(resource) {
    try {
      const response = await fetch(`${API_URL}/${resource}`)
      if (!response.ok) throw new Error('Ошибка загрузки данных')
      return await response.json()
    } catch (error) {
      console.error(`Ошибка GET /${resource}:`, error)
      return []
    }
  },

  async create(resource, data) {
    try {
      const response = await fetch(`${API_URL}/${resource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Ошибка создания')
      return await response.json()
    } catch (error) {
      console.error(`Ошибка CREATE /${resource}:`, error)
      throw error
    }
  },

  async update(resource, id, data) {
    try {
      const response = await fetch(`${API_URL}/${resource}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Ошибка обновления')
      return await response.json()
    } catch (error) {
      console.error(`Ошибка UPDATE /${resource}/${id}:`, error)
      throw error
    }
  },

  async delete(resource, id) {
    try {
      const response = await fetch(`${API_URL}/${resource}/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Ошибка удаления')
      return await response.json()
    } catch (error) {
      console.error(`Ошибка DELETE /${resource}/${id}:`, error)
      throw error
    }
  },
}
