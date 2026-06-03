<template>
  <header class="navbar navbar-expand navbar-light bg-white px-3 py-3 shadow-sm border-bottom">
    <div class="container-fluid p-0 d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-2 gap-md-3">
        <!-- Hamburger Menu for Mobile -->
        <button 
          class="btn btn-link link-dark p-0 d-lg-none border-0" 
          @click="$emit('toggle-sidebar')"
          aria-label="Toggle Menu"
        >
          <i class="bi bi-list fs-2"></i>
        </button>
        <h4 class="mb-0 fw-bold text-dark section-title-responsive">{{ sectionTitle }}</h4>
      </div>
      <div class="d-flex align-items-center gap-2 gap-md-3">
        <span class="badge bg-dark px-2 px-md-3 py-2 rounded-pill d-sm-flex align-items-center gap-2">
          <span
            class="spinner-grow spinner-grow-sm"
            :class="mqttConnected ? 'text-success' : 'text-warning'"
            role="status"
            style="width: 8px; height: 8px;"
          ></span>
          <span class="d-none d-md-inline">{{ mqttStatus }}</span>
          <span class="d-md-none" style="font-size: 0.65rem;">IoT</span>
        </span>
        <div class="vr d-none d-sm-block"></div>
        <div class="d-flex align-items-center gap-2">
          <div
            class="bg-success bg-opacity-10 rounded-circle text-center d-flex align-items-center justify-content-center fw-bold text-xs"
            style="width: 32px; height: 32px; color: var(--primary-nature); font-size: 0.7rem;"
          >
            UTB
          </div>
          <div class="d-none d-md-block text-start">
            <div class="fw-semibold mb-0" style="font-size: 0.85rem; line-height: 1.2;">Dr. AA. Ade Kadarisman</div>
            <small class="text-muted" style="font-size: 0.75rem;">Ketua Peneliti</small>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  sectionTitle: string
  mqttConnected: boolean
  mqttStatus: string
}>()

defineEmits(['toggle-sidebar'])
</script>

<style scoped>
@media (max-width: 575.98px) {
  .section-title-responsive {
    font-size: 1rem;
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>

