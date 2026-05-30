<template>
  <div class="admin-page container-fluid py-4">
    <div class="header-section mb-4 d-flex justify-content-between align-items-center">
      <div>
        <h1 class="page-title">User <span class="text-primary">Management</span></h1>
        <p class="text-muted mb-0">Kelola pengguna sistem, peran (RBAC), dan status akses.</p>
      </div>
      <button class="btn btn-primary" @click="openModal('create')">
        <i class="bi bi-person-plus-fill me-2"></i>Tambah Pengguna
      </button>
    </div>

    <div class="glass-card table-card animate-fade-in">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Nama Lengkap</th>
                <th>Email</th>
                <th>Peran</th>
                <th>Status</th>
                <th>Dibuat Pada</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="user-avatar me-3">
                      {{ user.fullName.charAt(0) }}
                    </div>
                    <span class="fw-bold">{{ user.fullName }}</span>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="badge bg-primary-soft text-primary">{{ user.role }}</span>
                </td>
                <td>
                  <span :class="user.status === 'ACTIVE' ? 'badge bg-success-soft' : 'badge bg-danger-soft'">
                    {{ user.status }}
                  </span>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-icon text-danger" @click="confirmDelete(user)">
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
          <h5 class="modal-title">Tambah Pengguna Baru</h5>
          <button class="btn-close btn-close-white" @click="showModal = false"></button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body py-4">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Nama Lengkap</label>
                <input v-model="form.fullName" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Email</label>
                <input v-model="form.email" type="email" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Password</label>
                <input v-model="form.password" type="password" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Peran</label>
                <select v-model="form.roleId" class="form-select" required>
                  <option v-for="role in roles" :key="role.id" :value="role.id">
                    {{ role.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Status</label>
                <select v-model="form.status" class="form-select">
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary" @click="showModal = false">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : 'Simpan Pengguna' }}
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

const users = ref([])
const roles = ref([])
const loading = ref(true)
const showModal = ref(false)
const submitting = ref(false)

const form = ref({
  fullName: '',
  email: '',
  password: '',
  roleId: '',
  status: 'ACTIVE'
})

const fetchData = async () => {
  loading.value = true
  try {
    const [userData, roleData] = await Promise.all([
      $fetch('/api/users'),
      $fetch('/api/roles')
    ])
    users.value = userData
    roles.value = roleData
  } catch (err) {
    console.error('Fetch error:', err)
  } finally {
    loading.value = false
  }
}

const openModal = (type) => {
  form.value = {
    fullName: '',
    email: '',
    password: '',
    roleId: roles.value[0]?.id || '',
    status: 'ACTIVE'
  }
  showModal.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: form.value
    })
    showModal.value = false
    await fetchData()
  } catch (err) {
    alert(err.data?.statusMessage || 'Gagal menyimpan data')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (user) => {
  if (confirm(`Hapus pengguna ${user.fullName}?`)) {
    try {
      await $fetch(`/api/users/${user.id}`, { method: 'DELETE' })
      await fetchData()
    } catch (err) {
      alert('Gagal menghapus data')
    }
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

onMounted(fetchData)
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

.table { color: #cbd5e1; }
.table thead th { background: rgba(255, 255, 255, 0.02); color: #94a3b8; padding: 16px; font-size: 12px; text-transform: uppercase; }
.table tbody td { padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); vertical-align: middle; }

.user-avatar {
  width: 36px; height: 36px; background: #38bdf8; color: white;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px;
}

.badge { padding: 6px 12px; border-radius: 8px; font-weight: 600; }
.bg-primary-soft { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
.bg-success-soft { background: rgba(52, 211, 153, 0.1); color: #34d399; }
.bg-danger-soft { background: rgba(251, 113, 133, 0.1); color: #fb7185; }

.btn-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: #64748b; border-radius: 10px; transition: all 0.2s; }
.btn-icon:hover { background: rgba(255, 255, 255, 0.1); color: #f8fafc; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px); }
.modal-content { width: 600px; max-width: 95%; background: #1e293b; }

.form-label { color: #94a3b8; font-size: 13px; }
.form-control, .form-select { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); color: white; border-radius: 10px; }
.form-control:focus, .form-select:focus { background: rgba(15, 23, 42, 0.8); border-color: #38bdf8; }

.animate-fade-in { animation: fadeIn 0.5s ease; }
.animate-zoom { animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoom { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
</style>
