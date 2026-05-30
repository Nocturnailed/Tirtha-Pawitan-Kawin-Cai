<template>
  <div class="admin-page container-fluid py-4">
    <div class="header-section mb-4">
      <h1 class="page-title">Kontrol <span class="text-primary">Akses (RBAC)</span></h1>
      <p class="text-muted">Kelola peran pengguna dan izin akses ke sumber daya sistem.</p>
    </div>

    <div class="row g-4">
      <div v-for="role in roles" :key="role.id" class="col-lg-6">
        <div class="glass-card h-100 animate-fade-in">
          <div class="card-header border-0 bg-transparent pt-4 px-4 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold mb-0">
              <i class="bi bi-shield-lock-fill me-2 text-primary"></i>
              {{ role.name }}
            </h5>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-primary-soft text-primary">{{ role.permissions.length }} Izin</span>
              <button 
                v-if="role.name !== 'ADMIN'"
                class="btn btn-sm btn-icon border-0" 
                title="Edit Izin" 
                @click="openEditModal(role)"
              >
                <i class="bi bi-pencil-square text-primary"></i>
              </button>
            </div>
          </div>
          <div class="card-body p-4">
            <p class="text-muted small mb-4">{{ role.description || 'Tidak ada deskripsi peran.' }}</p>
            
            <div class="permission-grid">
              <div v-for="perm in role.permissions" :key="perm.id" class="perm-tag">
                <span class="action">{{ perm.action }}</span>
                <span class="resource">{{ perm.resource }}</span>
              </div>
            </div>

            <div v-if="role.permissions.length === 0" class="text-center py-4 bg-light-soft rounded-4">
              <i class="bi bi-shield-slash text-muted d-block fs-3 mb-2"></i>
              <span class="text-muted small">Belum ada izin yang dikonfigurasi.</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Permissions Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content glass-card animate-zoom" style="max-width: 650px; padding: 20px;">
        <div class="modal-header border-0 pb-0">
          <div>
            <h5 class="modal-title fw-bold mb-1">Pengaturan Izin Akses</h5>
            <p class="text-muted small mb-0">Konfigurasi peran untuk <strong>{{ targetRole?.name }}</strong></p>
          </div>
          <button class="btn-close btn-close-white" @click="showEditModal = false"></button>
        </div>
        <div class="modal-body py-4">
          <div class="mb-3 text-start">
            <div class="row g-3">
              <div v-for="res in availableResources" :key="res" class="col-md-6">
                <div class="permission-item p-3 h-100 rounded-4 transition-all" 
                     :class="hasPermission('MANAGE', res) ? 'bg-primary-soft border-primary' : 'bg-light-soft border-transparent'"
                     style="border: 1px solid transparent; cursor: pointer;"
                     @click="togglePermission('MANAGE', res)">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="text-start">
                      <div class="d-flex align-items-center gap-2 mb-1">
                        <i class="bi fs-5" :class="getResourceIcon(res)"></i>
                        <h6 class="mb-0 fw-bold">{{ res.replace('_', ' ') }}</h6>
                      </div>
                      <small class="text-muted" style="font-size: 10px;">Akses penuh ke modul ini</small>
                    </div>
                    <div class="form-check form-switch m-0">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        role="switch"
                        :checked="hasPermission('MANAGE', res)" 
                        @click.stop
                        @change="togglePermission('MANAGE', res)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0 pt-0 gap-2">
          <button type="button" class="btn btn-light rounded-4 px-4" @click="showEditModal = false">Batal</button>
          <button type="button" class="btn btn-primary rounded-4 px-4 fw-bold" :disabled="saving" @click="savePermissions">
            {{ saving ? 'Menyimpan...' : 'Simpan Konfigurasi' }}
          </button>
        </div>
      </div>
    </div>

    <div class="info-alert mt-5 p-4 rounded-4 bg-primary-soft">
      <div class="d-flex gap-3">
        <i class="bi bi-info-circle-fill text-primary fs-3"></i>
        <div class="text-start">
          <h6 class="fw-bold mb-1">Catatan Keamanan</h6>
          <p class="text-muted small mb-0">
            Perubahan pada izin akses memerlukan kehati-hatian tingkat tinggi. Izin peran Administrator bersifat tetap dan tidak dapat diubah demi keamanan sistem. Hubungi bantuan teknis jika memerlukan penyesuaian khusus.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: ['auth'] })

const roles = ref([])
const loading = ref(true)
const showEditModal = ref(false)
const targetRole = ref(null)
const saving = ref(false)
const selectedPermissions = ref([])

const availableResources = ['USERS', 'WATER_POINTS', 'SETTINGS', 'GALLERY', 'LOGS', 'ROLES']

const fetchRoles = async () => {
  try {
    roles.value = await $fetch('/api/roles')
  } catch (err) {
    console.error('Failed to fetch roles:', err)
  } finally {
    loading.value = false
  }
}

const openEditModal = (role) => {
  targetRole.value = role
  selectedPermissions.value = role.permissions.map(p => ({ action: p.action, resource: p.resource }))
  showEditModal.value = true
}

const hasPermission = (action, resource) => {
  return selectedPermissions.value.some(p => p.action === action && p.resource === resource)
}

const togglePermission = (action, resource) => {
  const index = selectedPermissions.value.findIndex(p => p.action === action && p.resource === resource)
  if (index > -1) {
    selectedPermissions.value.splice(index, 1)
  } else {
    selectedPermissions.value.push({ action, resource })
  }
}

const savePermissions = async () => {
  saving.value = true
  try {
    await $fetch('/api/roles/permissions', {
      method: 'POST',
      body: { 
        roleId: targetRole.value.id, 
        permissions: selectedPermissions.value 
      }
    })
    showEditModal.value = false
    await fetchRoles()
  } catch (err) {
    alert(err.data?.statusMessage || 'Gagal menyimpan izin')
  } finally {
    saving.value = false
  }
}

const getResourceIcon = (res) => {
  const icons = {
    'USERS': 'bi-people',
    'WATER_POINTS': 'bi-droplet',
    'SETTINGS': 'bi-gear',
    'GALLERY': 'bi-images',
    'LOGS': 'bi-journals',
    'ROLES': 'bi-shield-check'
  }
  return icons[res] || 'bi-layers'
}

onMounted(fetchRoles)
</script>

<style scoped>
.admin-page { min-height: 100vh; }
.page-title { color: var(--text); font-weight: 800; letter-spacing: -1px; }

.glass-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); transition: transform 0.2s; }
.glass-card:hover { transform: translateY(-4px); }

.badge { padding: 6px 12px; border-radius: 100px; font-size: 11px; font-weight: 800; }
.bg-primary-soft { background: var(--primary-soft); color: var(--primary); }

.permission-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.perm-tag { 
  display: flex; align-items: center; background: var(--bg); border: 1px solid var(--border); 
  border-radius: 8px; overflow: hidden; font-size: 11px; font-weight: 700;
}
.perm-tag .action { padding: 4px 8px; background: var(--primary-soft); color: var(--primary); }
.perm-tag .resource { padding: 4px 8px; color: var(--text); }

.bg-light-soft { background: var(--bg); border: 1px dashed var(--border); }
.border-primary { border-color: var(--primary) !important; }
.transition-all { transition: all 0.2s ease-in-out; }

.animate-fade-in { animation: fadeIn 0.5s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-zoom { animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes zoom { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>
