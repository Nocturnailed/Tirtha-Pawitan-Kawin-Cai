<template>
  <div class="admin-page container-fluid py-4">
    <div class="header-section mb-4 d-flex justify-content-between align-items-center">
      <div>
        <h1 class="page-title">Management <span class="text-primary">Titik Air</span></h1>
        <p class="text-muted mb-0">Kelola data sumber air, koordinat GIS, dan ambang batas IoT.</p>
      </div>
      <button class="btn btn-primary" @click="openModal('create')">
        <i class="bi bi-plus-lg me-2"></i>Tambah Titik
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="row mb-4">
      <div class="col-md-3" v-for="stat in statsCards" :key="stat.title">
        <div class="stat-card glass-card">
          <div class="stat-icon" :style="{ background: stat.bg }">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-info">
            <p class="stat-label">{{ stat.title }}</p>
            <h3 class="stat-value">{{ stat.value }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="glass-card table-card animate-fade-in">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Nama Titik</th>
                <th>Wilayah</th>
                <th>Debit (L/s)</th>
                <th>Status</th>
                <th>AI Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="point in waterPoints" :key="point.id">
                <td class="fw-bold">{{ point.name }}</td>
                <td>{{ point.district }}</td>
                <td>{{ point.debit }}</td>
                <td>
                  <span :class="getStatusBadgeClass(point.status)">
                    {{ point.status }}
                  </span>
                </td>
                <td>
                  <span v-if="point.isAnomaly" class="badge bg-danger-soft">
                    <i class="bi bi-lightning-fill me-1"></i>Anomali
                  </span>
                  <span v-else class="badge bg-success-soft">Normal</span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-icon" @click="openModal('edit', point)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-icon text-danger" @click="confirmDelete(point)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="6" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Management Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content glass-card animate-zoom">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title">{{ modalType === 'create' ? 'Tambah Titik Air' : 'Edit Titik Air' }}</h5>
          <button class="btn-close btn-close-white" @click="showModal = false"></button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body py-4">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Nama Titik</label>
                <input v-model="form.name" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Wilayah</label>
                <input v-model="form.district" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Latitude</label>
                <input v-model="form.lat" type="number" step="any" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Longitude</label>
                <input v-model="form.lng" type="number" step="any" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Topic IoT</label>
                <input v-model="form.topic" type="text" class="form-control" placeholder="tirtha/point-001" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Status Awal</label>
                <select v-model="form.status" class="form-select">
                  <option value="Layak/Aman">Layak/Aman</option>
                  <option value="Butuh Konservasi">Butuh Konservasi</option>
                  <option value="Kritis">Kritis</option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label">Deskripsi</label>
                <textarea v-model="form.description" class="form-control" rows="3"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary" @click="showModal = false">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const waterPoints = ref([])
const loading = ref(true)
const showModal = ref(false)
const modalType = ref('create')
const submitting = ref(false)
const stats = ref({ total: 0, layak: 0, kritis: 0 })

const form = ref({
  id: null,
  name: '',
  district: '',
  lat: '',
  lng: '',
  topic: '',
  status: 'Layak/Aman',
  description: ''
})

const statsCards = computed(() => [
  { title: 'Total Titik', value: stats.value.total, icon: 'bi bi-geo-fill', bg: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' },
  { title: 'Kondisi Aman', value: stats.value.layak, icon: 'bi bi-check-circle-fill', bg: 'linear-gradient(135deg, #34d399, #10b981)' },
  { title: 'Kondisi Kritis', value: stats.value.kritis, icon: 'bi bi-exclamation-triangle-fill', bg: 'linear-gradient(135deg, #fb7185, #f43f5e)' },
  { title: 'Sistem AI', value: 'Active', icon: 'bi bi-cpu-fill', bg: 'linear-gradient(135deg, #818cf8, #6366f1)' }
])

const fetchData = async () => {
  loading.value = true
  try {
    const [points, statsData] = await Promise.all([
      $fetch('/api/water-points'),
      $fetch('/api/water-points/stats')
    ])
    waterPoints.value = points
    stats.value = {
      total: statsData.totalCount,
      layak: statsData.layakCount,
      kritis: statsData.kritisCount
    }
  } catch (err) {
    console.error('Fetch error:', err)
  } finally {
    loading.value = false
  }
}

const openModal = (type, data = null) => {
  modalType.value = type
  if (data) {
    form.value = { ...data }
  } else {
    form.value = {
      id: null,
      name: '',
      district: '',
      lat: '',
      lng: '',
      topic: '',
      status: 'Layak/Aman',
      description: ''
    }
  }
  showModal.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (modalType.value === 'create') {
      await $fetch('/api/water-points', {
        method: 'POST',
        body: form.value
      })
    } else {
      await $fetch(`/api/water-points/${form.value.id}`, {
        method: 'PATCH',
        body: form.value
      })
    }
    showModal.value = false
    await fetchData()
  } catch (err) {
    alert(err.data?.statusMessage || 'Gagal menyimpan data')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (point) => {
  if (confirm(`Apakah Anda yakin ingin menghapus ${point.name}?`)) {
    try {
      await $fetch(`/api/water-points/${point.id}`, { method: 'DELETE' })
      await fetchData()
    } catch (err) {
      alert('Gagal menghapus data')
    }
  }
}

const getStatusBadgeClass = (status) => {
  if (status === 'Layak/Aman') return 'badge bg-success-soft'
  if (status === 'Kritis') return 'badge bg-danger-soft'
  return 'badge bg-warning-soft'
}

onMounted(fetchData)
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #0f172a;
}

.page-title {
  color: #f8fafc;
  font-weight: 800;
  letter-spacing: -1px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.stat-label {
  color: #94a3b8;
  font-size: 13px;
  margin: 0;
}

.stat-value {
  color: #f8fafc;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.table {
  color: #cbd5e1;
}

.table thead th {
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 2px solid rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 16px;
}

.table tbody td {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
}

.table-hover tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
}

.bg-success-soft { background: rgba(52, 211, 153, 0.1); color: #34d399; }
.bg-danger-soft { background: rgba(251, 113, 133, 0.1); color: #fb7185; }
.bg-warning-soft { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }

.btn-icon {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  border-radius: 10px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  width: 600px;
  max-width: 95%;
  background: #1e293b;
}

.form-label {
  color: #94a3b8;
  font-size: 13px;
}

.form-control, .form-select {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 10px;
}

.form-control:focus, .form-select:focus {
  background: rgba(15, 23, 42, 0.8);
  border-color: #38bdf8;
  color: white;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}

/* Animations */
.animate-fade-in { animation: fadeIn 0.5s ease; }
.animate-zoom { animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoom { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
</style>
