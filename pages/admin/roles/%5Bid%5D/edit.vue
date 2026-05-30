<template>
  <div class="role-edit-page">
    <div class="d-flex justify-content-between align-items-center mb-5">
      <div>
        <NuxtLink to="/admin/roles" class="text-primary text-decoration-none fw-bold small mb-2 d-inline-block">
          <i class="bi bi-chevron-left me-1"></i>KEMBALI KE DAFTAR PERAN
        </NuxtLink>
        <h2 class="fw-bold m-0">Konfigurasi <span class="text-primary">Izin Akses</span></h2>
      </div>
      <div v-if="role" class="role-badge">
        <i class="bi bi-shield-lock-fill me-2"></i>{{ role.name }}
      </div>
    </div>

    <div class="row">
      <div class="col-lg-8">
        <div class="glass-card">
          <div class="card-header p-4 border-bottom bg-transparent d-flex align-items-center justify-content-between">
            <h5 class="fw-bold mb-0">Matriks Izin Sumber Daya</h5>
            <span class="badge bg-primary-soft text-primary px-3 rounded-pill">Akses Penuh (MANAGE)</span>
          </div>
          
          <div class="card-body p-4">
            <p class="text-muted small mb-4">Aktifkan atau nonaktifkan akses untuk modul-modul di bawah ini. Setiap modul yang diaktifkan memberikan izin penuh untuk melihat dan mengelola data di dalamnya.</p>
            
            <div class="row g-4">
              <div v-for="res in availableResources" :key="res" class="col-md-6">
                <div class="resource-card p-3 h-100 rounded-4" 
                     :class="hasPermission('MANAGE', res) ? 'active' : ''"
                     @click="togglePermission('MANAGE', res)">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="d-flex gap-3">
                      <div class="res-icon">
                        <i class="bi" :class="getResourceIcon(res)"></i>
                      </div>
                      <div>
                        <h6 class="fw-bold mb-1">{{ res.replace('_', ' ') }}</h6>
                        <p class="text-muted m-0" style="font-size: 11px;">Izin kelola {{ res.toLowerCase().replace('_', ' ') }}</p>
                      </div>
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

            <div class="mt-5 pt-4 border-top d-flex justify-content-end gap-3">
              <NuxtLink to="/admin/roles" class="btn btn-light px-4 rounded-pill">Batal</NuxtLink>
              <button class="btn btn-primary px-5 rounded-pill fw-bold" :disabled="saving" @click="savePermissions">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                Simpan Konfigurasi Izin
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="glass-card bg-primary-soft border-0 p-4 sticky-top" style="top: 100px;">
          <h6 class="fw-bold mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-info-circle-fill text-primary"></i> Panduan Keamanan
          </h6>
          <ul class="text-muted small ps-3 mb-0" style="list-style-type: square;">
            <li class="mb-2">Berikan izin hanya seduai kebutuhan tugas (Principle of Least Privilege).</li>
            <li class="mb-2">Admin memiliki izin permanen yang tidak dapat diubah dari panel ini.</li>
            <li>Perubahan akan langsung berdampak pada akses pengguna yang terhubung dengan peran ini.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: ['auth'] })

const route = useRoute()
const roleId = route.params.id
const role = ref(null)
const selectedPermissions = ref([])
const saving = ref(false)

const availableResources = ['USERS', 'WATER_POINTS', 'SETTINGS', 'GALLERY', 'LOGS', 'ROLES']

const fetchData = async () => {
  try {
    const roles = await $fetch('/api/roles')
    role.value = roles.find(r => r.id == roleId)
    if (!role.value) throw new Error('Role not found')
    selectedPermissions.value = role.value.permissions.map(p => ({ action: p.action, resource: p.resource }))
  } catch (err) {
    navigateTo('/admin/roles')
  }
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
      body: { roleId, permissions: selectedPermissions.value }
    })
    alert('Konfigurasi izin berhasil disimpan')
    navigateTo('/admin/roles')
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

onMounted(fetchData)
</script>

<style scoped>
.glass-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 24px; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); }
.role-badge { background: var(--primary); color: white; padding: 10px 20px; border-radius: 14px; font-weight: 800; font-size: 14px; }

.resource-card { 
  background: var(--bg); border: 1px solid var(--border); 
  cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.resource-card:hover { border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.resource-card.active { border-color: var(--primary); background: var(--primary-soft); }

.res-icon { 
  width: 44px; height: 44px; border-radius: 12px; background: rgba(120,120,120,0.05);
  display: flex; align-items: center; justify-content: center; font-size: 20px; color: var(--text-sub);
}
.active .res-icon { background: white; color: var(--primary); }

.form-check-input:checked { background-color: var(--primary); border-color: var(--primary); }
</style>
