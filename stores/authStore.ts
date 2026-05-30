import { defineStore } from 'pinia'

interface AuthUser {
  id: number
  email: string
  fullName: string
  role: string
  status: string
  permissions?: { action: string; resource: string }[]
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value)

  const init = () => {
    if (import.meta.client) {
      const savedToken = localStorage.getItem('tirtha_token')
      const savedUser = localStorage.getItem('tirtha_user')
      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      }
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await useFetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      if (error.value) throw error.value
      if (data.value) {
        token.value = data.value.token
        user.value = data.value.user
        if (import.meta.client) {
          localStorage.setItem('tirtha_token', data.value.token)
          localStorage.setItem('tirtha_user', JSON.stringify(data.value.user))
        }
      }
      return data.value
    } catch (err: any) {
      throw new Error(err.message || 'Login gagal')
    }
  }

  const register = async (formData: any) => {
    try {
      const { data, error } = await useFetch('/api/auth/register', {
        method: 'POST',
        body: formData
      })
      if (error.value) throw error.value
      if (data.value) {
        token.value = data.value.token
        user.value = data.value.user
        if (import.meta.client) {
          localStorage.setItem('tirtha_token', data.value.token)
          localStorage.setItem('tirtha_user', JSON.stringify(data.value.user))
        }
      }
      return data.value
    } catch (err: any) {
      throw new Error(err.message || 'Registrasi gagal')
    }
  }

  const logout = async () => {
    try {
      await useFetch('/api/auth/logout', {
        method: 'POST',
        headers: token.value ? { Authorization: `Bearer ${token.value}` } : {}
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      token.value = null
      user.value = null
      if (import.meta.client) {
        localStorage.removeItem('tirtha_token')
        localStorage.removeItem('tirtha_user')
      }
    }
  }

  const fetchProfile = async () => {
    if (!token.value) return
    try {
      const { data } = await useFetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      if (data.value) {
        user.value = data.value
        if (import.meta.client) {
          localStorage.setItem('tirtha_user', JSON.stringify(data.value))
        }
      }
    } catch (err) {
      console.error('Fetch profile error:', err)
    }
  }

  const hasPermission = (action: string, resource: string): boolean => {
    if (!user.value?.permissions) return false
    return user.value.permissions.some(
      p => p.action === action && p.resource === resource
    )
  }

  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isPetugas = computed(() => user.value?.role === 'PETUGAS')
  const isPeneliti = computed(() => user.value?.role === 'PENELITI')

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isPetugas,
    isPeneliti,
    init,
    login,
    register,
    logout,
    fetchProfile,
    hasPermission
  }
})
