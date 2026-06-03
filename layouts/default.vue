<template>
  <div class="container-fluid p-0 overflow-hidden">
    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="isSidebarOpen" 
      class="sidebar-overlay d-lg-none" 
      @click="isSidebarOpen = false"
    ></div>

    <div class="row g-0 flex-nowrap">
      <AppSidebar 
        :active-tab="activeTab" 
        :is-open="isSidebarOpen"
        @close="isSidebarOpen = false"
      />

      <main class="col flex-grow-1 d-flex flex-column" style="min-height: 100vh; overflow-x: hidden;">
        <AppNavbar
          :section-title="sectionTitles[activeTab] || 'Sistem Informasi GIS'"
          :mqtt-connected="mqttConnected"
          :mqtt-status="mqttStatus"
          @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
        />

        <div class="p-4 flex-grow-1 container-max">
          <slot />
        </div>

        <footer class="bg-white border-top py-3 px-4 text-center mt-auto">
          <p class="mb-0 text-muted" style="font-size: 0.85rem;">
            <strong>Sinergi Riset UTB — Program Bestari Saintek TA 2026</strong>. Menuju Kemandirian Sains & Teknologi Hijau Nasional.
          </p>
          <div class="mt-1 text-muted opacity-75" style="font-size: 0.7rem;">
            created by <a href="https://one.nocturnailed.com/" target="_blank" class="text-decoration-none text-muted fw-bold">one.nocturnailed.com</a>
          </div>
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
const isSidebarOpen = ref(false)
const { isConnected, connectionMode, connectionStatus, initMqtt } = useMqtt()

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
  const statusMap: Record<string, string> = {
    connected: 'IoT: Terhubung',
    connecting: 'IoT: Menghubungkan',
    reconnecting: 'IoT: Rekoneksi',
    disconnected: 'IoT: Terputus',
    error: 'IoT: Kesalahan',
    offline: 'IoT: Offline'
  }
  
  const currentStatus = statusMap[connectionStatus.value] || 'IoT: Standby'
  if (connectionMode.value === 'fallback') {
    return `Mode Simulasi (${currentStatus})`
  }
  return currentStatus
})


onMounted(() => {
  initMqtt()
})
</script>
