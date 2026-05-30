<template>
  <div :class="['login-page', theme]">
    <!-- Decorative Motifs -->
    <div class="sunda-motif motif-left"></div>
    <div class="sunda-motif motif-right"></div>

    <div class="login-wrapper">
      <!-- Left: Branding -->
      <div class="login-brand d-none d-lg-flex">
        <div class="motif-overlay"></div>
        <div class="brand-content reveal">
          <div class="brand-badge mb-3">Tirtha Pawitan AIoT</div>
          <i class="bi bi-droplet-fill brand-icon"></i>
          <h1>Kearifan Lokal <br/><span class="highlight">Teknologi Global</span></h1>
          <p>Sistem Informasi Geospasial & monitoring kelistarian sumber mata air dengan nuansa kearifan lokal Kabupaten Kuningan.</p>
          
          <div class="brand-features mt-5">
            <div class="feature-card">
              <i class="bi bi-geo-alt"></i>
              <div>
                <strong>Smart Mapping</strong>
                <p>Visualisasi GIS presisi tinggi.</p>
              </div>
            </div>
            <div class="feature-card">
              <i class="bi bi-cpu"></i>
              <div>
                <strong>AIoT Streams</strong>
                <p>Telemetry sensor nirkabel.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="login-form-side">
        <div class="login-form-container animate-fade-in">
          <div class="d-flex justify-content-between align-items-center mb-5">
            <NuxtLink to="/" class="back-link">
              <i class="bi bi-arrow-left-short fs-4"></i>
              <span>Beranda</span>
            </NuxtLink>
            <button class="theme-btn" @click="toggleTheme" 
                    :title="theme === 'light' ? 'Nyalakan Mode Gelap' : 'Nyalakan Mode Terang'">
              <i :class="theme === 'light' ? 'bi bi-moon-stars' : 'bi bi-sun'"></i>
            </button>
          </div>

          <div class="form-header mb-4">
            <h2 class="fw-bold">Wilujeng <span class="highlight">Sumping</span></h2>
            <p>Silakan masuk untuk mengakses dashboard administrasi.</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="input-group-custom">
              <label for="email">Alamat Email</label>
              <div class="input-wrap">
                <i class="bi bi-envelope-at"></i>
                <input v-model="form.email" type="email" id="email" placeholder="admin@kawincai.id" required />
              </div>
            </div>

            <div class="input-group-custom">
              <label for="password">Kata Sandi</label>
              <div class="input-wrap">
                <i class="bi bi-shield-lock"></i>
                <input v-model="form.password" :type="showPw ? 'text' : 'password'" id="password" placeholder="••••••••" required />
                <button type="button" class="toggle-pw" @click="showPw = !showPw">
                  <i :class="showPw ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
            </div>

            <div v-if="error" class="error-box">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <span>{{ error }}</span>
            </div>

            <button type="submit" class="btn-submit" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Membuka Akses...' : 'Masuk Dashboard' }}
              <i v-if="!loading" class="bi bi-arrow-right ms-2"></i>
            </button>
          </form>

          <div class="login-footer mt-5 text-center">
            <p class="text-muted small">&copy; 2026 Tirtha Pawitan AIoT - Kabupaten Kuningan</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const theme = ref('light')
const form = ref({ email: '', password: '' })
const showPw = ref(false)
const loading = ref(false)
const error = ref('')

const toggleTheme = () => { theme.value = theme.value === 'light' ? 'dark' : 'light' }

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch('/api/auth/login', { method: 'POST', body: form.value })
    const token = useCookie('auth_token', { maxAge: 60 * 60 * 24, path: '/' })
    token.value = res.token
    navigateTo('/admin/dashboard')
  } catch (err) {
    error.value = err.data?.statusMessage || 'Akses ditolak. Cek kembali email & password.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;900&display=swap');

.login-page {
  font-family: 'Plus Jakarta Sans', sans-serif;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  transition: all .3s ease;
}

/* ===== SUNDA THEME TOKENS ===== */
.login-page.light {
  --primary: #064e3b;
  --primary-soft: rgba(6, 78, 59, 0.05);
  --accent: #fbbf24;
  --bg: #fdfdfb;
  --card-bg: #ffffff;
  --text: #064e3b;
  --text-sub: #64748b;
  --border: rgba(6, 78, 59, 0.1);
  --input-bg: #f8fafc;
  --brand-bg: #064e3b;
}

.login-page.dark {
  --primary: #fbbf24;
  --primary-soft: rgba(251, 191, 36, 0.1);
  --accent: #fbbf24;
  --bg: #022c22;
  --card-bg: rgba(6, 78, 59, 0.4);
  --text: #f0fdf4;
  --text-sub: #94a3b8;
  --border: rgba(251, 191, 36, 0.2);
  --input-bg: rgba(2, 44, 34, 0.6);
  --brand-bg: #011d16;
}

/* Motifs */
.sunda-motif {
  position: absolute; width: 300px; height: 300px;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='60' viewBox='0 0 100 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10c10 0 15 5 15 10s-5 10-15 10H10C4 30 0 26 0 20s4-10 10-10h20zm40 20c10 0 15 5 15 10s-5 10-15 10H50c-6 0-10-4-10-10s4-10 10-10h20z' fill='%23fbbf24' fill-opacity='0.08'/%3E%3C/svg%3E");
  z-index: 1; pointer-events: none;
}
.motif-left { top: -50px; left: -50px; }
.motif-right { bottom: -50px; right: -50px; transform: rotate(180deg); }

