<template>
  <div :class="['login-page', theme]">
    <div class="login-wrapper">
      <!-- Left: Branding -->
      <div class="login-brand d-none d-lg-flex">
        <div class="brand-content">
          <i class="bi bi-droplet-fill brand-icon"></i>
          <h1>Tirtha <span>Pawitan</span></h1>
          <p>Sistem Informasi Geospasial & AIoT untuk monitoring kelistarian sumber mata air Kabupaten Kuningan.</p>
          <div class="brand-features">
            <div class="feature"><i class="bi bi-geo-alt"></i><span>Peta GIS Interaktif</span></div>
            <div class="feature"><i class="bi bi-cpu"></i><span>Sensor IoT Real-time</span></div>
            <div class="feature"><i class="bi bi-shield-check"></i><span>Deteksi Anomali AI</span></div>
          </div>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="login-form-side">
        <div class="login-form-container">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <NuxtLink to="/" class="back-link"><i class="bi bi-arrow-left me-2"></i>Beranda</NuxtLink>
              <button class="theme-btn" @click="toggleTheme">
                <i :class="theme === 'light' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill'"></i>
              </button>
            </div>

          <div class="form-header">
            <h2>Masuk</h2>
            <p>Masukkan email dan password Anda untuk mengakses sistem.</p>
          </div>

          <form @submit.prevent="handleLogin">
            <div class="input-group-custom">
              <label for="email">Email</label>
              <div class="input-wrap">
                <i class="bi bi-envelope"></i>
                <input v-model="form.email" type="email" id="email" placeholder="admin@tirtha.id" required />
              </div>
            </div>

            <div class="input-group-custom">
              <label for="password">Password</label>
              <div class="input-wrap">
                <i class="bi bi-lock"></i>
                <input v-model="form.password" :type="showPw ? 'text' : 'password'" id="password" placeholder="••••••••" required />
                <button type="button" class="toggle-pw" @click="showPw = !showPw">
                  <i :class="showPw ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
            </div>

            <div v-if="error" class="error-box">
              <i class="bi bi-exclamation-circle"></i> {{ error }}
            </div>

            <button type="submit" class="btn-submit" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Memproses...' : 'Masuk' }}
            </button>
          </form>
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
    error.value = err.data?.statusMessage || 'Login gagal. Periksa kembali email dan password.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.login-page {
  font-family: 'Plus Jakarta Sans', sans-serif;
  min-height: 100vh;
  transition: background .3s, color .3s;
}

/* ===== LIGHT ===== */
.login-page.light {
  --bg: #ffffff; --bg-alt: #f1f5f9; --text: #0f172a; --text-sub: #64748b;
  --input-bg: #f8fafc; --input-border: #e2e8f0; --primary: #0ea5e9;
  --card-bg: #ffffff; --brand-bg: linear-gradient(135deg, #0c4a6e, #0369a1);
  --error-bg: #fef2f2; --error-border: #fecaca; --error-text: #dc2626;
}

/* ===== DARK ===== */
.login-page.dark {
  --bg: #0f172a; --bg-alt: #1e293b; --text: #f1f5f9; --text-sub: #94a3b8;
  --input-bg: rgba(15,23,42,.6); --input-border: rgba(255,255,255,.1); --primary: #38bdf8;
  --card-bg: #1e293b; --brand-bg: linear-gradient(135deg, #020617, #0f172a);
  --error-bg: rgba(239,68,68,.1); --error-border: rgba(239,68,68,.2); --error-text: #fca5a5;
}

.login-wrapper { display: flex; min-height: 100vh; }

/* Brand Side */
.login-brand {
  flex: 1;
  background: var(--brand-bg);
  display: flex; align-items: center; justify-content: center;
  padding: 60px;
  position: relative; overflow: hidden;
}
.login-brand::after {
  content: ''; position: absolute; top: -100px; right: -100px;
  width: 400px; height: 400px; border-radius: 50%;
  background: rgba(56,189,248,.1); filter: blur(80px);
}
.brand-content { position: relative; z-index: 2; color: white; max-width: 440px; }
.brand-icon { font-size: 56px; color: #38bdf8; display: block; margin-bottom: 24px; }
.brand-content h1 { font-size: 40px; font-weight: 900; margin-bottom: 16px; letter-spacing: -1px; }
.brand-content h1 span { color: #38bdf8; }
.brand-content p { color: rgba(255,255,255,.7); font-size: 16px; line-height: 1.7; margin-bottom: 36px; }
.brand-features { display: flex; flex-direction: column; gap: 14px; }
.feature { display: flex; align-items: center; gap: 12px; color: rgba(255,255,255,.6); font-size: 14px; font-weight: 500; }
.feature i { font-size: 18px; color: #38bdf8; }

/* Form Side */
.login-form-side {
  flex: 1;
  background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  padding: 40px;
}
.login-form-container { width: 100%; max-width: 420px; }
.back-link { color: var(--text-sub); text-decoration: none; font-size: 14px; font-weight: 500; transition: color .2s; }
.back-link:hover { color: var(--primary); }
.theme-btn {
  width: 36px; height: 36px; border: 1px solid var(--input-border);
  border-radius: 10px; background: var(--input-bg); color: var(--text);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}

.form-header { margin-bottom: 32px; }
.form-header h2 { font-size: 28px; font-weight: 800; color: var(--text); margin-bottom: 8px; }
.form-header p { color: var(--text-sub); font-size: 14px; }

.input-group-custom { margin-bottom: 20px; }
.input-group-custom label { display: block; font-size: 13px; font-weight: 600; color: var(--text-sub); margin-bottom: 8px; }
.input-wrap {
  position: relative; display: flex; align-items: center;
  background: var(--input-bg); border: 1px solid var(--input-border);
  border-radius: 12px; transition: border-color .2s;
}
.input-wrap:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(14,165,233,.1); }
.input-wrap > i { position: absolute; left: 14px; color: var(--text-sub); font-size: 16px; }
.input-wrap input {
  flex: 1; padding: 12px 14px 12px 42px;
  background: none; border: none; color: var(--text);
  font-size: 15px; outline: none;
}
.toggle-pw {
  position: absolute; right: 12px; background: none; border: none;
  color: var(--text-sub); cursor: pointer; display: flex; padding: 4px;
}

.error-box {
  padding: 12px 16px; background: var(--error-bg);
  border: 1px solid var(--error-border); border-radius: 10px;
  color: var(--error-text); font-size: 13px;
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 20px;
}

.btn-submit {
  width: 100%; padding: 14px;
  background: var(--primary); color: white; border: none;
  border-radius: 12px; font-weight: 700; font-size: 15px;
  cursor: pointer; transition: all .2s;
}
.btn-submit:hover { opacity: .9; transform: translateY(-1px); }
.btn-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

@media (max-width: 991px) {
  .login-form-side { padding: 24px; }
}
</style>
