<template>
  <div class="admin-page container-fluid py-4">
    <div class="header-section mb-4">
      <h1 class="page-title">Konfigurasi <span class="text-primary">MQTT Broker</span></h1>
      <p class="text-muted">Atur koneksi transmisi data dari ESP32 ke sistem dashboard.</p>
    </div>

    <div class="row g-4">
      <!-- Connection Form -->
      <div class="col-lg-5">
        <div class="glass-card h-100 animate-fade-in">
          <div class="card-header border-0 bg-transparent pt-4 px-4">
            <h5 class="fw-bold mb-0"><i class="bi bi-gear-fill me-2 text-primary"></i>Koneksi Broker</h5>
          </div>
          <div class="card-body p-4">
            <form @submit.prevent="saveConfig">
              <div class="mb-3">
                <label class="form-label">Host / Endpoint</label>
                <input v-model="form.host" type="text" class="form-control" placeholder="public.cloud.shiftr.io" required />
              </div>
              <div class="row">
                <div class="col-md-7 mb-3">
                  <label class="form-label">Port</label>
                  <input v-model.number="form.port" type="number" class="form-control" placeholder="443" required />
                </div>
                <div class="col-md-5 mb-3">
                  <label class="form-label">SSL (WSS)</label>
                  <div class="form-check form-switch mt-2">
                    <input v-model="form.useSsl" class="form-check-input" type="checkbox" id="sslSwitch" />
                    <label class="form-check-label" for="sslSwitch">{{ form.useSsl ? 'Aktif' : 'Non-Aktif' }}</label>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Client ID</label>
                <input v-model="form.clientId" type="text" class="form-control" required />
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Username</label>
                  <input v-model="form.username" type="text" class="form-control" />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Password</label>
                  <input v-model="form.password" type="password" class="form-control" />
                </div>
              </div>
              <hr class="my-4 opacity-50" />
              <div class="d-grid">
                <button type="submit" class="btn btn-primary rounded-pill py-2 fw-bold" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                  {{ saving ? 'Menyimpan...' : 'Simpan & Hubungkan' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Live Stream / Debugger -->
      <div class="col-lg-7">
        <div class="glass-card h-100 animate-fade-in d-flex flex-column">
          <div class="card-header border-0 bg-transparent pt-4 px-4 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold mb-0"><i class="bi bi-broadcast me-2 text-primary"></i>Aliran Data Live</h5>
            <span :class="['status-badge', connected ? 'connected' : 'disconnected']">
              <i :class="connected ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
              {{ connected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
          <div class="card-body p-4 flex-grow-1 d-flex flex-column">
             <div class="debug-controls mb-3 p-3 rounded-4 bg-dark-soft d-flex gap-2">
                <input v-model="subscribeTopic" type="text" class="form-control form-control-sm" placeholder="Topik (ex: sensor/#)" />
                <button @click="subscribe" class="btn btn-primary btn-sm rounded-pill px-3">Subscribe</button>
                <button @click="messages = []" class="btn btn-outline-secondary btn-sm rounded-pill px-3">Clear</button>
             </div>
             
             <div class="terminal-view flex-grow-1 p-3 rounded-4 bg-dark text-light font-monospace small overflow-auto" ref="terminal">
                <div v-if="messages.length === 0" class="text-muted italic opacity-50">Menunggu transmisi data IoT...</div>
                <div v-for="(msg, i) in messages" :key="i" class="mb-1">
                   <span class="text-success">[{{ msg.time }}]</span>
                   <span class="text-info mx-2">{{ msg.topic }}</span>
                   <span class="text-warning">→</span>
                   <span class="ms-2">{{ msg.payload }}</span>
                </div>
             </div>

             <div class="mt-3 p-3 rounded-4 bg-primary-soft">
                <div class="d-flex gap-2">
                   <input v-model="publishData.topic" class="form-control form-control-sm" placeholder="Publish ke topik..." />
                   <input v-model="publishData.message" class="form-control form-control-sm" placeholder="Pesan..." />
                   <button @click="publish" class="btn btn-primary btn-sm px-4 rounded-pill">Kirim</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import mqtt from 'mqtt'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const form = ref({
  host: '', port: 443, clientId: '', username: '', password: '', useSsl: true
})
const saving = ref(false)
const connected = ref(false)
const messages = ref([])
const subscribeTopic = ref('tirtha-pawitan/sensor/+')
const publishData = ref({ topic: '', message: '' })
const terminal = ref(null)

let client = null

const fetchData = async () => {
  try {
    const config = await $fetch('/api/config/mqtt')
    form.value = config
    // Auto-connect if possible
    connectMqtt()
  } catch (err) { console.error(err) }
}

const saveConfig = async () => {
  saving.value = true
  try {
    await $fetch('/api/config/mqtt', { method: 'POST', body: form.value })
    alert('Konfigurasi berhasil disimpan!')
    connectMqtt()
  } catch (err) {
    alert('Gagal menyimpan konfigurasi')
  } finally {
    saving.value = false
  }
}

const connectMqtt = () => {
  if (client) client.end()

  const protocol = form.value.useSsl ? 'wss' : 'ws'
  const url = `${protocol}://${form.value.host}:${form.value.port}`
  
  if (!form.value.host) return

  client = mqtt.connect(url, {
    clientId: form.value.clientId,
    username: form.value.username,
    password: form.value.password,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  })

  client.on('connect', () => {
    connected.value = true
    client.subscribe(subscribeTopic.value)
  })

  client.on('message', (topic, payload) => {
    messages.value.unshift({
      time: new Date().toLocaleTimeString(),
      topic,
      payload: payload.toString()
    })
    if (messages.value.length > 100) messages.value.pop()
  })

  client.on('close', () => { connected.value = false })
  client.on('error', (err) => { console.error('MQTT Error:', err) })
}

const subscribe = () => {
  if (client && connected.value) {
    client.subscribe(subscribeTopic.value)
  }
}

const publish = () => {
  if (client && connected.value && publishData.value.topic) {
    client.publish(publishData.value.topic, publishData.value.message)
    publishData.value.message = ''
  }
}

onMounted(fetchData)
onUnmounted(() => { if (client) client.end() })
</script>

<style scoped>
.admin-page { min-height: 100vh; }
.page-title { color: var(--text); font-weight: 800; letter-spacing: -1px; }

.glass-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); }

.status-badge { padding: 6px 12px; border-radius: 100px; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 6px; }
.status-badge.connected { background: var(--success-soft); color: var(--success); }
.status-badge.disconnected { background: var(--danger-soft); color: var(--danger); }

.terminal-view { min-height: 300px; border: 1px solid var(--border); overflow-y: auto; scrollbar-width: thin; }
.bg-dark { background: #0f172a !important; }
.bg-dark-soft { background: var(--bg); border: 1px solid var(--border); }

.form-label { color: var(--text-sub); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
.form-control { background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 12px; padding: 12px; }
.form-control:focus { background: var(--bg); border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }

.animate-fade-in { animation: fadeIn 0.5s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
