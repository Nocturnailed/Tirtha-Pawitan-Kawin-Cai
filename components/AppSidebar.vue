<template>
  <aside class="col-lg-3 col-xl-2 sidebar d-flex flex-column p-0">
    <div class="p-4 border-bottom border-secondary border-opacity-25 d-flex align-items-center">
      <div class="bg-light p-2 rounded-3 me-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
        <i class="bi bi-droplet-fill fs-4" style="color: var(--accent-water);"></i>
      </div>
      <div>
        <h6 class="m-0 fw-bold text-white tracking-wide">TIRTHA PAWITAN</h6>
        <small class="text-white-50 text-uppercase" style="font-size: 0.65rem;">GIS Kuningan Web Portal</small>
      </div>
    </div>

    <div class="py-4 flex-grow-1">
      <ul class="nav nav-pills flex-column">
        <li class="nav-item">
          <NuxtLink
            to="/"
            class="nav-link w-100 text-start"
            :class="{ active: activeTab === 'dashboard' }"
          >
            <i class="bi bi-speedometer2 me-3"></i> Beranda Dasbor
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink
            to="/gis-map"
            class="nav-link w-100 text-start"
            :class="{ active: activeTab === 'gis-map' }"
          >
            <i class="bi bi-map-fill me-3"></i> Peta Kuningan GIS
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink
            to="/data-management"
            class="nav-link w-100 text-start"
            :class="{ active: activeTab === 'data-management' }"
          >
            <i class="bi bi-database-fill me-3"></i> Manajemen Data
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink
            to="/culture-edu"
            class="nav-link w-100 text-start"
            :class="{ active: activeTab === 'culture-edu' }"
          >
            <i class="bi bi-flower1 me-3"></i> Budaya Kawin Cai
          </NuxtLink>
        </li>
      </ul>
    </div>

    <div class="p-4 border-top border-secondary border-opacity-10 text-center text-white-50" style="font-size: 0.8rem;">
      <p class="mb-0">© 2026 Kemdiktisaintek</p>
      <span class="text-white">Universitas Teknologi Bandung</span>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  activeTab: string
}>()
</script>
