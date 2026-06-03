<template>
  <aside 
    class="sidebar flex-column p-0" 
    :class="{ 'mobile-show': isOpen }"
  >
    <div class="p-4 border-bottom border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center">
        <div class="bg-light p-2 rounded-3 me-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
          <i class="bi bi-droplet-fill fs-4" style="color: var(--accent-water);"></i>
        </div>
        <div>
          <h6 class="m-0 fw-bold text-white tracking-wide">TIRTHA PAWITAN</h6>
          <small class="text-white-50 text-uppercase" style="font-size: 0.65rem;">GIS Kuningan Web Portal</small>
        </div>
      </div>
      
      <!-- Close Button for Mobile -->
      <button 
        class="btn btn-link text-white p-0 d-lg-none border-0" 
        @click="$emit('close')"
        aria-label="Close Menu"
      >
        <i class="bi bi-x-lg fs-4"></i>
      </button>
    </div>

    <div class="py-4 flex-grow-1 overflow-y-auto">
      <ul class="nav nav-pills flex-column">
        <li class="nav-item">
          <NuxtLink
            to="/"
            class="nav-link w-100 text-start"
            :class="{ active: activeTab === 'dashboard' }"
            @click="$emit('close')"
          >
            <i class="bi bi-speedometer2 me-3"></i> Beranda Dasbor
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink
            to="/gis-map"
            class="nav-link w-100 text-start"
            :class="{ active: activeTab === 'gis-map' }"
            @click="$emit('close')"
          >
            <i class="bi bi-map-fill me-3"></i> Peta Kuningan GIS
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink
            to="/data-management"
            class="nav-link w-100 text-start"
            :class="{ active: activeTab === 'data-management' }"
            @click="$emit('close')"
          >
            <i class="bi bi-database-fill me-3"></i> Manajemen Data
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink
            to="/culture-edu"
            class="nav-link w-100 text-start"
            :class="{ active: activeTab === 'culture-edu' }"
            @click="$emit('close')"
          >
            <i class="bi bi-flower1 me-3"></i> Budaya Kawin Cai
          </NuxtLink>
        </li>
      </ul>
    </div>

    <div class="p-4 border-top border-secondary border-opacity-10 text-center text-white-50 mt-auto" style="font-size: 0.8rem;">
      <p class="mb-0">© 2026 Kemdiktisaintek</p>
      <span class="text-white">Universitas Teknologi Bandung</span>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  activeTab: string
  isOpen: boolean
}>()

defineEmits(['close'])
</script>

<style scoped>
.sidebar {
  width: 280px;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1050;
  transition: transform 0.3s ease;
}

@media (max-width: 991.98px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar.mobile-show {
    transform: translateX(0);
  }
}

@media (min-width: 992px) {
  .sidebar {
    position: sticky;
    height: 100vh;
    transform: none !important;
  }
}
</style>

