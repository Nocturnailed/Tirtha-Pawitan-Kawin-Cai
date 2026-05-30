<template>
  <div class="container-fluid">
    <div class="card custom-card p-4">
      <div class="row g-3 justify-content-between align-items-center mb-4">
        <div class="col-md-5">
          <div class="input-group">
            <span class="input-group-text bg-transparent border-end-0 text-muted"><i class="bi bi-search"></i></span>
            <input v-model="searchQuery" type="text" class="form-control border-start-0" placeholder="Cari berdasarkan nama atau kecamatan...">
          </div>
        </div>
        <div class="col-md-4">
          <div class="d-flex gap-2 align-items-center">
            <label class="text-nowrap text-secondary mb-0 fw-semibold" style="font-size: 0.85rem;">Status Kelayakan:</label>
            <select v-model="statusFilter" class="form-select">
              <option value="">Semua Status</option>
              <option value="Layak/Aman">Layak/Aman</option>
              <option value="Butuh Konservasi">Butuh Konservasi</option>
              <option value="Kritis">Kritis</option>
            </select>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light text-secondary">
            <tr>
              <th>Nama Mata Air</th>
              <th>Kecamatan</th>
              <th>Koordinat (Lat, Lng)</th>
              <th>Debit Air</th>
              <th>Status</th>
              <th>Sistem Pembaruan</th>
              <th class="text-center">Navigasi & Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredPoints.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">
                <i class="bi bi-database-exclamation fs-3 d-block mb-1"></i> Tidak ditemukan data matching
              </td>
            </tr>
            <tr v-for="point in filteredPoints" :key="point.id">
              <td><strong>{{ point.name }}</strong></td>
              <td>{{ point.district }}</td>
              <td><span class="badge bg-light text-secondary font-monospace" style="font-size:0.75rem;">{{ point.lat.toFixed(5) }}, {{ point.lng.toFixed(5) }}</span></td>
              <td><strong class="text-primary">{{ point.debit }}</strong> <span class="small text-muted">L/s</span></td>
              <td>
                <span :class="getStatusBadgeClass(point.status)" class="badge rounded-pill">{{ point.status }}</span>
              </td>
              <td>
                <span v-if="point.source === 'Sistem IoT'" class="badge bg-primary bg-opacity-10 text-primary">
                  <i class="bi bi-cpu"></i> IoT Live
                </span>
                <span v-else class="badge bg-secondary bg-opacity-10 text-secondary">
                  <i class="bi bi-person"></i> Petugas
                </span>
              </td>
              <td class="text-center">
                <div class="btn-group gap-1">
                  <button class="btn btn-sm btn-outline-primary rounded" @click="navigateToPoint(point)">
                    <i class="bi bi-geo-alt-fill"></i> Fokus
                  </button>
                  <button class="btn btn-sm btn-outline-danger rounded" @click="deletePoint(point.id)">
                    <i class="bi bi-trash3-fill"></i> Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWaterPointStore } from '~/stores/waterPointStore'
import { useNotification } from '~/composables/useNotification'

const waterPointStore = useWaterPointStore()
const { success, error } = useNotification()

const searchQuery = ref('')
const statusFilter = ref('')

const filteredPoints = computed(() => {
  return waterPointStore.searchPoints(searchQuery.value, statusFilter.value || undefined)
})

const getStatusBadgeClass = (status: string) => {
  if (status === 'Layak/Aman') return 'bg-success bg-opacity-10 text-success'
  if (status === 'Butuh Konservasi') return 'bg-warning bg-opacity-10 text-warning'
  return 'bg-danger bg-opacity-10 text-danger'
}

const deletePoint = async (id: number) => {
  if (confirm('Apakah Anda yakin ingin menghapus titik air ini?')) {
    try {
      await waterPointStore.deletePoint(id)
      success('Sumber air berhasil dihapus dari sistem.')
    } catch (err: any) {
      error(err.message || 'Gagal menghapus titik air')
    }
  }
}

const navigateToPoint = (point: any) => {
  // Navigate to GIS map page
  navigateTo(`/gis-map?lat=${point.lat}&lng=${point.lng}`)
}

onMounted(async () => {
  await waterPointStore.fetchPoints()
})
</script>
