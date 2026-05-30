<template>
  <div class="container-fluid p-0">
    <div class="row g-0">
      <AppSidebar :active-tab="activeTab" />

      <main class="col-lg-9 col-xl-10 d-flex flex-column" style="min-height: 100vh;">
        <AppNavbar
          :section-title="sectionTitles[activeTab] || 'Sistem Informasi GIS'"
          :mqtt-connected="mqttConnected"
          :mqtt-status="mqttStatus"
        />

        <div class="p-4 flex-grow-1">
          <slot />
        </div>

        <footer class="bg-white border-top py-3 px-4 text-center mt-auto">
          <p class="mb-0 text-muted" style="font-size: 0.85rem;">
            <strong>Sinergi Riset UTB — Program Bestari Saintek TA 2026</strong>. Menuju Kemandirian Sains & Teknologi Hijau Nasional.
          </p>
        </footer>
      </main>
    </div>

    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMqtt } from '~/composables/useMqtt'

const route = useRoute()
const { isConnected, connectionMode, initMqtt } = useMqtt()

const activeTab = computed(() => {
  const path = route.path
  if (path === '/') return 'dashboard'
  return path.replace('/', '')
})

const sectionTitles: { [key: string]: string } = {
  dashboard: 'Beranda Dasbor Proyek',
  'gis-map': 'Peta GIS Sumber Mata Air',
  'data-management': 'Manajemen Data & Kualitas Air',
  'culture-edu': 'Kearifan Lokal "Kawin Cai"'
}

const mqttConnected = computed(() => isConnected.value)
const mqttStatus = computed(() => {
  if (connectionMode.value === 'fallback') return 'IoT: Mode Simulasi'
  return mqttConnected.value ? 'IoT: Terhubung' : 'IoT: Menghubungkan...'
})

onMounted(() => {
  initMqtt()
})
</script>
