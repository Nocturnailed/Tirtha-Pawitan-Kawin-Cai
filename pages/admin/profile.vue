<template>
  <div class="profile-page">
    <div class="d-flex justify-content-between align-items-center mb-5">
      <div>
        <h2 class="fw-bold mb-1">Profil & Keamanan</h2>
        <p class="text-muted">Kelola informasi akun dan kata sandi Anda.</p>
      </div>
      <NuxtLink to="/admin/dashboard" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-2"></i>Kembali
      </NuxtLink>
    </div>

    <div class="row g-4">
      <!-- Profile Info -->
      <div class="col-lg-4">
        <div class="glass-card p-4 text-center">
          <div class="profile-avatar mb-4">
            {{ user?.fullName?.charAt(0) }}
          </div>
          <h4 class="fw-bold mb-1">{{ user?.fullName }}</h4>
          <span class="badge bg-primary-soft text-primary px-3 py-2 rounded-pill mb-4">
            <i class="bi bi-shield-check me-2"></i>{{ user?.role?.name }}
          </span>
          
          <div class="profile-meta text-start mt-4">
            <div class="meta-item">
              <i class="bi bi-envelope"></i>
              <div>
                <span>Alamat Email</span>
                <strong>{{ user?.email }}</strong>
              </div>
            </div>
            <div class="meta-item">
              <i class="bi bi-calendar3"></i>
              <div>
                <span>Terdaftar Sejak</span>
                <strong>{{ formatDate(user?.createdAt) }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Change Password -->
      <div class="col-lg-8">
        <div class="glass-card p-4">
          <div class="d-flex align-items-center mb-4">
            <div class="icon-box me-3">
              <i class="bi bi-key-fill"></i>
            </div>
            <h5 class="fw-bold m-0">Ubah Kata Sandi</h5>
          </div>

          <form @submit.prevent="handleChangePassword" class="password-form">
            <div class="row g-3">
              <div class="col-md-12">
                <label class="form-label fw-bold small text-uppercase">Password Lama</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-0"><i class="bi bi-lock"></i></span>
                  <input v-model="pwdForm.oldPassword" type="password" class="form-control" placeholder="Masukkan password lama" required />
                </div>
              </div>
              
              <div class="col-md-6">
                <label class="form-label fw-bold small text-uppercase">Password Baru</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-0"><i class="bi bi-shield-lock"></i></span>
                  <input v-model="pwdForm.newPassword" type="password" class="form-control" placeholder="Password baru" required />
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-bold small text-uppercase">Konfirmasi Password Baru</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-0"><i class="bi bi-shield-check"></i></span>
                  <input v-model="pwdForm.confirmPassword" type="password" class="form-control" placeholder="Ulangi password baru" required />
                </div>
              </div>
            </div>

            <div v-if="status.message" :class="['alert mt-4 shadow-sm', status.type === 'success' ? 'alert-success border-success' : 'alert-danger border-danger']">
              <i :class="['bi me-2', status.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill']"></i>
              {{ status.message }}
            </div>

            <div class="mt-5 d-flex justify-content-end">
              <button type="submit" class="btn btn-primary px-5 py-3 rounded-pill fw-bold" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-save2 me-2"></i>
                Simpan Perubahan Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

const user = ref(null)
const submitting = ref(false)
const pwdForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })
const status = ref({ type: '', message: '' })

const fetchUser = async () => {
  try {
    user.value = await $fetch('/api/auth/me')
  } catch (err) {
    navigateTo('/login')
  }
}

const handleChangePassword = async () => {
  if (pwdForm.value.newPassword !== pwdForm.value.confirmPassword) {
    status.value = { type: 'error', message: 'Konfirmasi password baru tidak cocok.' }
    return
  }

  submitting.value = true
  status.value = { type: '', message: '' }
  
  try {
    await $fetch('/api/auth/change-password', {
      method: 'POST',
      body: { 
        oldPassword: pwdForm.value.oldPassword, 
        newPassword: pwdForm.value.newPassword 
      }
    })
    status.value = { type: 'success', message: 'Password Anda telah berhasil diperbarui.' }
    pwdForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } catch (err) {
    status.value = { type: 'error', message: err.data?.statusMessage || 'Gagal mengubah password. Pastikan password lama benar.' }
  } finally {
    submitting.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(fetchUser)
</script>

<style scoped>
.profile-avatar {
  width: 100px; height: 100px; border-radius: 30px;
  background: var(--primary); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 48px; font-weight: 800; margin: 0 auto;
  box-shadow: 0 10px 20px -5px var(--primary-soft);
}

.profile-meta { display: flex; flex-direction: column; gap: 20px; }
.meta-item { display: flex; align-items: center; gap: 15px; }
.meta-item i { width: 40px; height: 40px; border-radius: 12px; background: var(--bg); display: flex; align-items: center; justify-content: center; color: var(--text-sub); }
.meta-item span { display: block; font-size: 11px; color: var(--text-sub); text-transform: uppercase; font-weight: 700; }
.meta-item strong { color: var(--text); font-size: 14px; }

.icon-box {
  width: 44px; height: 44px; border-radius: 12px; background: var(--primary-soft);
  color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 20px;
}

.form-control {
  padding: 12px 16px; border-radius: 0 12px 12px 0; border: 1.5px solid #f1f5f9; background: #f8fafc;
}
.input-group-text { border-radius: 12px 0 0 12px; border: 1.5px solid #f1f5f9; border-right: none; color: var(--text-sub); }

.dark .form-control { background: rgba(2, 44, 34, 0.4); border-color: rgba(255,255,255,0.05); color: white; }
.dark .input-group-text { background: rgba(2, 44, 34, 0.6); border-color: rgba(255,255,255,0.05); color: var(--accent); }

.btn-primary { background: var(--primary); border: none; box-shadow: 0 10px 20px -5px var(--primary-soft); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 15px 25px -5px var(--primary-soft); opacity: 0.9; }
</style>
