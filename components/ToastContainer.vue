<template>
  <div class="toast-container-custom">
    <TransitionGroup name="toast-list">
      <div v-for="toast in toasts" :key="toast.id" class="soft-toast show" :class="`toast-${toast.type}`">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <i
              v-if="toast.type === 'success'"
              class="bi bi-check-circle-fill text-success me-2"
            ></i>
            <i
              v-else-if="toast.type === 'danger'"
              class="bi bi-exclamation-octagon-fill text-danger me-2"
            ></i>
            <i
              v-else-if="toast.type === 'warning'"
              class="bi bi-exclamation-triangle-fill text-warning me-2"
            ></i>
            <i v-else class="bi bi-info-circle-fill text-info me-2"></i>
            <span class="text-dark fw-medium" style="font-size: 0.85rem;">{{ toast.message }}</span>
          </div>
          <button
            type="button"
            class="btn-close ms-2"
            @click="dismissNotification(toast.id)"
            style="font-size: 0.75rem; opacity: 0.6;"
          ></button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/useNotification'

const { toasts, dismissNotification } = useNotification()
</script>

<style scoped>
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}

.toast-list-enter-from,
.toast-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
