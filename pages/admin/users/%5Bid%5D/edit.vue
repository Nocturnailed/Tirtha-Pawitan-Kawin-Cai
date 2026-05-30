<template>
  <div class="user-edit-page">
    <div class="d-flex justify-content-between align-items-center mb-5">
      <div>
        <NuxtLink to="/admin/users" class="text-primary text-decoration-none fw-bold small mb-2 d-inline-block">
          <i class="bi bi-chevron-left me-1"></i>KEMBALI KE DAFTAR USER
        </NuxtLink>
        <h2 class="fw-bold m-0">Kelola <span class="text-primary">Pengguna</span></h2>
      </div>
    </div>

    <div class="row g-4">
      <!-- Edit Profile -->
      <div class="col-lg-7">
        <div class="glass-card h-100">
          <div class="card-header-themed">
            <i class="bi bi-person-gear"></i>
            <h5>Data Profil Pengguna</h5>
          </div>
          <div class="card-body p-4">
            <form @submit.prevent="handleUpdateUser">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Nama Lengkap</label>
                  <input v-model="form.fullName" type="text" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input v-model="form.email" type="email" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Institusi</label>
                  <input v-model="form.institution" type="text" class="form-control" placeholder="ex: UTB" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Jabatan</label>
                  <input v-model="form.position" type="text" class="form-control" />
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
                  <label class="form-label">Status Akses</label>
                  <select v-model="form.status" class="form-select">
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div class="mt-5 pt-3 border-top d-flex justify-content-end">
                <button type="submit" class="btn btn-primary px-4 py-2 rounded-pill fw-bold" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  Simpan Perubahan Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Reset Password -->
      <div class="col-lg-5">
        <div class="glass-card h-100">
          <div class="card-header-themed border-primary">
            <i class="bi bi-shield-lock-fill text-primary"></i>
            <h5>Keamanan & Password</h5>
          </div>
          <div class="card-body p-4">
            <p class="text-muted small mb-4">Reset password pengguna jika yang bersangkutan lupa atau untuk keperluan audit keamanan.</p>
            
            <form @submit.prevent="handleResetPassword">
              <div class="mb-4">
                <label class="form-label">Password Baru Pengguna</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-key"></i></span>
                  <input v-model="newPassword" type="password" class="form-control" placeholder="Min. 6 Karakter" required />
                </div>
              </div>

              <div class="alert alert-warning-soft border-0 rounded-4 small d-flex gap-3 mb-4">
                <i class="bi bi-info-circle-fill text-warning mt-1"></i>
                <p class="m-0">Tindakan ini akan langsung menguubah akses pengguna. Informasikan password baru kepada yang bersangkutan.</p>
              </div>

              <button type="submit" class="btn btn-outline-primary w-100 py-3 rounded-pill fw-bold" :disabled="submittingPwd">
                <span v-if="submittingPwd" class="spinner-border spinner-border-sm me-2"></span>
                Reset Password Pengguna
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: ['auth'] })

const route = useRoute()
const userId = route.params.id

const form = ref({
  fullName: '', email: '', institution: '', position: '',
  roleId: '', status: 'ACTIVE'
})
const roles = ref([])
const submitting = ref(false)
const submittingPwd = ref(false)
const newPassword = ref('')

const fetchData = async () => {
  try {
    const [userData, roleData] = await Promise.all([
      $fetch(`/api/users/${userId}`),
      $fetch('/api/roles')
    ])
    
    roles.value = roleData
    form.value = {
      fullName: userData.fullName,
      email: userData.email,
      institution: userData.institution || '',
      position: userData.position || '',
      roleId: roleData.find(r => r.name === userData.role)?.id || '',
      status: userData.status
    }
  } catch (err) {
    console.error('Fetch error:', err)
    navigateTo('/admin/users')
  }
}

const handleUpdateUser = async () => {
  submitting.value = true
  try {
    await $fetch(`/api/users/${userId}`, {
      method: 'PUT',
      body: form.value
    })
    alert('Profil berhasil diperbarui')
  } catch (err) {
    alert(err.data?.statusMessage || 'Gagal menyimpan perubahan')
  } finally {
    submitting.value = false
  }
}

const handleResetPassword = async () => {
  submittingPwd.value = true
  try {
    await $fetch('/api/users/password', {
      method: 'POST',
      body: { userId, newPassword: newPassword.value }
    })
    newPassword.value = ''
    alert('Password berhasil direset')
  } catch (err) {
    alert('Gagal mereset password')
  } finally {
    submittingPwd.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.glass-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 24px; overflow: hidden; }
.card-header-themed { padding: 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 14px; }
.card-header-themed i { font-size: 24px; color: var(--text-sub); }
.card-header-themed h5 { margin: 0; font-weight: 800; font-size: 16px; color: var(--text); text-transform: uppercase; letter-spacing: 0.5px; }

.form-label { font-size: 13px; font-weight: 700; color: var(--text); opacity: 0.8; margin-bottom: 8px; }
.form-control, .form-select { border-radius: 12px; padding: 12px; border: 1.5px solid var(--border); background: var(--bg); color: var(--text); }
.input-group-text { border-radius: 12px 0 0 12px; border: 1.5px solid var(--border); border-right: none; background: var(--bg); color: var(--text-sub); }
.input-group .form-control { border-radius: 0 12px 12px 0; }

.alert-warning-soft { background: var(--warning-soft); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.1); }
</style>
