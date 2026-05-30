<template>
  <div class="admin-page-gis">
    <div class="gis-header p-4 d-flex justify-content-between align-items-center">
      <div>
        <h2 class="fw-bold mb-1">Peta Monitoring Geospasial</h2>
        <p class="text-muted mb-0">Visualisasi sebaran titik mata air dan status IoT terkini.</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary rounded-pill btn-sm" @click="fetchPoints">
          <i class="bi bi-arrow-clockwise me-1"></i> Refresh Data
        </button>
      </div>
    </div>

    <div class="map-container-full">
      <ClientOnly>
        <!-- Injected Layout Theme -->
        <GisMapAdmin 
          :theme="layoutTheme" 
          :points="points" 
          @select-point="handleSelectPoint" 
        />
      </ClientOnly>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedPoint" class="modal-overlay" @click.self="selectedPoint = null">
      <div class="detail-modal animate-zoom">
        <div class="modal-header-custom">
          <div class="title-with-badge">
            <h5>{{ selectedPoint.name }}</h5>
            <span :class="['badge-status', statusClass(selectedPoint.status)]">{{ selectedPoint.status }}</span>
          </div>
          <button @click="selectedPoint = null" class="btn-close-modal"><i class="bi bi-x-lg"></i></button>
        </div>

        <div class="modal-body-custom">
          <div class="row g-4">
            <div class="col-md-7">
              <div class="info-group">
                <label>Kecamatan / Wilayah</label>
                <p>{{ selectedPoint.district }}</p>
              </div>
              <div class="info-group">
                <label>Keterangan & Deskripsi</label>
                <p>{{ selectedPoint.description || 'Tidak ada deskripsi tambahan.' }}</p>
              </div>
              <div class="row">
                <div class="col-6">
                  <div class="info-group">
                    <label>Koordinat Latitude</label>
                    <p><code>{{ selectedPoint.lat }}</code></p>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-group">
                    <label>Koordinat Longitude</label>
                    <p><code>{{ selectedPoint.lng }}</code></p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-5">
              <div class="iot-card p-3">
                <div class="iot-header mb-3">
                  <i class="bi bi-cpu-fill"></i>
                  <span>Data Sensor AIoT</span>
                </div>
                <div class="iot-stats">
                  <div class="stat-item">
                    <span>Debit Terkini</span>
                    <strong>{{ selectedPoint.debit }} L/s</strong>
                  </div>
                  <div class="stat-item">
                    <span>MQTT Topic</span>
                    <code>{{ selectedPoint.topic }}</code>
                  </div>
                  <div class="stat-item">
                    <span>Sumber Data</span>
                    <small>{{ selectedPoint.source }}</small>
                  </div>
                </div>
                <hr />
                <div class="d-grid mt-3">
                  <NuxtLink :to="`/admin/water-points`" class="btn btn-primary btn-sm rounded-pill">
                    Kelola Titik <i class="bi bi-pencil-square ms-1"></i>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: ['auth'] })

const points = ref([])
const selectedPoint = ref(null)
const layoutTheme = ref('light')

// Try to grab theme from parent/layout if possible, or just default
// Since we can't easily access layout ref from page, we'll watch DOM or use a simple toggle here
// But usually, admin layout will handle the body class.

const fetchPoints = async () => {
  try {
    points.value = await $fetch('/api/water-points')
  } catch (err) { console.error(err) }
}

const handleSelectPoint = (point) => {
  selectedPoint.value = point
}

const statusClass = (status) => {
  if (status === 'Layak/Aman') return 'success'
  if (status === 'Kritis') return 'danger'
  return 'warning'
}

onMounted(() => {
  fetchPoints()
  // Simple check for dark mode from parent
  const checkTheme = () => {
    const layout = document.querySelector('.admin-layout')
    if (layout) layoutTheme.value = layout.classList.contains('dark') ? 'dark' : 'light'
  }
  checkTheme()
  const observer = new MutationObserver(checkTheme)
  const layout = document.querySelector('.admin-layout')
  if (layout) observer.observe(layout, { attributes: true, attributeFilter: ['class'] })
})
</script>

<style scoped>
.admin-page-gis { display: flex; flex-direction: column; height: calc(100vh - 40px); }
.map-container-full { flex: 1; min-height: 0; background: var(--bg); border: 1px solid var(--border); border-radius: 24px; overflow: hidden; margin: 0 24px 24px; position: relative; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(8px); }
.detail-modal { width: 800px; max-width: 95%; background: var(--card-bg); border-radius: 28px; border: 1px solid var(--border); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; }

.modal-header-custom { padding: 24px 32px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
.title-with-badge { display: flex; align-items: center; gap: 16px; }
.title-with-badge h5 { margin: 0; font-weight: 800; font-size: 20px; color: var(--text); }

.badge-status { padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
.badge-status.success { background: var(--success-soft); color: var(--success); }
.badge-status.warning { background: var(--warning-soft); color: var(--warning); }
.badge-status.danger { background: var(--danger-soft); color: var(--danger); }

.btn-close-modal { background: var(--bg); border: 1px solid var(--border); width: 36px; height: 36px; border-radius: 12px; color: var(--text-sub); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.btn-close-modal:hover { background: var(--danger-soft); color: var(--danger); border-color: var(--danger); }

.modal-body-custom { padding: 32px; }

.info-group { margin-bottom: 24px; }
.info-group label { display: block; font-size: 12px; font-weight: 700; color: var(--text-sub); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.info-group p { font-size: 15px; color: var(--text); margin: 0; line-height: 1.6; font-weight: 500; }
.info-group code { background: var(--bg); padding: 4px 8px; border-radius: 6px; color: var(--primary); border: 1px solid var(--border); }

.iot-card { background: var(--bg); border: 1px solid var(--border); border-radius: 20px; }
.iot-header { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 14px; color: var(--primary); }
.iot-stats { display: flex; flex-direction: column; gap: 16px; }
.stat-item { display: flex; flex-direction: column; }
.stat-item span { font-size: 11px; color: var(--text-sub); font-weight: 600; margin-bottom: 2px; }
.stat-item strong { font-size: 18px; color: var(--text); font-weight: 800; }
.stat-item code { align-self: flex-start; margin-top: 4px; }

.animate-zoom { animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes zoom { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }

@media (max-width: 768px) {
  .admin-page-gis { height: auto; }
  .map-container-full { margin: 12px; height: 500px; }
  .modal-body-custom { padding: 24px; }
}
</style>
