<template>
  <header class="navbar navbar-expand navbar-light bg-white px-4 py-3 shadow-sm border-bottom">
    <div class="container-fluid p-0 d-flex justify-content-between align-items-center">
      <div>
        <h4 class="mb-0 fw-bold text-dark">{{ sectionTitle }}</h4>
      </div>
      <div class="d-flex align-items-center gap-3">
        <span class="badge bg-dark px-3 py-2 rounded-pill d-none d-sm-flex align-items-center gap-2">
          <span
            class="spinner-grow spinner-grow-sm"
            :class="mqttConnected ? 'text-success' : 'text-warning'"
            role="status"
            style="width: 8px; height: 8px;"
          ></span>
          <span>{{ mqttStatus }}</span>
        </span>
        <div class="vr d-none d-sm-block"></div>
        <div class="d-flex align-items-center gap-2">
          <div
            class="bg-success bg-opacity-10 rounded-circle text-center d-flex align-items-center justify-content-center fw-bold"
            style="width: 38px; height: 38px; color: var(--primary-nature);"
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
</script>
