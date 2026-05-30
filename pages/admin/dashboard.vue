<template>
  <div class="admin-page p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">Admin Dashboard</h2>
        <p class="text-muted mb-0">Ringkasan kondisi monitoring titik mata air</p>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="row g-4 mb-4">
      <div class="col-md-6 col-lg-3">
        <div class="card custom-card p-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted text-uppercase tracking-wider fw-bold" style="font-size: 0.7rem;">Titik Air Terdaftar</span>
              <h3 class="fw-bold mt-2 mb-0">{{ stats.total }}</h3>
            </div>
            <div class="p-3 bg-primary bg-opacity-10 rounded-3 text-primary">
              <i class="bi bi-geo-alt fs-3"></i>
            </div>
          </div>
          <div class="mt-3 text-muted" style="font-size: 0.8rem;">Tersebar di Kabupaten Kuningan</div>
        </div>
      </div>
      <div class="col-md-6 col-lg-3">
        <div class="card custom-card p-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted text-uppercase tracking-wider fw-bold" style="font-size: 0.7rem;">Rata-rata Debit</span>
              <h3 class="fw-bold mt-2 mb-0">{{ stats.averageDebit?.toFixed(1) || 0 }} L/s</h3>
            </div>
            <div class="p-3 bg-info bg-opacity-10 rounded-3 text-info">
              <i class="bi bi-water fs-3"></i>
            </div>
          </div>
          <div class="mt-3 text-muted" style="font-size: 0.8rem;">Indikator keberlanjutan air</div>
        </div>
      </div>
      <div class="col-md-6 col-lg-3">
        <div class="card custom-card p-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted text-uppercase tracking-wider fw-bold" style="font-size: 0.7rem;">Kondisi Layak</span>
              <h3 class="fw-bold mt-2 mb-0 text-success">{{ stats.layakCount }}</h3>
            </div>
            <div class="p-3 bg-success bg-opacity-10 rounded-3 text-success">
              <i class="bi bi-shield-check fs-3"></i>
            </div>
          </div>
          <div class="mt-3 text-success" style="font-size: 0.8rem;">Aman digunakan masyarakat</div>
        </div>
      </div>
      <div class="col-md-6 col-lg-3">
        <div class="card custom-card p-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted text-uppercase tracking-wider fw-bold" style="font-size: 0.7rem;">Perlu Konservasi</span>
              <h3 class="fw-bold mt-2 mb-0 text-danger">{{ stats.kritisCount }}</h3>
            </div>
            <div class="p-3 bg-danger bg-opacity-10 rounded-3 text-danger">
              <i class="bi bi-exclamation-triangle fs-3"></i>
            </div>
          </div>
          <div class="mt-3 text-danger" style="font-size: 0.8rem;">Butuh atensi segera</div>
        </div>
      </div>
    </div>

    <!-- Recent Water Points Table -->
    <div class="card custom-card">
      <div class="card-header bg-transparent border-0 p-4 pb-0">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Data Titik Air Terbaru</h5>
          <NuxtLink to="/admin/water-points" class="btn btn-sm btn-outline-primary rounded-pill">
            Lihat Semua <i class="bi bi-arrow-right ms-1"></i>
          </NuxtLink>
        </div>
      </div>
      <div class="card-body p-4">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Wilayah</th>
                <th>Debit (L/s)</th>
                <th>Status</th>
                <th>Sumber Data</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="point in recentPoints" :key="point.id">
                <td class="fw-semibold">{{ point.name }}</td>
                <td>{{ point.district }}</td>
                <td>{{ point.debit }}</td>
                <td>
                  <span :class="statusBadge(point.status)">{{ point.status }}</span>
                </td>
                <td><span class="text-muted small">{{ point.source }}</span></td>
              </tr>
              <tr v-if="loading">
                <td colspan="5" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-primary"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const loading = ref(true)
const recentPoints = ref([])
const stats = ref({ total: 0, layakCount: 0, kritisCount: 0, averageDebit: 0 })

const statusBadge = (status) => {
  if (status === 'Layak/Aman') return 'badge bg-success bg-opacity-10 text-success'
  if (status === 'Kritis') return 'badge bg-danger bg-opacity-10 text-danger'
  return 'badge bg-warning bg-opacity-10 text-warning'
}

onMounted(async () => {
  try {
    const [points, statsData] = await Promise.all([
      $fetch('/api/water-points'),
      $fetch('/api/water-points/stats')
    ])
    recentPoints.value = points.slice(0, 8)
    stats.value = statsData
  } catch (err) {
    console.error('Dashboard fetch error:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.admin-page {
  background: #0f172a;
  min-height: 100vh;
  color: #f8fafc;
}

.custom-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.table { color: #cbd5e1; }
.table thead th {
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 2px solid rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .5px;
  padding: 14px 16px;
}
.table tbody td {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  vertical-align: middle;
}
.table-hover tbody tr:hover { background: rgba(255, 255, 255, 0.04); }
.badge { padding: 5px 12px; border-radius: 8px; font-weight: 600; font-size: 12px; }
</style>
