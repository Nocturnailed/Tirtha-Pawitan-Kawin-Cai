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
              <NuxtLink 
                v-if="role.name !== 'ADMIN'"
                :to="`/admin/roles/${role.id}/edit`"
                class="btn btn-sm btn-icon border-0" 
                title="Edit Izin"
              >
                <i class="bi bi-pencil-square text-primary"></i>
              </NuxtLink>
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

const fetchRoles = async () => {
  try {
    roles.value = await $fetch('/api/roles')
  } catch (err) {
    console.error('Failed to fetch roles:', err)
  } finally {
    loading.value = false
  }
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
