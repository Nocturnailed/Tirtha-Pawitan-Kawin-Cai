<template>
  <div class="dashboard-page">
    <div class="dashboard-header mb-5">
      <h2 class="fw-bold mb-1">Dashboard Administrasi</h2>
      <p class="text-muted mb-0">Ringkasan kondisi monitoring titik mata air Kabupaten Kuningan.</p>
    </div>

    <!-- Stat Cards -->
    <div class="row g-4 mb-5">
      <div class="col-md-6 col-lg-3" v-for="(stat, idx) in statCards" :key="idx">
        <div class="stat-card">
          <div class="stat-icon" :class="stat.color">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ stat.label }}</span>
            <h3 class="stat-value">{{ stat.value }}</h3>
            <p class="stat-desc">{{ stat.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Water Points Table -->
    <div class="dashboard-card">
      <div class="card-header-styled">
        <div class="d-flex justify-content-between align-items-center w-100">
          <h5 class="fw-bold mb-0">Data Titik Air Terbaru</h5>
          <NuxtLink to="/admin/water-points" class="btn-view-all">
            Lihat Semua <i class="bi bi-arrow-right ms-1"></i>
          </NuxtLink>
        </div>
      </div>
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Titik Mata Air</th>
              <th>Kecamatan</th>
              <th>Debit (L/s)</th>
              <th class="text-center">Status</th>
              <th>Terakhir Diperbarui</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="point in recentPoints" :key="point.id">
              <td>
                <div class="d-flex align-items-center gap-3">
                  <div class="point-dot" :class="statusClass(point.status)"></div>
                  <span class="fw-bold">{{ point.name }}</span>
                </div>
              </td>
              <td>{{ point.district }}</td>
              <td class="fw-bold">{{ point.debit }}</td>
              <td class="text-center">
                <span :class="['badge-custom', statusClass(point.status)]">{{ point.status }}</span>
              </td>
              <td><span class="text-muted small">{{ formatDate(point.updated_at) }}</span></td>
            </tr>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-5">
                <div class="spinner-border spinner-border-sm text-primary"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: ['auth'] })

const loading = ref(true)
const recentPoints = ref([])
const stats = ref({ total: 0, layakCount: 0, kritisCount: 0, averageDebit: 0 })

const statCards = computed(() => [
  { label: 'Total Titik Air', value: stats.value.total, icon: 'bi bi-geo-alt', color: 'primary', desc: 'Sesuai database' },
  { label: 'Debit Rata-rata', value: (stats.value.averageDebit || 0).toFixed(1) + ' L/s', icon: 'bi bi-droplet', color: 'info', desc: 'Indikator stabilitas' },
  { label: 'Status Layak', value: stats.value.layakCount, icon: 'bi bi-shield-check', color: 'success', desc: 'Kondisi aman' },
  { label: 'Perlu Atensi', value: stats.value.kritisCount, icon: 'bi bi-exclamation-triangle', color: 'danger', desc: 'Status kritis' }
])

const statusClass = (status) => {
  if (status === 'Layak/Aman') return 'success'
  if (status === 'Kritis') return 'danger'
  return 'warning'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  try {
    const [points, statsData] = await Promise.all([
      $fetch('/api/water-points'),
      $fetch('/api/water-points/stats')
    ])
    recentPoints.value = points.slice(0, 7)
    stats.value = statsData
  } catch (err) { console.error(err) }
  finally { loading.value = false }
})
</script>

<style scoped>
.dashboard-page { padding: 4px; }
.dashboard-header h2 { font-size: 24px; letter-spacing: -0.5px; }

.stat-card {
  background: var(--card-bg); border: 1px solid var(--border); border-radius: 20px;
  padding: 24px; display: flex; gap: 20px; align-items: flex-start;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: transform .3s;
}
.stat-card:hover { transform: translateY(-4px); }
.stat-icon {
  width: 54px; height: 54px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px;
}
.stat-icon.primary { background: rgba(14,165,233,.1); color: #0ea5e9; }
.stat-icon.info { background: rgba(6,182,212,.1); color: #06b6d4; }
.stat-icon.success { background: rgba(16,185,129,.1); color: #10b981; }
.stat-icon.danger { background: rgba(239,68,68,.1); color: #ef4444; }

.stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-sub); letter-spacing: .5px; }
.stat-value { font-size: 22px; font-weight: 800; margin: 4px 0; }
.stat-desc { font-size: 12px; color: var(--text-sub); margin: 0; }

.dashboard-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 24px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.card-header-styled { padding: 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; }
.btn-view-all { font-size: 13px; font-weight: 700; text-decoration: none; color: var(--primary); padding: 8px 16px; border-radius: 100px; border: 1px solid var(--primary); transition: all .2s; }
.btn-view-all:hover { background: var(--primary); color: white; }

.table-container { width: 100%; overflow-x: auto; }
.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { padding: 18px 24px; background: rgba(120, 120, 120, 0.02); text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .8px; color: var(--text-sub); border-bottom: 1px solid var(--border); }
.custom-table td { padding: 18px 24px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: middle; }
.custom-table tr:last-child td { border-bottom: none; }

.point-dot { width: 8px; height: 8px; border-radius: 50%; }
.point-dot.success { background: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,.1); }
.point-dot.warning { background: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,.1); }
.point-dot.danger { background: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.1); }

.badge-custom { padding: 6px 14px; border-radius: 100px; font-size: 11px; font-weight: 700; display: inline-block; }
.badge-custom.success { background: rgba(16,185,129,.1); color: #10b981; }
.badge-custom.warning { background: rgba(245,158,11,.1); color: #f59e0b; }
.badge-custom.danger { background: rgba(239,68,68,.1); color: #ef4444; }

@media (max-width: 991px) {
  .main-content { padding: 24px; }
  .stat-card { flex-direction: column; gap: 12px; }
}
</style>
