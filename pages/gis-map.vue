<template>
  <div class="container-fluid p-1 p-md-3">
    <div class="row g-3 g-lg-4">
      <!-- Map Display -->
      <div class="col-lg-8 order-1">
        <div class="card custom-card p-3 position-relative">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-dark px-3 py-2 rounded-pill"><i class="bi bi-geo-alt text-warning"></i> Kuningan, Jabar</span>
              <span class="badge bg-success bg-opacity-10 text-success rounded-pill">
                <i class="bi bi-globe"></i> Batas Terpasang
              </span>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-success border-2 rounded-pill" @click="recenterMap">
                <i class="bi bi-compass"></i> Reset Kamera
              </button>
            </div>
          </div>
          <div id="map" ref="mapContainer"></div>
          <div class="map-hint">
            <i class="bi bi-mouse2"></i>
            <span>Klik pada peta untuk mengambil Latitude/Longitude ke formulir input.</span>
          </div>
        </div>
      </div>

      <!-- Forms Sidebar -->
      <div class="col-lg-4 order-2 mt-2 mt-lg-0">
        <!-- Add Point Form -->
        <div class="card custom-card p-3 p-md-4 mb-4">
          <h5 class="fw-bold mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-plus-circle-fill text-success"></i> Plot Titik Air Baru
          </h5>

          <!-- Validation Errors Summary -->
          <div v-if="formErrors.length > 0" class="alert alert-danger py-2 px-3 mb-3" style="font-size: 0.8rem; border-radius: 10px;">
            <div class="fw-semibold mb-1"><i class="bi bi-exclamation-triangle-fill me-1"></i> Validasi Gagal:</div>
            <ul class="mb-0 ps-3">
              <li v-for="(err, i) in formErrors" :key="i">{{ err }}</li>
            </ul>
          </div>

          <form @submit.prevent="addNewPoint" novalidate>
            <div class="mb-2">
              <label class="form-label text-secondary fw-semibold small">
                Nama Sumber Air <span class="text-danger">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': fieldErrors.name }"
                placeholder="Contoh: Balong Karomah"
                maxlength="100"
                required
              >
              <div v-if="fieldErrors.name" class="invalid-feedback" style="font-size: 0.75rem;">{{ fieldErrors.name }}</div>
              <div class="text-muted" style="font-size: 0.7rem;">{{ formData.name.length }}/100 karakter</div>
            </div>
            <div class="mb-2">
              <label class="form-label text-secondary fw-semibold small">
                Kecamatan <span class="text-danger">*</span>
              </label>
              <input
                v-model="formData.district"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': fieldErrors.district }"
                placeholder="Contoh: Cigugur"
                maxlength="50"
                required
              >
              <div v-if="fieldErrors.district" class="invalid-feedback" style="font-size: 0.75rem;">{{ fieldErrors.district }}</div>
            </div>
            <div class="row g-2">
              <div class="col-6 mb-2">
                <label class="form-label text-secondary fw-semibold small">
                  Latitude <span class="text-danger">*</span>
                </label>
                <input
                  v-model.number="formData.lat"
                  type="number"
                  step="any"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': fieldErrors.lat }"
                  placeholder="-6.9xxx"
                  min="-90"
                  max="90"
                  required
                >
                <div v-if="fieldErrors.lat" class="invalid-feedback" style="font-size: 0.75rem;">{{ fieldErrors.lat }}</div>
              </div>
              <div class="col-6 mb-2">
                <label class="form-label text-secondary fw-semibold small">
                  Longitude <span class="text-danger">*</span>
                </label>
                <input
                  v-model.number="formData.lng"
                  type="number"
                  step="any"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': fieldErrors.lng }"
                  placeholder="108.4xxx"
                  min="-180"
                  max="180"
                  required
                >
                <div v-if="fieldErrors.lng" class="invalid-feedback" style="font-size: 0.75rem;">{{ fieldErrors.lng }}</div>
              </div>
            </div>
            <div class="row g-2">
              <div class="col-6 mb-2">
                <label class="form-label text-secondary fw-semibold small">
                  Debit Air (L/s) <span class="text-danger">*</span>
                </label>
                <input
                  v-model.number="formData.debit"
                  type="number"
                  step="any"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': fieldErrors.debit }"
                  placeholder="15.5"
                  min="0"
                  max="9999.99"
                  required
                >
                <div v-if="fieldErrors.debit" class="invalid-feedback" style="font-size: 0.75rem;">{{ fieldErrors.debit }}</div>
              </div>
              <div class="col-6 mb-3">
                <label class="form-label text-secondary fw-semibold small">
                  IoT Topic Slug <span class="text-danger">*</span>
                </label>
                <input
                  v-model="formData.topic"
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': fieldErrors.topic }"
                  placeholder="Contoh: cigugur"
                  maxlength="50"
                  required
                >
                <div v-if="fieldErrors.topic" class="invalid-feedback" style="font-size: 0.75rem;">{{ fieldErrors.topic }}</div>
                <div class="text-muted" style="font-size: 0.7rem;">Huruf kecil, angka, tanda hubung</div>
              </div>
            </div>
            <div class="mb-2">
              <label class="form-label text-secondary fw-semibold small">Status Kelayakan</label>
              <select v-model="formData.status" class="form-select form-select-sm">
                <option value="Layak/Aman">Layak/Aman</option>
                <option value="Butuh Konservasi">Butuh Konservasi</option>
                <option value="Kritis">Kritis</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label text-secondary fw-semibold small">Deskripsi (Opsional)</label>
              <textarea
                v-model="formData.description"
                class="form-control form-control-sm"
                rows="2"
                maxlength="500"
                placeholder="Catatan tambahan tentang sumber air..."
              ></textarea>
              <div class="text-muted" style="font-size: 0.7rem;">{{ (formData.description || '').length }}/500 karakter</div>
            </div>
            <button
              type="submit"
              class="btn btn-success w-100 py-2 rounded-3 text-white fw-bold"
              style="background-color: var(--accent-water); border: none;"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-geo-fill"></i>
              {{ isSubmitting ? 'Menyimpan...' : 'Daftarkan Titik Air' }}
            </button>
          </form>
        </div>

        <!-- Manual Override Form -->
        <div class="card custom-card p-3 p-md-4 border-start border-danger border-4">
          <h5 class="fw-bold text-danger mb-2 d-flex align-items-center gap-2">
            <i class="bi bi-person-badge-fill"></i> Override Petugas Lapangan
          </h5>
          <p class="text-muted text-xs mb-3" style="font-size: 0.75rem;">Digunakan oleh petugas resmi jika modul IoT mati atau membutuhkan verifikasi manual.</p>

          <!-- Override Errors -->
          <div v-if="overrideErrors.length > 0" class="alert alert-danger py-2 px-3 mb-3" style="font-size: 0.8rem; border-radius: 10px;">
            <ul class="mb-0 ps-3">
              <li v-for="(err, i) in overrideErrors" :key="i">{{ err }}</li>
            </ul>
          </div>

          <form @submit.prevent="overridePoint" novalidate>
            <div class="mb-2">
              <label class="form-label text-secondary fw-semibold small">Pilih Titik Air <span class="text-danger">*</span></label>
              <select v-model.number="overrideData.pointId" class="form-select form-select-sm" required>
                <option :value="0" disabled>Pilih sumber air...</option>
                <option v-for="point in waterPointStore.points" :key="point.id" :value="point.id">
                  {{ point.name }} ({{ point.topic }})
                </option>
              </select>
            </div>
            <div class="row g-2">
              <div class="col-6 mb-2">
                <label class="form-label text-secondary fw-semibold small">Debit Aktual (L/s) <span class="text-danger">*</span></label>
                <input
                  v-model.number="overrideData.debit"
                  type="number"
                  step="any"
                  class="form-control form-control-sm"
                  min="0"
                  max="9999.99"
                  required
                >
              </div>
              <div class="col-6 mb-2">
                <label class="form-label text-secondary fw-semibold small">Status Baru</label>
                <select v-model="overrideData.status" class="form-select form-select-sm">
                  <option value="Layak/Aman">Layak/Aman</option>
                  <option value="Butuh Konservasi">Butuh Konservasi</option>
                  <option value="Kritis">Kritis</option>
                </select>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label text-secondary fw-semibold small">
                Kode Verifikasi Petugas <span class="text-danger">*</span>
              </label>
              <input
                v-model="overrideData.pin"
                type="password"
                class="form-control form-control-sm"
                placeholder="PIN 4 digit"
                maxlength="4"
                required
              >
              <div class="text-muted" style="font-size: 0.7rem;">Hubungi admin untuk kode verifikasi</div>
            </div>
            <button
              type="submit"
              class="btn btn-danger w-100 py-2 rounded-3 fw-bold"
              :disabled="isOverriding"
            >
              <span v-if="isOverriding" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-shield-lock-fill"></i>
              {{ isOverriding ? 'Memproses...' : 'Perbarui Data Manual' }}
            </button>
          </form>
        </div>
      </div>

      <!-- MQTT Logs Console -->
      <div class="card custom-card mt-4 p-0 overflow-hidden shadow-sm border-0">
        <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center px-4 py-2">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-terminal-fill text-success"></i>
            <span class="fw-bold small text-uppercase tracking-wider">IoT Console Streams</span>
          </div>
          <div class="d-flex gap-3 align-items-center">
            <button v-if="connectionStatus === 'disconnected' || connectionStatus === 'error'" 
                    class="btn btn-sm btn-outline-success text-white border-success p-1 px-2" 
                    style="font-size: 0.65rem;" 
                    @click="initMqtt()">
              <i class="bi bi-play-fill"></i> Hubungkan
            </button>
            <span class="badge bg-secondary p-1 px-2" style="font-size: 0.65rem;">{{ consoleLogs.length }} baris</span>
            <button class="btn btn-sm btn-link text-white p-0" title="Bersihkan Log" @click="consoleLogs = []">
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        </div>
        <div class="card-body bg-light p-3" style="height: 180px; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;">
          <div v-for="(log, i) in [...consoleLogs].reverse()" :key="i" class="mb-1 border-bottom border-secondary border-opacity-10 pb-1">
            <span class="text-dark">{{ log }}</span>
          </div>
          <div v-if="consoleLogs.length === 0" class="text-center text-muted py-4 italic">
            Belum ada aktivitas transmisi data...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useWaterPointStore } from '~/stores/waterPointStore'
