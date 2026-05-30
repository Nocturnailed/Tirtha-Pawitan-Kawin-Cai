import { ref } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'danger' | 'warning' | 'info'
  duration?: number
}

const toasts = ref<Toast[]>([])

export const useNotification = () => {
  const showNotification = (message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'success', duration = 2500) => {
    const id = `toast-${Date.now()}`
    const toast: Toast = { id, message, type, duration }

    toasts.value.push(toast)

    if (duration) {
      setTimeout(() => {
        dismissNotification(id)
      }, duration)
    }

    return id
  }

  const dismissNotification = (id: string) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const success = (message: string) => showNotification(message, 'success')
  const error = (message: string) => showNotification(message, 'danger')
  const warning = (message: string) => showNotification(message, 'warning')
  const info = (message: string) => showNotification(message, 'info')

  return {
    toasts,
    showNotification,
    dismissNotification,
    success,
    error,
    warning,
    info
  }
}
