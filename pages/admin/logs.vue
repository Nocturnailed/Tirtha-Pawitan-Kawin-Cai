<template>
  <div class="admin-page container-fluid py-4">
    <div class="header-section mb-4">
      <h1 class="page-title">Sistem <span class="text-primary">Logs</span></h1>
      <p class="text-muted mb-0">Pantau seluruh aktivitas audit trail, pesan MQTT, dan metrik sistem secara real-time.</p>
    </div>

    <!-- Tabs Header -->
    <div class="glass-card mb-4 p-2 d-inline-flex gap-2">
      <button 
        v-for="tab in tabs" :key="tab.id"
        @click="activeTab = tab.id"
        :class="['btn btn-tab', activeTab === tab.id ? 'active' : '']"
      >
        <i :class="tab.icon"></i> {{ tab.label }}
      </button>
    </div>

    <!-- Audit Logs Table -->
    <div v-if="activeTab === 'audit'" class="glass-card table-card animate-fade-in">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Pengguna</th>
                <th>Aksi</th>
                <th>Resource</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in auditLogs" :key="log.id">
                <td class="text-nowrap">{{ formatFullDate(log.created_at) }}</td>
                <td>
                  <span v-if="log.user" class="fw-bold">{{ log.user.full_name }}</span>
                  <span v-else class="text-muted">System</span>
                </td>
                <td><span class="badge bg-primary-soft text-primary">{{ log.action }}</span></td>
                <td><code>{{ log.resource }} #{{ log.resource_id }}</code></td>
                <td><small class="text-muted">{{ log.details }}</small></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MQTT Logs Table -->
    <div v-if="activeTab === 'mqtt'" class="glass-card table-card animate-fade-in">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Topic</th>
                <th>Payload</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="msg in mqttLogs" :key="msg.id">
                <td class="text-nowrap">{{ formatFullDate(msg.created_at) }}</td>
                <td><code>{{ msg.topic }}</code></td>
                <td><pre class="mb-0 text-info" style="font-size: 11px;">{{ JSON.stringify(msg.payload, null, 2) }}</pre></td>
                <td>
                  <span v-if="msg.simulated" class="badge bg-warning-soft">SIMULATED</span>
                  <span v-else class="badge bg-success-soft">REALTIME</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Metrics Logs Table -->
    <div v-if="activeTab === 'metrics'" class="glass-card table-card animate-fade-in">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Tipe Metrik</th>
                <th>Nilai</th>
                <th>Sumber</th>
                <th>Meta</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="metric in metrics" :key="metric.id">
                <td class="text-nowrap">{{ formatFullDate(metric.recorded_at) }}</td>
                <td><span class="badge bg-info-soft text-info">{{ metric.type }}</span></td>
                <td class="fw-bold">{{ metric.value }} {{ metric.unit }}</td>
                <td>{{ metric.source }}</td>
                <td><small class="text-muted">{{ metric.meta }}</small></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const activeTab = ref('audit')
const loading = ref(true)
const auditLogs = ref([])
const mqttLogs = ref([])
const metrics = ref([])

const tabs = [
  { id: 'audit', label: 'Audit Trail', icon: 'bi bi-shield-check' },
  { id: 'mqtt', label: 'MQTT Traffic', icon: 'bi bi-broadcast' },
  { id: 'metrics', label: 'System Metrics', icon: 'bi bi-graph-up' }
]

const fetchData = async () => {
  loading.value = true
  try {
    const [audit, mqtt, sys] = await Promise.all([
      $fetch('/api/logs/audit'),
      $fetch('/api/logs/mqtt'),
      $fetch('/api/logs/metrics')
    ])
    auditLogs.value = audit
    mqttLogs.value = mqtt
    metrics.value = sys
  } catch (err) {
    console.error('Fetch logs error:', err)
  } finally {
    loading.value = false
  }
}

const formatFullDate = (date) => {
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

onMounted(fetchData)

// Refresh data when switching tabs might be good
watch(activeTab, () => {
  // fetchData() // Uncomment to auto-refresh on tab change
})
</script>

<style scoped>
.admin-page { min-height: 100vh; background: #0f172a; }
.page-title { color: #f8fafc; font-weight: 800; letter-spacing: -1px; }

.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.btn-tab {
  padding: 8px 16px;
  border-radius: 10px;
  color: #94a3b8;
  border: none;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-tab:hover { background: rgba(255, 255, 255, 0.05); color: #f8fafc; }
.btn-tab.active { background: #38bdf8; color: white; box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3); }

.table { color: #cbd5e1; font-size: 14px; }
.table thead th { background: rgba(255, 255, 255, 0.02); color: #94a3b8; padding: 16px; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.table tbody td { padding: 14px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); vertical-align: middle; }

code { background: rgba(15, 23, 42, 0.5); padding: 4px 8px; border-radius: 6px; color: #38bdf8; }

.badge { padding: 5px 10px; border-radius: 6px; font-weight: 600; font-size: 11px; }
.bg-primary-soft { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
.bg-info-soft { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }
.bg-warning-soft { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }
.bg-success-soft { background: rgba(52, 211, 153, 0.1); color: #34d399; }

.animate-fade-in { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