import { useNotification } from '~/composables/useNotification'
import { useMap } from '~/composables/useMap'
import { useMqtt } from '~/composables/useMqtt'

const waterPointStore = useWaterPointStore()
const { success, error } = useNotification()
const { initMap, drawMarkers, onMapClick, flyTo, invalidateSize, loadBoundary } = useMap()
const { initMqtt, consoleLogs, connectionStatus, disconnectMqtt } = useMqtt()

const mapContainer = ref<HTMLElement | null>(null)
const isSubmitting = ref(false)
const isOverriding = ref(false)
const formErrors = ref<string[]>([])
const overrideErrors = ref<string[]>([])
const fieldErrors = ref<Record<string, string>>({})

const formData = reactive({
  name: '',
  district: '',
  lat: -6.9856,
  lng: 108.4874,
  debit: 15.5,
  status: 'Layak/Aman',
  topic: '',
  description: ''
})

const overrideData = reactive({
  pointId: 0,
  debit: 0,
  status: 'Layak/Aman',
  pin: ''
})

const validateForm = (): boolean => {
  formErrors.value = []
  fieldErrors.value = {}

  if (!formData.name || formData.name.length < 3) {
    fieldErrors.value.name = 'Nama minimal 3 karakter'
    formErrors.value.push('Nama sumber air minimal 3 karakter')
  }
  if (formData.name.length > 100) {
    fieldErrors.value.name = 'Nama maksimal 100 karakter'
    formErrors.value.push('Nama sumber air maksimal 100 karakter')
  }

  if (!formData.district || formData.district.length < 2) {
    fieldErrors.value.district = 'Kecamatan minimal 2 karakter'
    formErrors.value.push('Kecamatan minimal 2 karakter')
  }

  if (formData.lat < -90 || formData.lat > 90) {
    fieldErrors.value.lat = 'Latitude harus antara -90 sampai 90'
    formErrors.value.push('Latitude tidak valid')
  }

  if (formData.lng < -180 || formData.lng > 180) {
    fieldErrors.value.lng = 'Longitude harus antara -180 sampai 180'
    formErrors.value.push('Longitude tidak valid')
  }

  if (formData.debit < 0) {
    fieldErrors.value.debit = 'Debit tidak boleh negatif'
    formErrors.value.push('Debit air tidak boleh negatif')
  }
  if (formData.debit > 9999.99) {
    fieldErrors.value.debit = 'Debit maksimal 9999.99'
    formErrors.value.push('Debit air melebihi batas')
  }

  if (!formData.topic || formData.topic.length < 2) {
    fieldErrors.value.topic = 'Topic minimal 2 karakter'
    formErrors.value.push('IoT Topic minimal 2 karakter')
  }
  if (!/^[a-z0-9-]+$/.test(formData.topic)) {
    fieldErrors.value.topic = 'Hanya huruf kecil, angka, dan tanda hubung'
    formErrors.value.push('IoT Topic hanya boleh huruf kecil, angka, dan tanda hubung')
  }

  if ((formData.description || '').length > 500) {
    formErrors.value.push('Deskripsi maksimal 500 karakter')
  }

  // Check duplicate name
  if (formData.name && waterPointStore.points.some(p => p.name.toLowerCase() === formData.name.toLowerCase())) {
    fieldErrors.value.name = 'Nama sudah terdaftar'
    formErrors.value.push('Nama sumber air sudah terdaftar dalam sistem')
  }

  // Check duplicate topic
  if (formData.topic && waterPointStore.points.some(p => p.topic === formData.topic)) {
    fieldErrors.value.topic = 'Topic sudah digunakan'
    formErrors.value.push('IoT Topic sudah digunakan oleh titik air lain')
  }

  return formErrors.value.length === 0
}