.login-wrapper { display: flex; min-height: 100vh; position: relative; z-index: 2; }

/* BRANDING */
.login-brand {
  flex: 1.2; background: var(--brand-bg);
  position: relative; padding: 60px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.motif-overlay {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='200' height='120' viewBox='0 0 200 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 40c20 0 30 10 30 20s-10 20-30 20H20C8 80 0 72 0 60s8-20 20-20h40zm80 40c20 0 30 10 30 20s-10 20-30 20h-40c-12 0-20-8-20-20s8-20 20-20h40z' fill='%23fbbf24' fill-opacity='0.03'/%3E%3C/svg%3E");
  opacity: 0.5;
}
.login-brand::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at center, transparent, rgba(0,0,0,0.4));
}

.brand-content { position: relative; z-index: 2; color: white; max-width: 480px; }
.brand-badge {
  display: inline-block; padding: 6px 16px; background: rgba(251, 191, 36, 0.2);
  border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 100px;
  color: #fbbf24; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;
}
.brand-icon { font-size: 64px; color: #fbbf24; margin-bottom: 30px; display: block; filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.4)); }
.brand-content h1 { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 900; line-height: 1.1; margin-bottom: 24px; text-shadow: 0 4px 10px rgba(0,0,0,0.2); }
.highlight { color: #fbbf24; }
.brand-content p { font-size: 18px; color: rgba(255,255,255,0.7); line-height: 1.6; }

.feature-card {
  display: flex; gap: 16px; padding: 20px; background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; margin-bottom: 12px;
  backdrop-filter: blur(10px); transition: all 0.3s;
}
.feature-card:hover { transform: translateX(10px); background: rgba(255,255,255,0.08); border-color: rgba(251, 191, 36, 0.3); }
.feature-card i { font-size: 24px; color: #fbbf24; }
.feature-card strong { display: block; font-size: 15px; margin-bottom: 2px; }
.feature-card p { font-size: 13px; margin: 0; color: rgba(255,255,255,0.5); }

/* FORM SIDE */
.login-form-side {
  flex: 1; background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  padding: 40px; position: relative;
}
.login-form-container { width: 100%; max-width: 440px; padding: 20px; }

.back-link { 
  display: flex; align-items: center; gap: 4px;
  color: var(--text-sub); text-decoration: none; font-weight: 600; font-size: 14px;
  transition: all 0.2s;
}
.back-link:hover { color: var(--primary); transform: translateX(-4px); }

.theme-btn {
  width: 42px; height: 42px; border: 1px solid var(--border);
  background: var(--card-bg); color: var(--text);
  border-radius: 12px; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.theme-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--primary-soft); }

.form-header h2 { font-family: 'Playfair Display', serif; color: var(--text); font-size: 36px; margin-bottom: 4px; }
.form-header p { color: var(--text-sub); font-size: 14px; }

.input-group-custom { margin-bottom: 24px; }
.input-group-custom label { display: block; font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; }
.input-wrap {
  position: relative; transition: all 0.2s;
  background: var(--input-bg); border: 1.5px solid var(--border);
  border-radius: 16px; overflow: hidden;
}
.input-wrap:focus-within { border-color: var(--accent); background: var(--card-bg); box-shadow: 0 4px 20px -5px var(--primary-soft); }
.input-wrap i { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-sub); font-size: 18px; }
.input-wrap input {
  width: 100%; padding: 14px 16px 14px 48px;
  background: none; border: none; outline: none;
  color: var(--text); font-size: 15px; font-weight: 500;
}
.toggle-pw {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: var(--text-sub); cursor: pointer;
}

.error-box {
  background: #fef2f2; border: 1px solid #fee2e2; border-radius: 14px;
  padding: 14px 16px; color: #dc2626; font-size: 13px; font-weight: 600;
  display: flex; align-items: center; gap: 10px; margin-bottom: 24px;
}
.dark .error-box { background: rgba(220, 38, 38, 0.1); border-color: rgba(220, 38, 38, 0.2); color: #fca5a5; }

.btn-submit {
  width: 100%; padding: 16px;
  background: var(--brand-bg); color: #ffffff;
  border: none; border-radius: 16px; font-weight: 800; font-size: 16px;
  cursor: pointer; transition: all 0.3s;
  box-shadow: 0 10px 25px -10px var(--brand-bg);
}
.btn-submit:hover { transform: translateY(-3px); box-shadow: 0 15px 30px -10px var(--brand-bg); filter: brightness(1.1); }
.btn-submit:disabled { opacity: 0.7; transform: none; box-shadow: none; cursor: wait; }

.animate-fade-in { animation: fadeIn 0.8s ease backwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } }

@media (max-width: 991px) {
  .login-wrapper { flex-direction: column; }
  .login-brand { padding: 40px 20px; text-align: center; }
  .brand-content { margin: 0 auto; }
  .brand-features { display: none; }
  .sunda-motif { display: none; }
}
</style>