const addNewPoint = async () => {
  if (!validateForm()) {
    error('Mohon periksa kembali data formulir Anda')
    return
  }

  isSubmitting.value = true
  try {
    await waterPointStore.addPoint({
      name: formData.name,
      district: formData.district,
      lat: formData.lat,
      lng: formData.lng,
      debit: formData.debit,
      status: formData.status,
      source: 'Manual Petugas',
      topic: formData.topic,
      description: formData.description || undefined
    })
    success(`Sukses memplot "${formData.name}" ke peta GIS!`)
    Object.assign(formData, { name: '', district: '', debit: 15.5, status: 'Layak/Aman', topic: '', description: '' })
    fieldErrors.value = {}
    formErrors.value = []
    drawMarkers(waterPointStore.points)
    flyTo(formData.lat, formData.lng)
  } catch (err: any) {
    error(err.message || 'Gagal menambah titik air')
  } finally {
    isSubmitting.value = false
  }
}

const overridePoint = async () => {
  overrideErrors.value = []

  if (!overrideData.pointId) {
    overrideErrors.value.push('Pilih titik air terlebih dahulu')
  }
  if (overrideData.debit < 0) {
    overrideErrors.value.push('Debit tidak boleh negatif')
  }
  if (!overrideData.pin || !/^\d{4}$/.test(overrideData.pin)) {
    overrideErrors.value.push('PIN harus 4 digit angka')
  }

  if (overrideErrors.value.length > 0) {
    error('Mohon periksa kembali data override')
    return
  }

  isOverriding.value = true
  try {
    await waterPointStore.overrideDebit(overrideData.pointId, overrideData.debit, overrideData.status, overrideData.pin)
    success('Data berhasil dioverride oleh Petugas.')
    Object.assign(overrideData, { pointId: 0, debit: 0, status: 'Layak/Aman', pin: '' })
    drawMarkers(waterPointStore.points)
  } catch (err: any) {
    error(err.message || 'Gagal mengupdate data')
  } finally {
    isOverriding.value = false
  }
}

const recenterMap = () => {
  invalidateSize()
  flyTo(-6.9856, 108.4874, 11)
  success('Kamera peta dikembalikan ke fokus wilayah Kuningan.')
}

onMounted(async () => {
  await waterPointStore.fetchPoints()
  initMqtt()
  if (mapContainer.value) {
    await initMap(mapContainer.value)
    drawMarkers(waterPointStore.points)
    await loadBoundary()
    invalidateSize()
    onMapClick((lat, lng) => {
      formData.lat = parseFloat(lat.toFixed(6))
      formData.lng = parseFloat(lng.toFixed(6))
      success(`Koordinat berhasil disalin: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    })
  }
})
</script>
